import type { Product, Seller, Buyer, QuoteRequest } from './types';
import { firebaseConfig } from './firebase';
import { cache } from 'react';

// Helper to map a single Firestore document to our application's data types
const mapFirestoreDoc = (doc: any, mapper: (doc: any) => any) => {
    if (!doc || !doc.fields) return null;
    return mapper(doc);
};


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

const mapFirestoreDocToSeller = (doc: any): Seller => {
    const fields = doc.fields;
    const contactFields = fields.contact?.mapValue?.fields || {};
    const getString = (field: any) => field?.stringValue || '';
    const getArray = (field: any) => field?.arrayValue?.values.map((v: any) => v.stringValue) || [];

    return {
        id: doc.name.split('/').pop() || '',
        name: getString(fields.name),
        companyName: getString(fields.companyName),
        location: getString(fields.location),
        avatarUrl: getString(fields.avatarUrl),
        bio: getString(fields.bio),
        memberSince: getString(fields.memberSince),
        productIds: getArray(fields.productIds),
        contact: {
            email: getString(contactFields.email),
            phone: getString(contactFields.phone),
            website: getString(contactFields.website),
        },
    };
};

const mapFirestoreDocToBuyer = (doc: any): Buyer => {
    const fields = doc.fields;
    const contactFields = fields.contact?.mapValue?.fields || {};
    const getString = (field: any) => field?.stringValue || '';

    return {
        id: doc.name.split('/').pop() || '',
        name: getString(fields.name),
        companyName: getString(fields.companyName),
        location: getString(fields.location),
        avatarUrl: getString(fields.avatarUrl),
        bio: getString(fields.bio),
        memberSince: getString(fields.memberSince),
        contact: {
            email: getString(contactFields.email),
        },
    };
};

const getCollection = cache(async (collectionName: string): Promise<any[]> => {
    const projectId = firebaseConfig.projectId;
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

const getDocument = cache(async (collectionName: string, docId: string): Promise<any | null> => {
    const projectId = firebaseConfig.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate every hour
        if (!response.ok) {
             if (response.status === 404) {
                return null; // Document not found
            }
            const error = await response.json();
            console.error(`Error fetching document ${collectionName}/${docId}:`, error.error.message);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Network error fetching document ${collectionName}/${docId}:`, error);
        return null;
    }
});


const mockSellers: Seller[] = [
  {
    id: 'seller-1',
    name: 'Aisha Bella',
    companyName: 'Bella Hair Imports',
    location: 'Lagos, Nigeria',
    avatarUrl: 'https://placehold.co/100x100',
    bio: 'Specializing in premium, ethically sourced raw Nigerian hair. With over 10 years of experience, we provide the highest quality bundles for wigs and extensions.',
    memberSince: '2018-05-15',
    productIds: ['prod-1'],
    contact: { email: 'aisha@bellahair.ng', website: 'bellahair.ng' },
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

const mockBuyers: Buyer[] = [
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
        console.log("No products found in Firestore, returning mock data.");
        return mockProducts;
    }
    return docs.map(mapFirestoreDocToProduct);
}

export async function getSellers(): Promise<Seller[]> {
    const docs = await getCollection('sellers');
     if (!docs || docs.length === 0) {
        console.log("No sellers found in Firestore, returning mock data.");
        return mockSellers;
    }
    return docs.map(mapFirestoreDocToSeller);
}

export async function getBuyers(): Promise<Buyer[]> {
    const docs = await getCollection('buyers');
    if (!docs || docs.length === 0) {
        console.log("No buyers found in Firestore, returning mock data.");
        return mockBuyers;
    }
    return docs.map(mapFirestoreDocToBuyer);
}


export async function getProductById(id: string): Promise<Product | null> {
    const doc = await getDocument('products', id);
    if (!doc) {
        console.log(`Product with id ${id} not found in Firestore, checking mock data.`);
        const mockProduct = mockProducts.find(p => p.id === id) || null;
        if (!mockProduct) {
             console.error(`Product with id ${id} not found in mock data either.`);
             return null;
        }
        return mockProduct;
    }
    return mapFirestoreDoc(doc, mapFirestoreDocToProduct);
}

export async function getSellerById(id: string): Promise<Seller | null> {
    const doc = await getDocument('sellers', id);
    if (!doc) {
        console.log(`Seller with id ${id} not found in Firestore, checking mock data.`);
        return mockSellers.find(s => s.id === id) || null;
    }
    return mapFirestoreDoc(doc, mapFirestoreDocToSeller);
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const allProducts = await getProducts();
  return allProducts.filter(p => p.sellerId === sellerId);
}

export async function getBuyerById(id:string): Promise<Buyer | null> {
    const doc = await getDocument('buyers', id);
    if (!doc) {
        console.log(`Buyer with id ${id} not found in Firestore, checking mock data.`);
        return mockBuyers.find(b => b.id === id) || null;
    }
    return mapFirestoreDoc(doc, mapFirestoreDocToBuyer);
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
