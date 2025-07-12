
import type { Product, Seller, Buyer, QuoteRequest } from './types';
import { firebaseConfig } from './firebase';
import { cache } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, query, orderBy, Timestamp, updateDoc, where, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { createUserWithEmailAndPassword } from 'firebase/auth';


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
  const getArray = (field: any) => field?.arrayValue?.values?.map((v: any) => v.stringValue) || [];

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
    const getArray = (field: any) => field?.arrayValue?.values?.map((v: any) => v.stringValue) || [];

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

const mapFirestoreDocToQuoteRequest = (docSnapshot: any): QuoteRequest => {
    const data = docSnapshot.data();
    // Convert Firestore Timestamp to ISO string for consistency
    const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    
    return {
        id: docSnapshot.id,
        date: date,
        buyerName: data.buyerName || '',
        buyerEmail: data.buyerEmail || '',
        productId: data.productId || 'N/A',
        sellerId: data.sellerId || 'N/A',
        quantity: data.quantity || '',
        details: data.details || '',
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

export const categories = [
    { name: 'Raw Hair', icon: 'https://placehold.co/40x40' },
    { name: 'Virgin Hair', icon: 'https://placehold.co/40x40' },
    { name: 'Wigs', icon: 'https://placehold.co/40x40' },
    { name: 'Extensions', icon: 'https://placehold.co/40x40' },
    { name: 'Tools', icon: 'https://placehold.co/40x40' },
];

export async function getProducts(): Promise<Product[]> {
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getSellers(): Promise<Seller[]> {
    const sellersCollection = collection(db, 'sellers');
    const sellerSnapshot = await getDocs(sellersCollection);
    return sellerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seller));
}

export async function getBuyers(): Promise<Buyer[]> {
    const buyersCollection = collection(db, 'buyers');
    const buyerSnapshot = await getDocs(buyersCollection);
    return buyerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Buyer));
}


export async function getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    console.log(`Product with id ${id} not found in Firestore.`);
    return null;
}

export async function getSellerById(id: string): Promise<Seller | null> {
    const docRef = doc(db, 'sellers', id);
    const docSnap = await getDoc(docRef);
     if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Seller;
    }
    console.log(`Seller with id ${id} not found in Firestore.`);
    return null;
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const productsCollection = collection(db, 'products');
  const q = query(productsCollection, where("sellerId", "==", sellerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getBuyerById(id:string): Promise<Buyer | null> {
    const docRef = doc(db, 'buyers', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Buyer;
    }
    console.log(`Buyer with id ${id} not found in Firestore.`);
    return null;
}

export async function addQuoteRequest(data: Omit<QuoteRequest, 'id' | 'date'>) {
    try {
        const quoteCollectionRef = collection(db, 'quote-requests');
        await addDoc(quoteCollectionRef, {
            ...data,
            createdAt: serverTimestamp(), // Use server timestamp for creation date
        });
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export async function getQuoteRequests(): Promise<QuoteRequest[]> {
    try {
        const quoteCollectionRef = collection(db, 'quote-requests');
        const q = query(quoteCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(mapFirestoreDocToQuoteRequest);
    } catch (error) {
        console.error("Error fetching quote requests:", error);
        return [];
    }
}


export async function updateProduct(productId: string, data: Partial<Omit<Product, 'id' | 'images'>>, newImageFile: File | null) {
  const productRef = doc(db, "products", productId);

  try {
    // If there is a new image file, handle the upload process.
    if (newImageFile) {
      const storage = getStorage();
      
      // Get the existing product to find the old image URL for deletion
      const existingProductSnap = await getDoc(productRef);
      const existingProduct = existingProductSnap.data() as Product | undefined;
      const oldImageUrl = existingProduct?.images?.[0];

      // Upload the new image
      const newImageRef = ref(storage, `product-images/${productId}/${newImageFile.name}`);
      const uploadResult = await uploadBytes(newImageRef, newImageFile);
      const newImageUrl = await getDownloadURL(uploadResult.ref);

      // Update the product document with the new data AND the new image URL.
      await updateDoc(productRef, {
        ...data,
        images: [newImageUrl],
      });

      // If there was an old image, delete it from storage after the new one is uploaded and saved.
      if (oldImageUrl && oldImageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        try {
          const oldImageStorageRef = ref(storage, oldImageUrl);
          await deleteObject(oldImageStorageRef);
        } catch (deleteError) {
           console.error("Failed to delete old image, it might not exist or there was a permissions issue:", deleteError);
        }
      }
    } else {
      // If there's no new image, just update the text fields.
      await updateDoc(productRef, data);
    }
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function addVendor({ companyName, name, email, password, location, bio }: { companyName: string; name: string; email: string; password: string, location:string, bio: string }) {
  try {
    // We cannot create a user with the same email in the main auth context.
    // The createUserWithEmailAndPassword function uses the global `auth` instance.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a corresponding seller document in Firestore
    await setDoc(doc(db, "sellers", user.uid), {
      name: name,
      companyName: companyName,
      location: location,
      bio: bio,
      avatarUrl: `https://placehold.co/100x100?text=${name.charAt(0)}`,
      memberSince: new Date().toISOString(),
      productIds: [],
      contact: {
        email: user.email,
        phone: '', // Phone is optional, can be added later
      },
    });

    return { success: true, userId: user.uid };
  } catch (error) {
    console.error("Error adding vendor:", error);
    throw error; // Re-throw to be handled by the UI
  }
}
