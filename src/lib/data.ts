
import type { Product, Seller, Buyer, QuoteRequest } from './types';
import { cache } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, query, orderBy, Timestamp, updateDoc, where, setDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { createUserWithEmailAndPassword } from 'firebase/auth';


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

export const categories = [
    { name: 'Raw Hair', icon: 'https://placehold.co/40x40' },
    { name: 'Virgin Hair', icon: 'https://placehold.co/40x40' },
    { name: 'Wigs', icon: 'https://placehold.co/40x40' },
    { name: 'Extensions', icon: 'https://placehold.co/40x40' },
    { name: 'Tools', icon: 'https://placehold.co/40x40' },
];

export const getProducts = cache(async (): Promise<Product[]> => {
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
});

export const getSellers = cache(async (): Promise<Seller[]> => {
    const sellersCollection = collection(db, 'sellers');
    const sellerSnapshot = await getDocs(sellersCollection);
    return sellerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seller));
});

export const getBuyers = cache(async (): Promise<Buyer[]> => {
    const buyersCollection = collection(db, 'buyers');
    const buyerSnapshot = await getDocs(buyersCollection);
    return buyerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Buyer));
});


export const getProductById = cache(async (id: string): Promise<Product | null> => {
    if (!id) return null;
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    console.log(`Product with id ${id} not found in Firestore.`);
    return null;
});

export const getSellerById = cache(async (id: string): Promise<Seller | null> => {
    if (!id) return null;
    const docRef = doc(db, 'sellers', id);
    const docSnap = await getDoc(docRef);
     if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Seller;
    }
    console.log(`Seller with id ${id} not found in Firestore.`);
    return null;
});

export const getProductsBySeller = cache(async (sellerId: string): Promise<Product[]> => {
  if (!sellerId) return [];
  const productsCollection = collection(db, 'products');
  const q = query(productsCollection, where("sellerId", "==", sellerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
});

export const getBuyerById = cache(async (id:string): Promise<Buyer | null> => {
    if (!id) return null;
    const docRef = doc(db, 'buyers', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Buyer;
    }
    console.log(`Buyer with id ${id} not found in Firestore.`);
    return null;
});

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
  const dataToUpdate: any = { ...data };

  try {
    const storage = getStorage();
    
    // Get the existing product to find the sellerId and old image URL
    const existingProductSnap = await getDoc(productRef);
    if (!existingProductSnap.exists()) {
        throw new Error("Product not found to update.");
    }
    const existingProductData = existingProductSnap.data() as Product;
    const sellerId = existingProductData.sellerId;

    // If there is a new image file, handle the upload and old image deletion.
    if (newImageFile) {
      const oldImageUrl = existingProductData?.images?.[0];

      // Upload the new image to the path that matches the security rules: products/{userId}/{fileName}
      const newImageRef = ref(storage, `products/${sellerId}/${newImageFile.name}`);
      const uploadResult = await uploadBytes(newImageRef, newImageFile);
      const newImageUrl = await getDownloadURL(uploadResult.ref);
      
      dataToUpdate.images = [newImageUrl];

      // If there was an old image, and it's a Firebase Storage URL, delete it.
      if (oldImageUrl && oldImageUrl.includes('firebasestorage.googleapis.com')) {
          try {
            // Create a ref from the full URL
            const oldImageStorageRef = ref(storage, oldImageUrl);
            await deleteObject(oldImageStorageRef);
          } catch (deleteError: any) {
             // It's okay if deletion fails (e.g., file not found); log it and continue.
             console.warn("Could not delete old image, it may have already been removed:", deleteError.code);
          }
      }
    }

    // Update the Firestore document with the new data.
    await updateDoc(productRef, dataToUpdate);

  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(productId: string) {
    const productRef = doc(db, "products", productId);
    const storage = getStorage();

    try {
        // Get the product document to find the image URL
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) {
            throw new Error("Product not found");
        }
        const productData = productSnap.data() as Product;
        const imageUrl = productData.images?.[0];

        // Delete the document from Firestore
        await deleteDoc(productRef);

        // If an image URL exists, delete the image from Storage
        if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        }
    } catch (error) {
        console.error("Error deleting product and its assets:", error);
        throw error;
    }
}


export async function addVendor({ companyName, name, email, password, location, bio }: { companyName: string; name: string; email: string; password: string, location:string, bio: string }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

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
        phone: '', 
      },
    });

    return { success: true, userId: user.uid };
  } catch (error) {
    console.error("Error adding vendor:", error);
    throw error;
  }
}

export async function updateVendor(vendorId: string, data: Partial<Seller>) {
    const vendorRef = doc(db, "sellers", vendorId);
    try {
        await updateDoc(vendorRef, data);
    } catch (error) {
        console.error("Error updating vendor:", error);
        throw error;
    }
}

export async function deleteVendor(vendorId: string) {
    const vendorRef = doc(db, "sellers", vendorId);
    try {
        await deleteDoc(vendorRef);
    } catch (error) {
        console.error("Error deleting vendor:", error);
        throw error;
    }
}

export async function addBuyer({ companyName, name, email, location, bio }: { companyName?: string; name: string; email: string; location:string, bio: string }) {
    const buyerCollectionRef = collection(db, 'buyers');
    try {
        await addDoc(buyerCollectionRef, {
            name,
            companyName: companyName || '',
            location,
            bio,
            avatarUrl: `https://placehold.co/100x100?text=${name.charAt(0)}`,
            memberSince: new Date().toISOString(),
            contact: {
                email: email,
            },
        });
    } catch (error) {
        console.error("Error adding buyer:", error);
        throw error;
    }
}

export async function updateBuyer(buyerId: string, data: Partial<Buyer>) {
    const buyerRef = doc(db, "buyers", buyerId);
    try {
        await updateDoc(buyerRef, data);
    } catch (error) {
        console.error("Error updating buyer:", error);
        throw error;
    }
}

export async function deleteBuyer(buyerId: string) {
    const buyerRef = doc(db, "buyers", buyerId);
    try {
        await deleteDoc(buyerRef);
    } catch (error) {
        console.error("Error deleting buyer:", error);
        throw error;
    }
}

    