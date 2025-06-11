import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCartItemSchema, insertOrderSchema, insertContactMessageSchema } from "@shared/schema";
import { setupAuth, requireAdmin, checkAuth } from "./auth";
import passport from "passport";
import Stripe from "stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { sendEmail, generateOrderConfirmationEmail } from "./sendgrid";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Admin authentication routes
  app.post("/api/admin/login", passport.authenticate("local"), (req, res) => {
    res.json({
      success: true,
      user: req.user,
      message: "Успешна најава"
    });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Грешка при одјава" });
      }
      res.json({ success: true, message: "Успешна одјава" });
    });
  });

  app.get("/api/admin/check", checkAuth);

  // Admin protected routes
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Грешка при вчитување на нарачки" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Car brands and models
  app.get("/api/car-brands", async (req, res) => {
    try {
      const brands = await storage.getCarBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car brands" });
    }
  });

  app.get("/api/car-models/:brandId", async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      if (isNaN(brandId)) {
        return res.status(400).json({ message: "Invalid brand ID" });
      }
      
      const models = await storage.getCarModelsByBrand(brandId);
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car models" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        brandId: req.query.brandId ? parseInt(req.query.brandId as string) : undefined,
        search: req.query.search as string,
        compatibleBrand: req.query.compatibleBrand as string,
        compatibleModel: req.query.compatibleModel as string,
        compatibleYear: req.query.compatibleYear as string,
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      if (isNaN(id) || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid cart item ID or quantity" });
      }

      const updatedItem = await storage.updateCartItem(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }

      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart/clear/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }
    
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "mkd", // Macedonian Denar
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // PayPal routes
  app.get("/setup", loadPaypalDefault);
  app.post("/order", createPaypalOrder);
  app.post("/order/:orderID/capture", capturePaypalOrder);

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      const validatedOrder = insertOrderSchema.parse(order);
      const createdOrder = await storage.createOrder(validatedOrder);
      
      if (items && items.length > 0) {
        const orderItems = items.map((item: any) => ({
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }));
        
        await storage.addOrderItems(orderItems);
        
        // Send email confirmation
        const orderWithItems = {
          ...createdOrder,
          items: items
        };
        
        const emailParams = generateOrderConfirmationEmail(orderWithItems);
        await sendEmail(emailParams);
      }

      res.status(201).json(createdOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Contact
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send contact message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
