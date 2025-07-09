export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerId: string;
  category: 'Raw Hair' | 'Virgin Hair' | 'Wigs' | 'Extensions' | 'Tools';
  images: string[];
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
