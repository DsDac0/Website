export interface FilterState {
  categoryId?: number;
  brandId?: number;
  search?: string;
  compatibleBrand?: string;
  compatibleModel?: string;
  compatibleYear?: string;
}

export interface CartState {
  items: CartItemWithProduct[];
  total: number;
  itemCount: number;
}

export interface CartItemWithProduct {
  id: number;
  sessionId: string;
  productId: number;
  quantity: number;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    description?: string;
    price: string;
    categoryId: number;
    imageUrl?: string;
    inStock?: boolean;
    partNumber?: string;
    brand?: string;
  };
}

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cash' | 'card' | 'bank';
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}
