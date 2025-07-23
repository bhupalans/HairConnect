
import type { Product, Seller, Buyer, QuoteRequest, ContactMessage, ProductImage } from './types';
import { unstable_noStore as noStore } from 'next/cache';
import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, query, orderBy, Timestamp, updateDoc, where, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { generateAltText } from '@/ai/flows/generate-alt-text-flow';


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
        isRead: data.isRead || false,
        productName: data.productName || 'General Inquiry',
    };
};

export const categories = [
    { name: 'Raw Hair', icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-shrink'%3E%3Cpath d='m9 9-6 6V9h6'%3E%3C/path%3E%3Cpath d='m15 15 6-6v6h-6'%3E%3C/path%3E%3Cpath d='M21 3 3 21'%3E%3C/path%3E%3C/svg%3E` },
    { name: 'Virgin Hair', icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-gem'%3E%3Cpath d='M6 3h12l4 6-10 13L2 9Z'%3E%3C/path%3E%3Cpath d='M12 22V9'%3E%3C/path%3E%3Cpath d='m2 9h20'%3E%3C/path%3E%3C/svg%3E` },
    { name: 'Wigs', icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-user-round'%3E%3Ccircle cx='12' cy='8' r='5'%3E%3C/circle%3E%3Cpath d='M20 21a8 8 0 0 0-16 0'%3E%3C/path%3E%3C/svg%3E` },
    { name: 'Extensions', icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-move-up'%3E%3Cpath d='M8 6L12 2L16 6'%3E%3C/path%3E%3Cpath d='M12 2V22'%3E%3C/path%3E%3C/svg%3E` },
    { name: 'Tools', icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-scissors'%3E%3Ccircle cx='6' cy='6' r='3'%3E%3C/circle%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Cpath d='M20 4L8.12 15.88'%3E%3C/path%3E%3Cpath d='M14.47 14.48L20 20'%3E%3C/path%3E%3Cpath d='M8.12 8.12L12 12'%3E%3C/path%3E%3C/svg%3E` },
];

const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const getProducts = async (): Promise<Product[]> => {
    noStore();
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getSellers = async (): Promise<Seller[]> => {
    noStore();
    const sellersCollection = collection(db, 'sellers');
    const sellerSnapshot = await getDocs(sellersCollection);
    return sellerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seller));
};

export const getBuyers = async (): Promise<Buyer[]> => {
    noStore();
    const buyersCollection = collection(db, 'buyers');
    const buyerSnapshot = await getDocs(buyersCollection);
    return buyerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Buyer));
};


export const getProductById = async (id: string): Promise<Product | null> => {
    noStore();
    if (!id) return null;
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    console.log(`Product with id ${id} not found in Firestore.`);
    return null;
};

export const getSellerById = async (id: string): Promise<Seller | null> => {
    noStore();
    if (!id) return null;
    const docRef = doc(db, 'sellers', id);
    const docSnap = await getDoc(docRef);
     if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Seller;
    }
    console.log(`Seller with id ${id} not found in Firestore.`);
    return null;
};

export const getProductsBySeller = async (sellerId: string): Promise<Product[]> => {
  noStore();
  if (!sellerId) return [];
  const productsCollection = collection(db, 'products');
  const q = query(productsCollection, where("sellerId", "==", sellerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getBuyerById = async (id:string): Promise<Buyer | null> => {
    noStore();
    if (!id) return null;
    const docRef = doc(db, 'buyers', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Buyer;
    }
    console.log(`Buyer with id ${id} not found in Firestore.`);
    return null;
};

export async function addQuoteRequest(data: Omit<QuoteRequest, 'id' | 'date' | 'isRead'>) {
    try {
        const quoteCollectionRef = collection(db, 'quote-requests');
        await addDoc(quoteCollectionRef, {
            ...data,
            isRead: false, // Set new requests as unread
            createdAt: serverTimestamp(), // Use server timestamp for creation date
        });
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export async function getQuoteRequests(): Promise<QuoteRequest[]> {
    noStore();
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

export async function getQuoteRequestsBySeller(sellerId: string): Promise<QuoteRequest[]> {
    noStore();
    if (!sellerId) return [];
    try {
        const quotesRef = collection(db, "quote-requests");
        const q = query(quotesRef, where("sellerId", "==", sellerId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(mapFirestoreDocToQuoteRequest);
    } catch (error) {
        console.error("Error fetching quote requests for seller:", error);
        return [];
    }
}

export async function markQuoteRequestsAsRead(sellerId: string): Promise<void> {
    if (!sellerId) return;
    try {
        const quotesRef = collection(db, "quote-requests");
        const q = query(quotesRef, where("sellerId", "==", sellerId), where("isRead", "==", false));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return; // No unread requests to mark
        }

        const batch = writeBatch(db);
        querySnapshot.forEach(docSnapshot => {
            batch.update(docSnapshot.ref, { isRead: true });
        });

        await batch.commit();
    } catch (error) {
        console.error("Error marking quote requests as read:", error);
        // We don't re-throw here because failing to mark as read is not a critical UI error.
        // The user can still view the requests. We just log it.
    }
}

export async function addProduct(
  data: Omit<Product, 'id' | 'images' | 'sellerId'>,
  imageFiles: File[],
  sellerId: string
) {
  if (!sellerId) {
    throw new Error("User is not authenticated. Cannot add product.");
  }
  
  const storage = getStorage();
  const productImages: ProductImage[] = [];
  
  try {
    const hint = `${data.specs.color} ${data.specs.texture} ${data.category}`;
    
    // Step 1: Upload images, generate alt text, and get download URLs
    const uploadAndProcessPromises = imageFiles.map(async (file) => {
      // Upload
      const imageRef = ref(storage, `products/${sellerId}/${Date.now()}-${file.name}`);
      const uploadResult = await uploadBytes(imageRef, file);
      const url = await getDownloadURL(uploadResult.ref);
      
      // Generate Alt Text
      const dataUri = await fileToDataURI(file);
      const { altText } = await generateAltText({ photoDataUri: dataUri, hint });
      
      return { url, alt: altText };
    });
    
    const resolvedImages = await Promise.all(uploadAndProcessPromises);
    productImages.push(...resolvedImages);

    // Step 2: Prepare the document for Firestore
    const productsCollection = collection(db, 'products');
    const productData = {
      ...data,
      sellerId: sellerId,
      images: productImages, // Save array of {url, alt}
    };
    
    // Step 3: Write the document to Firestore
    await addDoc(productsCollection, productData);
    
  } catch (error) {
    console.error("Error during product creation process:", error);
    
    // If Firestore write fails, clean up any orphaned images.
    if (productImages.length > 0) {
      console.log("Attempting to clean up orphaned images after Firestore error...");
      const deletePromises = productImages.map(img => {
        try {
          const imageRefToDelete = ref(storage, img.url);
          return deleteObject(imageRefToDelete);
        } catch (cleanupError) {
          console.error(`CRITICAL: Failed to create ref for orphaned image URL: ${img.url}. Manual deletion may be required.`, cleanupError);
          return Promise.resolve();
        }
      });
      await Promise.allSettled(deletePromises);
      console.log("Orphaned image cleanup complete.");
    }
    
    throw error;
  }
}


export async function updateProduct(
  productId: string,
  data: Partial<Omit<Product, 'id' | 'images'>>,
  newImageFiles: File[],
  imagesToRemove: string[],
  existingImageUrls: string[]
) {
  const productRef = doc(db, "products", productId);
  const storage = getStorage();

  try {
    const existingProductSnap = await getDoc(productRef);
    if (!existingProductSnap.exists()) {
      throw new Error("Product not found to update.");
    }
    const existingProductData = existingProductSnap.data() as Product;
    const sellerId = existingProductData.sellerId;

    // 1. Delete images marked for removal from Storage
    if (imagesToRemove.length > 0) {
      const deletePromises = imagesToRemove.map(url => {
        if (url.includes('firebasestorage.googleapis.com')) {
          const imageRefToDelete = ref(storage, url);
          return deleteObject(imageRefToDelete).catch(err => console.warn(`Failed to delete old image ${url}:`, err));
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
    }
    
    // Find the full ProductImage objects for the URLs we are keeping
    const existingImagesToKeep = existingProductData.images.filter(img => existingImageUrls.includes(img.url));

    // 2. Upload new images, generate alt text, and get download URLs
    let newProductImages: ProductImage[] = [];
    if (newImageFiles.length > 0) {
      const hint = `${data.specs?.color || existingProductData.specs.color} ${data.specs?.texture || existingProductData.specs.texture} ${data.category || existingProductData.category}`;
      const uploadPromises = newImageFiles.map(async (file) => {
        const imageRef = ref(storage, `products/${sellerId}/${Date.now()}-${file.name}`);
        const uploadResult = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(uploadResult.ref);
        
        const dataUri = await fileToDataURI(file);
        const { altText } = await generateAltText({ photoDataUri: dataUri, hint });
        
        return { url, alt: altText };
      });
      newProductImages = await Promise.all(uploadPromises);
    }
    
    // 3. Construct the final list of image objects
    const finalImages = [...existingImagesToKeep, ...newProductImages];
    
    // 4. Update the Firestore document
    await updateDoc(productRef, {
      ...data,
      images: finalImages,
    });

  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(productId: string) {
    const productRef = doc(db, "products", productId);
    const storage = getStorage();

    try {
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) {
            throw new Error("Product not found");
        }
        const productData = productSnap.data() as Product;
        
        // Delete all images associated with the product
        if (productData.images && productData.images.length > 0) {
            const deletePromises = productData.images.map(image => {
                if (image.url.includes('firebasestorage.googleapis.com')) {
                    const imageRef = ref(storage, image.url);
                    return deleteObject(imageRef);
                }
                return Promise.resolve();
            });
            await Promise.all(deletePromises);
        }

        // Delete the Firestore document
        await deleteDoc(productRef);

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
        website: '',
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

export async function updateSellerProfile(
    sellerId: string, 
    data: Partial<Seller>, 
    newAvatarFile: File | null, 
    removeAvatar: boolean
) {
  const sellerRef = doc(db, "sellers", sellerId);
  const storage = getStorage();
  const dataToUpdate: any = { ...data };

  try {
    const existingSellerSnap = await getDoc(sellerRef);
    if (!existingSellerSnap.exists()) {
        throw new Error("Seller not found to update.");
    }
    const existingSellerData = existingSellerSnap.data() as Seller;
    const oldAvatarUrl = existingSellerData.avatarUrl;

    // Helper function to delete old avatar
    const deleteOldAvatar = async () => {
        if (oldAvatarUrl && oldAvatarUrl.includes('firebasestorage.googleapis.com')) {
            try {
              const oldAvatarStorageRef = ref(storage, oldAvatarUrl);
              await deleteObject(oldAvatarStorageRef);
            } catch (deleteError: any) {
               if (deleteError.code !== 'storage/object-not-found') {
                  console.warn("Could not delete old avatar:", deleteError);
               }
            }
        }
    };

    if (removeAvatar) {
        await deleteOldAvatar();
        // Set avatarUrl to a default placeholder
        dataToUpdate.avatarUrl = `https://placehold.co/100x100?text=${existingSellerData.name.charAt(0)}`;
    } else if (newAvatarFile) {
        // A new file is being uploaded, delete the old one first
        await deleteOldAvatar();

        const newAvatarRef = ref(storage, `avatars/${sellerId}/avatar`);
        const uploadResult = await uploadBytes(newAvatarRef, newAvatarFile);
        let newAvatarUrl = await getDownloadURL(uploadResult.ref);
        
        // --- Cache-busting ---
        // Append a timestamp to the URL to force browsers to re-fetch the image
        newAvatarUrl = `${newAvatarUrl}?updated=${Date.now()}`;

        dataToUpdate.avatarUrl = newAvatarUrl;
    }

    await updateDoc(sellerRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating seller profile:", error);
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

export async function addBuyer(
  values: {
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
) {
  const location = values.city && values.country ? `${values.city}, ${values.country}` : values.city || values.country;
  const fullPhoneNumber = values.phoneCode && values.localPhone ? `${values.phoneCode}${values.localPhone.replace(/\D/g, '')}` : "";
  
  try {
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;
    
    // Step 2: Send verification email
    await sendEmailVerification(user);

    // Step 3: Create a corresponding buyer document in Firestore
    await setDoc(doc(db, "buyers", user.uid), {
      name: values.name,
      companyName: values.companyName || '',
      location: location,
      bio: values.bio,
      isVerified: false, // Buyers start as unverified
      avatarUrl: `https://placehold.co/100x100?text=${values.name.charAt(0)}`,
      memberSince: new Date().toISOString(),
      contact: {
        email: user.email,
        phone: fullPhoneNumber,
        website: '', // Website is not in the form, so default to empty
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

// Contact Messages
export async function addContactMessage(data: Omit<ContactMessage, 'id' | 'date'>) {
    try {
        const messagesCollectionRef = collection(db, 'contact-messages');
        await addDoc(messagesCollectionRef, {
            ...data,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding contact message: ", error);
        throw error;
    }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
    noStore();
    try {
        const messagesCollectionRef = collection(db, 'contact-messages');
        const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
            return {
                id: doc.id,
                date: date,
                name: data.name || '',
                email: data.email || '',
                subject: data.subject || '',
                message: data.message || '',
            }
        });
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return [];
    }
}
