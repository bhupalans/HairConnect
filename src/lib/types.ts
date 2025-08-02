

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerId: string;
  category: 'Raw Hair' | 'Virgin Hair' | 'Wigs' | 'Extensions' | 'Tools';
  images: ProductImage[];
  specs: {
    type: string;
    length: string;
    color: string;
    texture: string;
    origin: string;
  };
}

export interface Seller {
  id: string;
  name: string;
  companyName: string;
  location: string;
  avatarUrl: string;
  bio: string;
  memberSince: string;
  isVerified: boolean;
  productIds: string[];
  contact: {
    email: string;
    phone?: string;
    website?: string;
  }
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
}

export interface Buyer {
  id: string;
  name: string;
  companyName?: string;
  location: string;
  avatarUrl: string;
  bio: string;
  memberSince: string;
  isVerified: boolean;
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  savedSellerIds?: string[];
  lastActivity?: string; // ISO date string
  quoteRequestCount?: number;
  buyerType?: 'salon' | 'distributor' | 'stylist' | 'retailer' | 'other';
  yearsInBusiness?: '0-2' | '2-5' | '5-10' | '10+';
}


export interface QuoteRequest {
  id: string;
  date: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  productId: string;
  sellerId: string;
  quantity: string;
  details?: string;
  status: 'new' | 'viewed' | 'responded' | 'archived';
  productName?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

// Used to pass data from registration form to the processing page
export interface BuyerRegistrationData {
  name: string;
  companyName?: string;
  email: string;
  password: string;
  country: string;
  city: string;
  phoneCode?: string;
  localPhone?: string;
  bio: string;
}
