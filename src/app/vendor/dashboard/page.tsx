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
import { getProductsBySeller, getSellerById } from "@/lib/data";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
import type { Product } from "@/lib/types";

// In a real app, you'd get this from the user's session
const LOGGED_IN_SELLER_ID = "seller-1";

export default function VendorDashboardPage() {
  const { toast } = useToast();

  // State for dialogs
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  // State for the product being acted upon
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );

  // State for the edit form
  const [editProductData, setEditProductData] = React.useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  const seller = getSellerById(LOGGED_IN_SELLER_ID);
  const products = getProductsBySeller(LOGGED_IN_SELLER_ID);

  // Handler to open the Edit dialog and populate it with product data
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.images[0] || "",
    });
    setShowEditDialog(true);
  };

  // Handler to submit the updated product data
  const handleUpdateProduct = () => {
    // In a real app, you would send this data to your backend API to persist the changes
    console.log("Updating product:", selectedProduct?.id, editProductData);
    toast({
      description: `Product "${editProductData.name}" has been updated.`,
    });
    setShowEditDialog(false);
  };

  // Handler to open the Delete confirmation dialog
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  if (!seller) {
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
        <Dialog>
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-desc" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="product-desc"
                  className="col-span-3"
                  placeholder="Describe your product..."
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-category" className="text-right">
                  Category
                </Label>
                <Select>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-image" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="product-image"
                  className="col-span-3"
                  placeholder="https://placehold.co/600x600"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Product</Button>
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
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      src={product.images[0]}
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
              ))}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-desc" className="text-right">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product-image" className="text-right">
                Image URL
              </Label>
              <Input
                id="edit-product-image"
                className="col-span-3"
                value={editProductData.imageUrl}
                onChange={(e) =>
                  setEditProductData({
                    ...editProductData,
                    imageUrl: e.target.value,
                  })
                }
              />
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
            <Button type="submit" onClick={handleUpdateProduct}>
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
              product "{selectedProduct?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast({
                  description: `Product "${selectedProduct?.name}" has been deleted.`,
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
