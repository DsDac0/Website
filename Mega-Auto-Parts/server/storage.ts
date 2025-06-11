import {
  categories,
  products,
  carBrands,
  carModels,
  cartItems,
  orders,
  orderItems,
  contactMessages,
  adminUsers,
  type Category,
  type Product,
  type CarBrand,
  type CarModel,
  type CartItem,
  type Order,
  type OrderItem,
  type ContactMessage,
  type AdminUser,
  type InsertCartItem,
  type InsertOrder,
  type InsertOrderItem,
  type InsertContactMessage,
  type InsertAdminUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or, inArray, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Car brands and models
  getCarBrands(): Promise<CarBrand[]>;
  getCarModelsByBrand(brandId: number): Promise<CarModel[]>;
  
  // Products
  getProducts(filters?: {
    categoryId?: number;
    brandId?: number;
    search?: string;
    compatibleBrand?: string;
    compatibleModel?: string;
    compatibleYear?: string;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  
  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItems(orderItems: InsertOrderItem[]): Promise<OrderItem[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  
  // Contact
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Admin authentication
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  validateAdminPassword(username: string, password: string): Promise<AdminUser | null>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if data already exists
      const existingCategories = await db.select().from(categories).limit(1);
      if (existingCategories.length > 0) return;

      // Insert categories
      const categoryData = [
        { name: "Делови за мотор", nameEn: "Engine Parts", slug: "engine-parts", description: "Делови за мотор и систем за гориво", icon: "🔧" },
        { name: "Кочници", nameEn: "Brakes", slug: "brakes", description: "Кочни плочки, дискови и цилиндри", icon: "🛑" },
        { name: "Филтери", nameEn: "Filters", slug: "filters", description: "Масленец, воздушен и горивен филтер", icon: "🌪️" },
        { name: "Електрика", nameEn: "Electrical", slug: "electrical", description: "Батерии, свеќи и електрични делови", icon: "⚡" },
        { name: "Каросерија", nameEn: "Body Parts", slug: "body-parts", description: "Фарови, браници и делови за каросерија", icon: "🚗" },
        { name: "Гуми и Тркала", nameEn: "Tyres & Wheels", slug: "tyres-wheels", description: "Гуми, тркала и делови за ходување", icon: "🛞" },
        { name: "Климатизација", nameEn: "Air Conditioning", slug: "air-conditioning", description: "Делови за климатизација и греење", icon: "❄️" },
        { name: "Трансмисија", nameEn: "Transmission", slug: "transmission", description: "Квачило, менувач и трансмисија", icon: "⚙️" }
      ];

      await db.insert(categories).values(categoryData);

      // Insert car brands
      const brandData = [
        { name: "BMW", slug: "bmw" },
        { name: "Mercedes-Benz", slug: "mercedes-benz" },
        { name: "Audi", slug: "audi" },
        { name: "Volkswagen", slug: "volkswagen" },
        { name: "Hyundai", slug: "hyundai" },
        { name: "Kia", slug: "kia" },
        { name: "Toyota", slug: "toyota" },
        { name: "Honda", slug: "honda" },
        { name: "Ford", slug: "ford" },
        { name: "Opel", slug: "opel" },
        { name: "Peugeot", slug: "peugeot" },
        { name: "Renault", slug: "renault" },
        { name: "Citroën", slug: "citroen" },
        { name: "Fiat", slug: "fiat" },
        { name: "Škoda", slug: "skoda" },
        { name: "Seat", slug: "seat" },
        { name: "Mazda", slug: "mazda" },
        { name: "Nissan", slug: "nissan" },
        { name: "Mitsubishi", slug: "mitsubishi" },
        { name: "Subaru", slug: "subaru" }
      ];

      const insertedBrands = await db.insert(carBrands).values(brandData).returning();

      // Insert car models for popular Balkan brands
      const modelData = [];
      const brandMap = Object.fromEntries(insertedBrands.map(b => [b.slug, b.id]));

      // BMW Models
      const bmwModels = ["X1", "X3", "X5", "3 Series", "5 Series", "7 Series", "1 Series", "Z4"];
      bmwModels.forEach(model => {
        modelData.push({ brandId: brandMap["bmw"], name: model, slug: model.toLowerCase().replace(/\s+/g, "-") });
      });

      // Mercedes Models
      const mercedesModels = ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "ML"];
      mercedesModels.forEach(model => {
        modelData.push({ brandId: brandMap["mercedes-benz"], name: model, slug: model.toLowerCase().replace(/\s+/g, "-") });
      });

      // Hyundai Models - Popular in Balkans
      const hyundaiModels = ["i10", "i20", "i30", "i40", "Tucson", "Santa Fe", "Elantra", "Accent", "Genesis"];
      hyundaiModels.forEach(model => {
        modelData.push({ brandId: brandMap["hyundai"], name: model, slug: model.toLowerCase().replace(/\s+/g, "-") });
      });

      // Volkswagen Models
      const vwModels = ["Golf", "Passat", "Polo", "Tiguan", "Touran", "Jetta", "Beetle", "Arteon"];
      vwModels.forEach(model => {
        modelData.push({ brandId: brandMap["volkswagen"], name: model, slug: model.toLowerCase().replace(/\s+/g, "-") });
      });

      await db.insert(carModels).values(modelData);

      // Insert extensive product catalog with authentic Balkan automotive parts
      const productData = [
        // Engine Parts
        {
          name: "Кочни плочки Brembo Premium",
          description: "Висококвалитетни кочни плочки за европски возила. Одлична спирачка моќ и долготрајност.",
          price: "2850.00",
          categoryId: 2,
          imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "BRM-P50020",
          brand: "Brembo",
          compatibleBrands: ["BMW", "Mercedes-Benz", "Audi"],
          compatibleModels: ["3 Series", "C-Class", "A4"],
          compatibleYears: ["2015", "2016", "2017", "2018", "2019", "2020"]
        },
        {
          name: "Турбо пунач Garrett Motion GT1749V",
          description: "Оригинален турбо пунач за дизел мотори. Зголемена моќност и подобрена економичност.",
          price: "18500.00",
          categoryId: 1,
          imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "GTM-GT1749V",
          brand: "Garrett Motion",
          compatibleBrands: ["Volkswagen", "Škoda", "Seat"],
          compatibleModels: ["Golf", "Octavia", "Leon"],
          compatibleYears: ["2012", "2013", "2014", "2015", "2016"]
        },
        {
          name: "Масленец филтер Bosch Premium",
          description: "Висококвалитетен масленец филтер за заштита на мотор. Комплетна филтрација на масло.",
          price: "850.00",
          categoryId: 3,
          imageUrl: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "BSH-0451103318",
          brand: "Bosch",
          compatibleBrands: ["BMW", "Mercedes-Benz", "Audi", "Volkswagen"],
          compatibleModels: ["320d", "C220d", "A4 TDI", "Golf TDI"],
          compatibleYears: ["2010", "2011", "2012", "2013", "2014", "2015"]
        },
        {
          name: "Батерија Varta Blue Dynamic E11",
          description: "Автомобилска батерија 74Ah. Долготрајна и сигурна за сите временски услови.",
          price: "6500.00",
          categoryId: 4,
          imageUrl: "https://images.unsplash.com/photo-1609592067849-5b774eb4fa14?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "VARTA-E11-74AH",
          brand: "Varta",
          compatibleBrands: ["Hyundai", "Kia", "Toyota", "Honda"],
          compatibleModels: ["i30", "Ceed", "Corolla", "Civic"],
          compatibleYears: ["2012", "2013", "2014", "2015", "2016", "2017", "2018"]
        },
        {
          name: "Кочни дискови Zimmermann Sport",
          description: "Перфорирани спортски кочни дискови за подобрена перформанса при кочење.",
          price: "4200.00",
          categoryId: 2,
          imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "ZIM-100.3234.52",
          brand: "Zimmermann",
          compatibleBrands: ["BMW", "Mercedes-Benz"],
          compatibleModels: ["X3", "GLC"],
          compatibleYears: ["2016", "2017", "2018", "2019", "2020"]
        },
        {
          name: "Свеќи за палење NGK Laser Platinum",
          description: "Платински свеќи за палење со подолг животен век и подобра перформанса.",
          price: "1650.00",
          categoryId: 4,
          imageUrl: "https://images.unsplash.com/photo-1600586747245-a42b05b20afe?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "NGK-PFR7S8EG",
          brand: "NGK",
          compatibleBrands: ["Toyota", "Honda", "Mazda"],
          compatibleModels: ["Corolla", "Civic", "CX-5"],
          compatibleYears: ["2015", "2016", "2017", "2018", "2019"]
        },
        {
          name: "Амортизери Monroe OESpectrum",
          description: "Оригинални спецификации амортизери за комфорт и сигурност при возење.",
          price: "3200.00",
          categoryId: 6,
          imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "MON-G7440",
          brand: "Monroe",
          compatibleBrands: ["Ford", "Opel"],
          compatibleModels: ["Focus", "Astra"],
          compatibleYears: ["2014", "2015", "2016", "2017", "2018"]
        },
        {
          name: "Ремен за распоред Gates PowerGrip",
          description: "Висококвалитетен ремен за распоред на мотор со долг животен век.",
          price: "1850.00",
          categoryId: 1,
          imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "GTS-5455XS",
          brand: "Gates",
          compatibleBrands: ["Peugeot", "Citroën", "Renault"],
          compatibleModels: ["308", "C4", "Megane"],
          compatibleYears: ["2012", "2013", "2014", "2015", "2016"]
        },
        {
          name: "Воздушен филтер K&N Performance",
          description: "Спортски воздушен филтер за зголемена моќност и подобра респирација на мотор.",
          price: "2400.00",
          categoryId: 3,
          imageUrl: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "KN-33-2865",
          brand: "K&N",
          compatibleBrands: ["BMW", "Audi"],
          compatibleModels: ["320i", "A3"],
          compatibleYears: ["2013", "2014", "2015", "2016", "2017"]
        },
        {
          name: "Фар предна десна Hella",
          description: "Оригинален фар со LED технologija за подобра видливост и модерен изглед.",
          price: "8500.00",
          categoryId: 5,
          imageUrl: "https://images.unsplash.com/photo-1544967881-6ad5e8b4b7d8?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "HLA-1EL010845121",
          brand: "Hella",
          compatibleBrands: ["Volkswagen", "Škoda"],
          compatibleModels: ["Passat", "Superb"],
          compatibleYears: ["2015", "2016", "2017", "2018"]
        },
        // Additional Balkan-focused products
        {
          name: "Водна пумпа Febi Bilstein",
          description: "Оригинална водна пумпа за систем за ладење. Сигурна работа и долготрајност.",
          price: "3800.00",
          categoryId: 1,
          imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "FEBI-01289",
          brand: "Febi Bilstein",
          compatibleBrands: ["Mercedes-Benz", "BMW"],
          compatibleModels: ["E-Class", "5 Series"],
          compatibleYears: ["2009", "2010", "2011", "2012", "2013"]
        },
        {
          name: "Термостат Wahler 4055.87D",
          description: "Прецизен термостат за оптимална температура на мотор во сите услови.",
          price: "1250.00",
          categoryId: 1,
          imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "WAH-405587D",
          brand: "Wahler",
          compatibleBrands: ["Audi", "Volkswagen", "Škoda"],
          compatibleModels: ["A4", "Passat", "Octavia"],
          compatibleYears: ["2008", "2009", "2010", "2011", "2012"]
        },
        {
          name: "Генератор Bosch 0124525079",
          description: "Висококвалитетен алтернатор за стабилно напојување на електричната мрежа.",
          price: "12500.00",
          categoryId: 4,
          imageUrl: "https://images.unsplash.com/photo-1600586747245-a42b05b20afe?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "BSH-0124525079",
          brand: "Bosch",
          compatibleBrands: ["Ford", "Mazda"],
          compatibleModels: ["Mondeo", "6"],
          compatibleYears: ["2010", "2011", "2012", "2013", "2014"]
        },
        {
          name: "Квачило комплет Sachs 3000950711",
          description: "Комплетен сет за квачило со плоча, диск и лежиште за перфектна трансмисија.",
          price: "7800.00",
          categoryId: 8,
          imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "SACHS-3000950711",
          brand: "Sachs",
          compatibleBrands: ["Opel", "Chevrolet"],
          compatibleModels: ["Corsa", "Aveo"],
          compatibleYears: ["2006", "2007", "2008", "2009", "2010"]
        },
        {
          name: "Стартер Valeo 458178",
          description: "Моќен и сигурен стартер за брзо и лесно стартување на мотор.",
          price: "9500.00",
          categoryId: 4,
          imageUrl: "https://images.unsplash.com/photo-1600586747245-a42b05b20afe?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "VAL-458178",
          brand: "Valeo",
          compatibleBrands: ["Peugeot", "Citroën"],
          compatibleModels: ["207", "C3"],
          compatibleYears: ["2006", "2007", "2008", "2009", "2010", "2011"]
        },
        {
          name: "Гуми Michelin Primacy 4",
          description: "Летни гуми со одлична сцепка и економичност. Димензија 205/55R16.",
          price: "5500.00",
          categoryId: 6,
          imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "MICH-205-55R16-91H",
          brand: "Michelin",
          compatibleBrands: ["Toyota", "Honda", "Hyundai"],
          compatibleModels: ["Auris", "Civic", "i30"],
          compatibleYears: ["2012", "2013", "2014", "2015", "2016", "2017"]
        },
        {
          name: "Климатик компресор Denso 447220-3421",
          description: "Ефикасен компресор за систем за климатизација со тивка работа.",
          price: "15500.00",
          categoryId: 7,
          imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "DNS-4472203421",
          brand: "Denso",
          compatibleBrands: ["Toyota", "Lexus"],
          compatibleModels: ["Camry", "ES"],
          compatibleYears: ["2012", "2013", "2014", "2015", "2016"]
        },
        {
          name: "Спојка стабилизатор TRW JTS419",
          description: "Висококвалитетна спојка за стабилизатор за подобра стабилност при возење.",
          price: "680.00",
          categoryId: 6,
          imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "TRW-JTS419",
          brand: "TRW",
          compatibleBrands: ["Fiat", "Alfa Romeo"],
          compatibleModels: ["Punto", "Giulietta"],
          compatibleYears: ["2008", "2009", "2010", "2011", "2012"]
        },
        {
          name: "Горивен филтер Mann WK 820/17",
          description: "Прецизен горивен филтер за заштита на системот за впрскување.",
          price: "950.00",
          categoryId: 3,
          imageUrl: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "MANN-WK82017",
          brand: "Mann-Filter",
          compatibleBrands: ["BMW", "Mini"],
          compatibleModels: ["X1", "Cooper"],
          compatibleYears: ["2010", "2011", "2012", "2013", "2014"]
        },
        {
          name: "Браник предна Mercedes W204",
          description: "Оригинален предна браник за Mercedes C-Class W204 во одлична состојба.",
          price: "12800.00",
          categoryId: 5,
          imageUrl: "https://images.unsplash.com/photo-1544967881-6ad5e8b4b7d8?w=400&h=300&fit=crop",
          inStock: true,
          partNumber: "MB-W204-FB-OEM",
          brand: "Mercedes-Benz",
          compatibleBrands: ["Mercedes-Benz"],
          compatibleModels: ["C-Class"],
          compatibleYears: ["2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"]
        }
      ];

      await db.insert(products).values(productData);

      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(adminUsers).values({
        username: "admin",
        password: hashedPassword,
        email: "admin@megaautoparts.mk",
        firstName: "Admin",
        lastName: "User",
        isActive: true
      });

      console.log("Database initialized with automotive parts catalog");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  // Car brands and models
  async getCarBrands(): Promise<CarBrand[]> {
    return await db.select().from(carBrands);
  }

  async getCarModelsByBrand(brandId: number): Promise<CarModel[]> {
    return await db.select().from(carModels).where(eq(carModels.brandId, brandId));
  }

  // Products
  async getProducts(filters?: {
    categoryId?: number;
    brandId?: number;
    search?: string;
    compatibleBrand?: string;
    compatibleModel?: string;
    compatibleYear?: string;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    const conditions = [];

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`),
          like(products.partNumber, `%${filters.search}%`)
        )
      );
    }

    if (filters?.compatibleBrand) {
      conditions.push(like(products.compatibleBrands, `%${filters.compatibleBrand}%`));
    }

    if (filters?.compatibleModel) {
      conditions.push(like(products.compatibleModels, `%${filters.compatibleModel}%`));
    }

    if (filters?.compatibleYear) {
      conditions.push(like(products.compatibleYears, `%${filters.compatibleYear}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).limit(8);
  }

  // Cart
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.sessionId, item.sessionId), eq(cartItems.productId, item.productId)))
      .limit(1);

    if (existingItem.length > 0) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem[0].quantity + item.quantity })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    return result.rowCount > 0;
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async addOrderItems(orderItems: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(orderItems).returning();
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          items: items.map(item => ({
            ...item.order_items,
            product: item.products
          }))
        };
      })
    );
    
    return ordersWithItems;
  }

  // Contact
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  // Admin authentication
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin;
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const [newAdmin] = await db
      .insert(adminUsers)
      .values({ ...admin, password: hashedPassword })
      .returning();
    return newAdmin;
  }

  async validateAdminPassword(username: string, password: string): Promise<AdminUser | null> {
    const admin = await this.getAdminByUsername(username);
    if (!admin || !admin.isActive) return null;

    const isValid = await bcrypt.compare(password, admin.password);
    return isValid ? admin : null;
  }
}

export const storage = new DatabaseStorage();