
"use client";

import * as React from "react";
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
import { getProductsBySeller, getSellerById, updateProduct, addProduct, deleteProduct } from "@/lib/data";
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
import { categories } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { Product, Seller } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

const initialNewProductState = {
  name: "",
  description: "",
  price: "",
  category: "",
  imagePreview: "",
};

export default function VendorDashboardPage() {
  const { toast } = useToast();

  const [user, setUser] = React.useState<User | null>(null);
  const [seller, setSeller] = React.useState<Seller | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // State for dialogs
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  // State for the product being acted upon
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  
  // State for the add form
  const [newProduct, setNewProduct] = React.useState(initialNewProductState);
  const [newImageFile, setNewImageFile] = React.useState<File | null>(null);

  // State for the edit form
  const [editProductData, setEditProductData] = React.useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imagePreview: "",
  });
  
  const [editImageFile, setEditImageFile] = React.useState<File | null>(null);

  const fetchVendorData = React.useCallback(async (currentUser: User) => {
    try {
        const fetchedSeller = await getSellerById(currentUser.uid);
        if (fetchedSeller) {
          setSeller(fetchedSeller);
          const fetchedProducts = await getProductsBySeller(fetchedSeller.id);
          setProducts(fetchedProducts);
        }
    } catch (error) {
        console.error("Failed to fetch vendor data:", error);
        toast({ title: "Error", description: "Could not fetch your data. Please refresh the page.", variant: "destructive"});
    }
  }, [toast]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        await fetchVendorData(currentUser);
      } else {
        setUser(null);
        setSeller(null);
        setProducts([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchVendorData]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setData: React.Dispatch<React.SetStateAction<any>>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev: any) => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  // Handler to open the Edit dialog and populate it with product data
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imagePreview: product.images?.[0] || "",
    });
    setEditImageFile(null); // Reset file input on open
    setShowEditDialog(true);
  };

  // Handler to submit the updated product data
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    
    try {
      await updateProduct(selectedProduct.id, {
        name: editProductData.name,
        description: editProductData.description,
        price: parseFloat(editProductData.price),
        category: editProductData.category as Product['category'],
      }, editImageFile);

      // Refresh products list after update
      if (user) {
        await fetchVendorData(user);
      }

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

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category || !newImageFile || !user) {
        toast({ title: "Missing Fields", description: "Please fill out all fields and select an image.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    
    try {
        await addProduct({
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price),
            category: newProduct.category as Product['category'],
        }, newImageFile, user.uid);
        
        toast({
          title: "Product Added!",
          description: `${newProduct.name} is now live in your store.`
        });

        await fetchVendorData(user); // Refresh list
        setShowAddDialog(false); // Close dialog
        setNewProduct(initialNewProductState); // Reset form
        setNewImageFile(null); // Reset file

    } catch (error) {
        console.error("Add product error:", error);
        toast({
          title: "Add Product Failed",
          description: "There was an error creating your product. Please try again.",
          variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
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
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline text-primary">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your products for {seller.companyName}.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details to list a new product in your store.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="product-name"
                  className="col-span-3"
                  placeholder="e.g. Premium Wavy Bundles"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="product-desc" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="product-desc"
                  className="col-span-3"
                  placeholder="Describe your product..."
                   value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-price" className="text-right">
                  Price ($)
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  className="col-span-3"
                  placeholder="e.g. 85.00"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-category" className="text-right">
                  Category
                </Label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="product-image" className="text-right pt-2">
                  Image
                </Label>
                <div className="col-span-3 flex flex-col gap-2">
                  <Input
                    id="product-image"
                    type="file"
                    className="col-span-3 file:text-primary file:font-medium"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => handleFileChange(e, setNewProduct, setNewImageFile)}
                  />
                  {newProduct.imagePreview && (
                      <Image src={newProduct.imagePreview} alt="New product preview" width={100} height={100} className="rounded-md object-cover"/>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddProduct} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

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
      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for "{selectedProduct?.name}". Make changes and
              click save.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-product-name"
                className="col-span-3"
                value={editProductData.name}
                onChange={(e) =>
                  setEditProductData({ ...editProductData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-product-desc" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-product-desc"
                className="col-span-3"
                value={editProductData.description}
                onChange={(e) =>
                  setEditProductData({
                    ...editProductData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="edit-product-price"
                type="number"
                className="col-span-3"
                value={editProductData.price}
                onChange={(e) =>
                  setEditProductData({ ...editProductData, price: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-category" className="text-right">
                Category
              </Label>
              <Select
                value={editProductData.category}
                onValueChange={(value) =>
                  setEditProductData({ ...editProductData, category: value })
                }
              >
                <SelectTrigger className="col-span-3">
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
             <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-product-image" className="text-right pt-2">
                  Image
                </Label>
                <div className="col-span-3 flex flex-col gap-2">
                  <Input
                    id="edit-product-image"
                    type="file"
                    className="col-span-3 file:text-primary file:font-medium"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => handleFileChange(e, setEditProductData, setEditImageFile)}
                  />
                  {editProductData.imagePreview && (
                      <Image src={editProductData.imagePreview} alt="Product preview" width={100} height={100} className="rounded-md object-cover"/>
                  )}
                </div>
              </div>
          </div>
          <DialogFooter>
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
