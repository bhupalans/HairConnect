import type { Product, Seller, Buyer, QuoteRequest } from './types';
import { firebaseConfig } from './firebase';
import { cache } from 'react';

// Helper to map Firestore document format to our application's data types
const mapFirestoreDocToProduct = (doc: any): Product => {
  const fields = doc.fields;
  const specFields = fields.specs?.mapValue?.fields || {};

  // Helper to safely extract string values from Firestore's field format
  const getString = (field: any) => field?.stringValue || '';
  const getNumber = (field: any) => parseFloat(field?.doubleValue || field?.integerValue || '0');
  const getArray = (field: any) => field?.arrayValue?.values.map((v: any) => v.stringValue) || [];

  return {
    id: doc.name.split('/').pop() || '',
    name: getString(fields.name),
    description: getString(fields.description),
    price: getNumber(fields.price),
    sellerId: getString(fields.sellerId),
    category: getString(fields.category) as Product['category'],
    images: getArray(fields.images),
    specs: {
      type: getString(specFields.type),
      length: getString(specFields.length),
      color: getString(specFields.color),
      texture: getString(specFields.texture),
      origin: getString(specFields.origin),
    },
  };
};


const getCollection = cache(async (collectionName: string): Promise<any[]> => {
    const projectId = firebaseConfig.projectId;
    if (!projectId || projectId.startsWith('PASTE_YOUR')) {
        console.error("Firebase Project ID is missing from your configuration in 'src/lib/firebase.ts'. Data fetching will fail.");
        return [];
    }
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate every hour
        if (!response.ok) {
            const error = await response.json();
            console.error(`Error fetching ${collectionName}:`, error.error.message);
            return [];
        }
        const data = await response.json();
        return data.documents || [];
    } catch (error) {
        console.error(`Network error fetching ${collectionName}:`, error);
        return [];
    }
});


export const sellers: Seller[] = [
  {
    id: 'seller-1',
    name: 'Aisha Bella',
    companyName: 'Bella Hair Imports',
    location: 'Lagos, Nigeria',
    avatarUrl: 'https://placehold.co/100x100',
    bio: 'Specializing in premium, ethically sourced raw Nigerian hair. With over 10 years of experience, we provide the highest quality bundles for wigs and extensions.',
    memberSince: '2018-05-15',
    productIds: ['prod-1', 'prod-2'],
    contact: { email: 'aisha@bellahair.ng', website: 'bellahair.ng' },
  },
  {
    id: 'seller-2',
    name: 'Lien Nguyen',
    companyName: 'Vietnamese Silk Hair',
    location: 'Hanoi, Vietnam',
    avatarUrl: 'https://placehold.co/100x100',
    bio: 'Authentic Vietnamese hair, known for its silky texture and durability. We offer a wide range of lengths and natural colors, direct from local collectors.',
    memberSince: '2020-01-20',
    productIds: ['prod-3'],
    contact: { email: 'lien@vnsilkhair.com' },
  },
  {
    id: 'seller-3',
    name: 'Isabella Rossi',
    companyName: 'Euro Weaves Co.',
    location: 'Milan, Italy',
    avatarUrl: 'https://placehold.co/100x100',
    bio: 'Luxury European hair extensions and custom wigs. Our hair is sourced from Eastern Europe and is perfect for high-end styling and coloring.',
    memberSince: '2019-11-02',
    productIds: ['prod-4'],
    contact: { email: 'isabella@euroweaves.it', phone: '+39 123 456 7890' },
  },
];

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Premium Nigerian Raw Wavy Bundles',
    description: '100% unprocessed raw hair from Nigeria. Natural wave pattern with a medium luster. Can be bleached to 613 and styled as desired. Each bundle is 100g.',
    price: 85.00,
    sellerId: 'seller-1',
    category: 'Raw Hair',
    images: ['https://placehold.co/600x600', 'https://placehold.co/600x600', 'https://placehold.co/600x600'],
    specs: {
      type: 'Bundle',
      length: '18 inches',
      color: 'Natural Black (1B)',
      texture: 'Natural Wavy',
      origin: 'Nigeria',
    },
  },
];

export const buyers: Buyer[] = [
    {
        id: 'buyer-1',
        name: 'Chloe Kim',
        companyName: 'Glamour Locks Salon',
        location: 'Los Angeles, USA',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'High-end salon in Beverly Hills looking for top-tier virgin and raw hair for our exclusive clientele. We prioritize quality and ethical sourcing.',
        memberSince: '2021-02-10',
        contact: { email: 'chloe@glamourlocks.com' },
    },
    {
        id: 'buyer-2',
        name: 'Fatou Diallo',
        companyName: 'Parisian Wigs Boutique',
        location: 'Paris, France',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'We create custom medical and fashion wigs. Seeking durable, high-density hair that can withstand extensive coloring and styling.',
        memberSince: '2022-07-01',
        contact: { email: 'fatou.d@pariswigs.fr' },
    },
];

export const quoteRequests: QuoteRequest[] = [];


export const categories = [
    { name: 'Raw Hair', icon: 'https://placehold.co/40x40' },
    { name: 'Virgin Hair', icon: 'https://placehold.co/40x40' },
    { name: 'Wigs', icon: 'https://placehold.co/40x40' },
    { name: 'Extensions', icon: 'https://placehold.co/40x40' },
    { name: 'Tools', icon: 'https://placehold.co/40x40' },
];

export async function getProducts(): Promise<Product[]> {
    const docs = await getCollection('products');
    if (!docs || docs.length === 0) {
        // Return mock data if firestore is empty for demonstration purposes
        console.log("No products found in Firestore, returning mock data.");
        return mockProducts;
    }
    return docs.map(mapFirestoreDocToProduct);
}


export function getProductById(id: string) {
  return mockProducts.find(p => p.id === id);
}

export function getSellerById(id: string) {
  return sellers.find(s => s.id === id);
}

export function getProductsBySeller(sellerId: string) {
  return mockProducts.filter(p => p.sellerId === sellerId);
}

export function getBuyerById(id:string) {
    return buyers.find(b => b.id === id);
}

export function addQuoteRequest(data: Omit<QuoteRequest, 'id' | 'date'>) {
    const newRequest: QuoteRequest = {
        id: `quote-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        date: new Date().toISOString(),
        ...data
    };
    quoteRequests.push(newRequest);
}

export function getQuoteRequests() {
    return quoteRequests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
