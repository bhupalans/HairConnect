
export interface ProductImage {
  url: string;
  altText: string;
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
  productIds: string[];
  contact: {
    email: string;
    phone?: string;
    website?: string;
  }
}

export interface Buyer {
  id: string;
  name: string;
  companyName?: string;
  location: string;
  avatarUrl: string;
  bio: string;
  memberSince: string;
  contact: {
    email: string;
  }
}

export interface QuoteRequest {
  id: string;
  date: string;
  buyerName: string;
  buyerEmail: string;
  productId: string;
  sellerId: string;
  quantity: string;
  details?: string;
  isRead: boolean;
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

export interface SourcingRequest {
    id: string;
    buyerId: string;
    buyerName: string;
    buyerCompanyName: string;
    requestDetails: string;
    datePosted: string;
    status: 'active' | 'closed';
}
