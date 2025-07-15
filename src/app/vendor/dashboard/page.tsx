
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProductsBySeller, getSellerById, updateProduct, deleteProduct, addProduct, updateSellerProfile } from "@/lib/data";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { categories } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { Product, Seller } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Separator } from "@/components/ui/separator";

const initialEditProductState: Omit<Product, 'id' | 'sellerId' | 'images'> & { imagePreview: string } = {
    name: "",
    description: "",
    price: 0,
    category: "Wigs",
    imagePreview: "",
    specs: {
        type: "",
        length: "",
        color: "",
        texture: "",
        origin: "",
    }
};

const initialProfileState: Partial<Seller> = {
    companyName: "",
    name: "",
    location: "",
    bio: "",
    contact: { email: "", phone: "", website: "" },
};


export default function VendorDashboardPage() {
  const { toast } = useToast();

  const [user, setUser] = React.useState<User | null>(null);
  const [seller, setSeller] = React.useState<Seller | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("products");


  // State for dialogs
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  // State for the product being acted upon
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  
  // State for forms
  const [editProductData, setEditProductData] = React.useState(initialEditProductState);
  const [profileData, setProfileData] = React.useState<Partial<Seller>>(initialProfileState);
  
  const [editImageFile, setEditImageFile] = React.useState<File | null>(null);
  const [newAvatarFile, setNewAvatarFile] = React.useState<File | null>(null);
  
  const [imagePreview, setImagePreview] = React.useState<string>('');
  const [avatarPreview, setAvatarPreview] = React.useState<string>('');


  const fetchVendorData = React.useCallback(async (currentUser: User) => {
    setIsLoading(true);
    try {
        const fetchedSeller = await getSellerById(currentUser.uid);
        if (fetchedSeller) {
          setSeller(fetchedSeller);
          setProfileData({
             name: fetchedSeller.name,
             companyName: fetchedSeller.companyName,
             location: fetchedSeller.location,
             bio: fetchedSeller.bio,
             contact: fetchedSeller.contact,
          });
          setAvatarPreview(fetchedSeller.avatarUrl);

          const fetchedProducts = await getProductsBySeller(fetchedSeller.id);
          setProducts(fetchedProducts);
        } else {
          toast({ title: "Seller Profile Not Found", description: "We couldn't find your seller profile. Please contact support.", variant: "destructive"});
        }
    } catch (error) {
        console.error("Failed to fetch vendor data:", error);
        toast({ title: "Error", description: "Could not fetch your data. Please refresh the page.", variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchVendorData(currentUser);
      } else {
        setUser(null);
        setSeller(null);
        setProducts([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchVendorData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setImagePreview('');
    }
  };
  
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProductData((prev) => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
   const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to add a product.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const imageFile = formData.get('image') as File;
    
    if (!imageFile || imageFile.size === 0) {
        toast({ title: "Missing Image", description: "Please select an image for your product.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    
    const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        category: formData.get('category') as Product['category'],
        specs: {
            type: formData.get('type') as string,
            length: `${formData.get('length') as string} inches`,
            color: formData.get('color') as string,
            texture: formData.get('texture') as string,
            origin: formData.get('origin') as string,
        }
    };
    
    try {
        await addProduct(productData, imageFile, user.uid);
        toast({ title: "Success!", description: `Product "${productData.name}" has been added.` });
        await fetchVendorData(user);
        setShowAddDialog(false);
        (event.target as HTMLFormElement).reset();
        setImagePreview('');

    } catch (error) {
        console.error("Add product error:", error);
        toast({ title: "Add Product Failed", description: "Could not add the product. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };


  // Handler to open the Edit dialog and populate it with product data
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imagePreview: product.images?.[0] || "",
      specs: {
        ...product.specs,
        length: product.specs.length.replace(' inches', ''), // remove suffix for editing
      }
    });
    setEditImageFile(null); // Reset file input on open
    setShowEditDialog(true);
  };

  // Handler to submit the updated product data
  const handleUpdateProduct = async () => {
    if (!selectedProduct || !user) return;
    setIsSubmitting(true);
    
    try {
      const price = typeof editProductData.price === 'string' ? parseFloat(editProductData.price) : editProductData.price;
      await updateProduct(selectedProduct.id, {
        ...editProductData,
        price: price,
        specs: {
          ...editProductData.specs,
          length: `${editProductData.specs.length} inches`
        }
      }, editImageFile);

      await fetchVendorData(user);

      toast({
        title: "Success!",
        description: `Product "${editProductData.name}" has been updated.`,
      });
      setShowEditDialog(false);
    } catch (error) {
       console.error("Update product error:", error);
       toast({
        title: "Update Failed",
        description: "Could not update the product. Please try again.",
        variant: "destructive"
       });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSubmittingProfile(true);

    try {
      await updateSellerProfile(user.uid, profileData, newAvatarFile);
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      // No need to call fetchVendorData here, as the state is already managed locally. 
      // A full refetch can be done if desired by calling `await fetchVendorData(user)`.
    } catch (error) {
      console.error("Update profile error:", error);
      toast({ title: "Update Failed", description: "Could not update your profile. Please try again.", variant: "destructive"});
    } finally {
      setIsSubmittingProfile(false);
    }
  }

  // Handler to open the Delete confirmation dialog
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteProduct = async () => {
    if (!selectedProduct || !user) return;
    setIsSubmitting(true);

    try {
        await deleteProduct(selectedProduct.id);
        toast({
          title: "Product Deleted",
          description: `Product "${selectedProduct.name}" has been deleted.`,
        });
        await fetchVendorData(user); // Refresh list
        setShowDeleteDialog(false);
    } catch (error) {
       console.error("Delete product error:", error);
       toast({
        title: "Delete Failed",
        description: "Could not delete the product. Please try again.",
        variant: "destructive"
       });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user || !seller) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold">Could not find seller data.</h1>
        <p className="text-muted-foreground">
          Please{" "}
          <Link href="/register" className="text-primary underline">
            register
          </Link>{" "}
          or{" "}
          <Link href="/login" className="text-primary underline">
            log in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-headline text-primary">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your products and profile for {seller.companyName}.
          </p>
        </div>
        <div>
        {activeTab === 'products' && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl p-0">
                <DialogHeader className="p-6 pb-0">
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                    Fill in the details to list a new product in your store.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct}>
                <div className="max-h-[70vh] overflow-y-auto px-6">
                    <div className="grid gap-6 py-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                        <Label htmlFor="product-name">Name</Label>
                        <Input id="product-name" name="name" placeholder="e.g. Premium Wavy Bundles" required />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="product-price">Price ($)</Label>
                        <Input id="product-price" name="price" type="number" placeholder="e.g. 85.00" step="0.01" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-desc">Description</Label>
                        <Textarea id="product-desc" name="description" placeholder="Describe your product..." required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2">
                        <Label htmlFor="product-category">Category</Label>
                        <Select name="category" defaultValue="Wigs">
                            <SelectTrigger id="product-category">
                            <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.name} value={cat.name}>
                                {cat.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="product-image">Image</Label>
                        <Input id="product-image" name="image" type="file" className="file:text-primary file:font-medium" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} required/>
                        {imagePreview && (<Image src={imagePreview} alt="New product preview" width={100} height={100} className="rounded-md object-cover mt-2"/>)}
                        </div>
                    </div>
                    <Separator className="my-2" />
                    <h4 className="text-lg font-medium text-center">Product Specifications</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                        <Label htmlFor="spec-type">Type</Label>
                        <Select name="type" defaultValue="Bundle">
                            <SelectTrigger id="spec-type"><SelectValue /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Bundle">Bundle</SelectItem>
                            <SelectItem value="Wig">Wig</SelectItem>
                            <SelectItem value="Closure">Closure</SelectItem>
                            <SelectItem value="Frontal">Frontal</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="spec-length">Length (in)</Label>
                        <Input id="spec-length" name="length" type="number" defaultValue="18" required/>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="spec-texture">Texture</Label>
                        <Select name="texture" defaultValue="Wavy">
                            <SelectTrigger id="spec-texture"><SelectValue /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Straight">Straight</SelectItem>
                            <SelectItem value="Wavy">Wavy</SelectItem>
                            <SelectItem value="Curly">Curly</SelectItem>
                            <SelectItem value="Kinky-Curly">Kinky Curly</SelectItem>
                            <SelectItem value="Body-Wave">Body Wave</SelectItem>
                            <SelectItem value="Deep-Wave">Deep Wave</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="spec-color">Color</Label>
                        <Input id="spec-color" name="color" defaultValue="Natural Black" required/>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="spec-origin">Origin</Label>
                        <Input id="spec-origin" name="origin" placeholder="e.g. Vietnamese" required/>
                        </div>
                    </div>
                    </div>
                </div>
                <DialogFooter className="p-6 pt-4 border-t bg-background sticky bottom-0">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Product
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        )}
        </div>
      </header>
      
      <Tabs defaultValue="products" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <Card>
                <CardHeader>
                <CardTitle>My Products</CardTitle>
                <CardDescription>
                    A list of products you are currently selling.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                        Image
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="hidden md:table-cell">Price</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {products.length > 0 ? (
                        products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                            <Image
                                src={product.images?.[0] || 'https://placehold.co/64x64'}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                            />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="hidden md:table-cell">
                            ${product.price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onSelect={() => handleEditClick(product)}
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={() => handleDeleteClick(product)}
                                >
                                    Delete
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            You haven't added any products yet.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="profile">
             <Card>
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your public vendor profile and contact information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="space-y-2">
                                <Label>Avatar</Label>
                                <Image src={avatarPreview || "https://placehold.co/100x100"} alt="Avatar preview" width={100} height={100} className="rounded-full object-cover border"/>
                                <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarFileChange} className="max-w-[100px] text-xs"/>
                            </div>
                            <div className="flex-grow space-y-6">
                               <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-companyName">Company Name</Label>
                                        <Input id="profile-companyName" value={profileData.companyName || ''} onChange={e => setProfileData(p => ({...p, companyName: e.target.value}))}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-name">Contact Name</Label>
                                        <Input id="profile-name" value={profileData.name || ''} onChange={e => setProfileData(p => ({...p, name: e.target.value}))}/>
                                    </div>
                               </div>
                               <div className="space-y-2">
                                    <Label htmlFor="profile-location">Location</Label>
                                    <Input id="profile-location" value={profileData.location || ''} onChange={e => setProfileData(p => ({...p, location: e.target.value}))}/>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-bio">Bio</Label>
                            <Textarea id="profile-bio" value={profileData.bio || ''} onChange={e => setProfileData(p => ({...p, bio: e.target.value}))} className="min-h-[150px]"/>
                        </div>
                        
                        <Separator />

                        <h3 className="text-lg font-medium">Contact Details</h3>
                         <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="profile-phone">Phone Number (Optional)</Label>
                                <Input id="profile-phone" type="tel" value={profileData.contact?.phone || ''} onChange={e => setProfileData(p => ({...p, contact: {...p.contact, phone: e.target.value}} as any))}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="profile-website">Website (Optional)</Label>
                                <Input id="profile-website" type="url" placeholder="your-website.com" value={profileData.contact?.website || ''} onChange={e => setProfileData(p => ({...p, contact: {...p.contact, website: e.target.value}} as any))}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="profile-email">Email</Label>
                           <Input id="profile-email" type="email" value={profileData.contact?.email || ''} disabled/>
                           <p className="text-xs text-muted-foreground">Your login email cannot be changed here. Contact support if you need to update it.</p>
                        </div>
                        
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmittingProfile}>
                                {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
          </TabsContent>
      </Tabs>


      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-3xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for "{selectedProduct?.name}". Make changes and
              click save.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6">
            <div className="grid gap-6 py-4">
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label htmlFor="edit-product-name-vendor">Name</Label>
                      <Input id="edit-product-name-vendor" value={editProductData.name} onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}/>
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="edit-product-price-vendor">Price ($)</Label>
                      <Input id="edit-product-price-vendor" type="number" value={editProductData.price} onChange={(e) => setEditProductData({ ...editProductData, price: parseFloat(e.target.value) || 0 })}/>
                  </div>
                </div>
                 <div className="space-y-2">
                      <Label htmlFor="edit-product-desc-vendor">Description</Label>
                      <Textarea id="edit-product-desc-vendor" value={editProductData.description} onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}/>
                  </div>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-2">
                      <Label htmlFor="edit-product-category-vendor">Category</Label>
                       <Select value={editProductData.category} onValueChange={(value) => setEditProductData({ ...editProductData, category: value as Product['category'] })}>
                          <SelectTrigger id="edit-product-category-vendor">
                          <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                          {categories.map((cat) => ( <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-product-image-vendor">Image</Label>
                      <Input id="edit-product-image-vendor" type="file" className="file:text-primary file:font-medium" accept="image/png, image/jpeg, image/gif" onChange={handleEditFileChange}/>
                      {editProductData.imagePreview && (<Image src={editProductData.imagePreview} alt="Product preview" width={100} height={100} className="rounded-md object-cover mt-2"/>)}
                  </div>
                </div>
              <Separator className="my-2" />
              <h4 className="text-lg font-medium text-center">Product Specifications</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-spec-type-vendor">Type</Label>
                    <Select value={editProductData.specs.type} onValueChange={(value) => setEditProductData(p => ({...p, specs: {...p.specs, type: value}}))}>
                      <SelectTrigger id="edit-spec-type-vendor"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bundle">Bundle</SelectItem>
                        <SelectItem value="Wig">Wig</SelectItem>
                        <SelectItem value="Closure">Closure</SelectItem>
                        <SelectItem value="Frontal">Frontal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="edit-spec-length-vendor">Length (in)</Label>
                     <Input id="edit-spec-length-vendor" type="number" value={editProductData.specs.length} onChange={(e) => setEditProductData(p => ({...p, specs: {...p.specs, length: e.target.value}}))} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-spec-texture-vendor">Texture</Label>
                      <Select value={editProductData.specs.texture} onValueChange={(value) => setEditProductData(p => ({...p, specs: {...p.specs, texture: value}}))}>
                          <SelectTrigger id="edit-spec-texture-vendor"><SelectValue /></SelectTrigger>
                          <SelectContent>
                          <SelectItem value="Straight">Straight</SelectItem>
                          <SelectItem value="Wavy">Wavy</SelectItem>
                          <SelectItem value="Curly">Curly</SelectItem>
                          <SelectItem value="Kinky-Curly">Kinky Curly</SelectItem>
                          <SelectItem value="Body-Wave">Body Wave</SelectItem>
                          <SelectItem value="Deep-Wave">Deep Wave</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-spec-color-vendor">Color</Label>
                      <Input id="edit-spec-color-vendor" value={editProductData.specs.color} onChange={(e) => setEditProductData(p => ({...p, specs: {...p.specs, color: e.target.value}}))} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="edit-spec-origin-vendor">Origin</Label>
                      <Input id="edit-spec-origin-vendor" placeholder="e.g. Vietnamese" value={editProductData.specs.origin} onChange={(e) => setEditProductData(p => ({...p, specs: {...p.specs, origin: e.target.value}}))} />
                  </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdateProduct} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{selectedProduct?.name}" and its associated image from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsSubmitting(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
