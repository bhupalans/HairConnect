
"use client";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { categories, products, sellers } from "@/lib/data";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("products");

  const isProductsTab = activeTab === "products";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage products and vendors.</p>
      </header>

      <Tabs defaultValue="products" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>
          <div className="ml-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {isProductsTab ? "Add Product" : "Add Vendor"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Add New {isProductsTab ? "Product" : "Vendor"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new{" "}
                    {isProductsTab ? "product" : "vendor"}.
                  </DialogDescription>
                </DialogHeader>
                {isProductsTab ? (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        className="col-span-3"
                        placeholder="e.g., Premium Wavy Bundles"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea id="description" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price
                      </Label>
                      <Input id="price" type="number" className="col-span-3" />
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
                      <Label htmlFor="image" className="text-right">Image</Label>
                      <Input id="image" type="file" className="col-span-3" />
                    </div>
                    <h4 className="col-span-4 font-medium text-center text-muted-foreground pt-2">Specifications</h4>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="spec-length" className="text-right">Length</Label>
                        <Input id="spec-length" className="col-span-3" placeholder="e.g., 18 inches" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="spec-color" className="text-right">Color</Label>
                        <Input id="spec-color" className="col-span-3" placeholder="e.g., Natural Black (1B)" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="spec-texture" className="text-right">Texture</Label>
                        <Input id="spec-texture" className="col-span-3" placeholder="e.g., Natural Wavy" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="spec-origin" className="text-right">Origin</Label>
                        <Input id="spec-origin" className="col-span-3" placeholder="e.g., Nigeria" />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="companyName" className="text-right">
                        Company
                      </Label>
                      <Input
                        id="companyName"
                        className="col-span-3"
                        placeholder="e.g., Bella Hair Imports"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contactName" className="text-right">
                        Contact
                      </Label>
                      <Input
                        id="contactName"
                        className="col-span-3"
                        placeholder="e.g., Aisha Bella"
                      />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" type="email" className="col-span-3" placeholder="e.g., contact@example.com" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">
                        Location
                      </Label>
                      <Input
                        id="location"
                        className="col-span-3"
                        placeholder="e.g., Lagos, Nigeria"
                      />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="bio" className="text-right pt-2">Bio</Label>
                      <Textarea id="bio" className="col-span-3" placeholder="Tell us about the vendor..." />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="avatar" className="text-right">Avatar</Label>
                      <Input id="avatar" type="file" className="col-span-3" />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product listings.</CardDescription>
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
                    <TableHead className="hidden md:table-cell">
                      Price
                    </TableHead>
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
        </TabsContent>
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendors</CardTitle>
              <CardDescription>Manage your vendors.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      Avatar
                    </TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Location
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          src={seller.avatarUrl}
                          alt={seller.name}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {seller.companyName}
                      </TableCell>
                      <TableCell>{seller.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {seller.location}
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
