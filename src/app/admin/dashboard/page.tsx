
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
import { categories, getProducts, getSellers, getBuyers, getQuoteRequests } from "@/lib/data";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { QuoteRequest, Product, Seller, Buyer } from "@/lib/types";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [sellersData, setSellersData] = useState<Seller[]>([]);
  const [buyersData, setBuyersData] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (activeTab === 'quote-requests') {
        const requests = await getQuoteRequests();
        setQuoteRequests(requests);
      }
      if (activeTab === 'products') {
        const prods = await getProducts();
        setProductsData(prods);
      }
      if (activeTab === 'vendors') {
         const sells = await getSellers();
         setSellersData(sells);
      }
      if (activeTab === 'buyers') {
         const buys = await getBuyers();
         setBuyersData(buys);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [activeTab]);

  const getTitle = () => {
    switch (activeTab) {
      case "products":
        return "Product";
      case "vendors":
        return "Vendor";
      case "buyers":
        return "Buyer";
      default:
        return "";
    }
  };
  
  const renderTableContent = (Component: React.ReactNode) => {
    return isLoading ? (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : Component;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage products, vendors, and buyers.</p>
      </header>

      <Tabs defaultValue="products" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="quote-requests">Quote Requests</TabsTrigger>
          </TabsList>
          <div className="ml-auto">
            {activeTab !== 'quote-requests' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add {getTitle()}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New {getTitle()}</DialogTitle>
                    <DialogDescription>
                      Fill in the details to add a new {getTitle().toLowerCase()}.
                    </DialogDescription>
                  </DialogHeader>
                  {activeTab === "products" && (
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
                  )}
                  {activeTab === "vendors" && (
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
                   {activeTab === "buyers" && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="buyer-companyName" className="text-right">
                          Company
                        </Label>
                        <Input
                          id="buyer-companyName"
                          className="col-span-3"
                          placeholder="e.g., Glamour Locks Salon"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="buyer-contactName" className="text-right">
                          Contact Name
                        </Label>
                        <Input
                          id="buyer-contactName"
                          className="col-span-3"
                          placeholder="e.g., Chloe Kim"
                        />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="buyer-email" className="text-right">Email</Label>
                        <Input id="buyer-email" type="email" className="col-span-3" placeholder="e.g., contact@example.com" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="buyer-location" className="text-right">
                          Location
                        </Label>
                        <Input
                          id="buyer-location"
                          className="col-span-3"
                          placeholder="e.g., Los Angeles, USA"
                        />
                      </div>
                       <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="buyer-bio" className="text-right pt-2">Bio</Label>
                        <Textarea id="buyer-bio" className="col-span-3" placeholder="Describe the buyer's needs..." />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="buyer-avatar" className="text-right">Avatar</Label>
                        <Input id="buyer-avatar" type="file" className="col-span-3" />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product listings.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableContent(
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
                    {productsData.length > 0 ? productsData.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Image
                            src={product.images[0] || 'https://placehold.co/64x64'}
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
                    )) : (
                       <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">No products found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
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
               {renderTableContent(
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
                    {sellersData.length > 0 ? sellersData.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Image
                            src={seller.avatarUrl || 'https://placehold.co/64x64'}
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
                    )) : (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No vendors found.</TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="buyers">
          <Card>
            <CardHeader>
              <CardTitle>Buyers</CardTitle>
              <CardDescription>Manage your featured buyers.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableContent(
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
                    {buyersData.length > 0 ? buyersData.map((buyer) => (
                      <TableRow key={buyer.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Image
                            src={buyer.avatarUrl || 'https://placehold.co/64x64'}
                            alt={buyer.name}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {buyer.companyName}
                        </TableCell>
                        <TableCell>{buyer.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {buyer.location}
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
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No buyers found.</TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quote-requests">
          <Card>
            <CardHeader>
              <CardTitle>Quote Requests</CardTitle>
              <CardDescription>
                A log of all quote requests submitted on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableContent(
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Vendor ID</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteRequests.length > 0 ? quoteRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="text-sm">
                            {format(new Date(req.date), "PPp")}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{req.buyerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {req.buyerEmail}
                            </div>
                          </TableCell>
                          <TableCell>{req.productId}</TableCell>
                          <TableCell>{req.sellerId}</TableCell>
                          <TableCell>{req.quantity}</TableCell>
                          <TableCell className="max-w-[300px] text-sm text-muted-foreground whitespace-pre-wrap">{req.details || 'N/A'}</TableCell>
                        </TableRow>
                      )) : (
                      <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">No quote requests yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
