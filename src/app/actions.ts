
'use server';

import { auth, db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { addDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schema for validation
const ProductSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    description: z.string().min(1, { message: "Description is required." }),
    price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }),
    category: z.enum(['Raw Hair', 'Virgin Hair', 'Wigs', 'Extensions', 'Tools']),
    image: z.instanceof(File).refine(file => file.size > 0, "An image is required."),
    type: z.string().min(1),
    length: z.string().min(1),
    color: z.string().min(1),
    texture: z.string().min(1),
    origin: z.string().min(1),
});

export async function addProductAction(prevState: any, formData: FormData) {
    const user = auth.currentUser;
    if (!user) {
        return { message: 'Authentication failed. Please log in again.' };
    }

    const validatedFields = ProductSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        image: formData.get('image'),
        type: formData.get('type'),
        length: formData.get('length'),
        color: formData.get('color'),
        texture: formData.get('texture'),
        origin: formData.get('origin'),
    });

    if (!validatedFields.success) {
        console.error('Validation errors:', validatedFields.error.flatten().fieldErrors);
        return { message: 'Validation failed. Please check your inputs.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { image: imageFile, ...productData } = validatedFields.data;
    const sellerId = user.uid;
    const storage = getStorage();
    const imageRef = ref(storage, `products/${sellerId}/${Date.now()}_${imageFile.name}`);

    try {
        const uploadResult = await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(uploadResult.ref);

        const newProduct: Omit<Product, 'id'> = {
            ...productData,
            sellerId,
            images: [imageUrl],
            specs: {
                type: productData.type,
                length: `${productData.length} inches`,
                color: productData.color,
                texture: productData.texture,
                origin: productData.origin,
            }
        };

        const productsCollection = collection(db, 'products');
        await addDoc(productsCollection, newProduct);

        revalidatePath('/vendor/dashboard');
        return { message: `Successfully added ${productData.name}!`, success: true };
    } catch (error) {
        console.error("Error adding product:", error);
        return { message: 'Database error: Failed to add product.' };
    }
}
