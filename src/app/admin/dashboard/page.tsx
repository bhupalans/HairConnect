
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getProducts, getSellers, getBuyers, getQuoteRequests, addVendor, updateVendor, deleteVendor } from "@/lib/data";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { QuoteRequest, Product, Seller, Buyer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// State structure for the new vendor form
const initialNewVendorState = {
  companyName: "",
  contactName: "",
  email: "",
  password: "",
  location: "",
  bio: "",
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [sellersData, setSellersData] = useState<Seller[]>([]);
  const [buyersData, setBuyersData] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Seller | null>(null);

  // State for dialogs
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [isDeleteVendorOpen, setIsDeleteVendorOpen] = useState(false);
  
  // State for forms
  const [newVendor, setNewVendor] = useState(initialNewVendorState);
  const [editVendorData, setEditVendorData] = useState<Partial<Seller>>({});


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
  
  const refetchVendors = async () => {
    const sells = await getSellers();
    setSellersData(sells);
  }

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

  const handleAddVendor = async () => {
    setIsSubmitting(true);
    // Basic validation
    if (!newVendor.companyName || !newVendor.contactName || !newVendor.email || !newVendor.password || !newVendor.location || !newVendor.bio) {
       toast({
        title: "Missing Fields",
        description: "Please fill out all required fields for the new vendor.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
        await addVendor({
            companyName: newVendor.companyName,
            name: newVendor.contactName,
            email: newVendor.email,
            password: newVendor.password,
            location: newVendor.location,
            bio: newVendor.bio,
        });
        toast({
            title: "Vendor Added Successfully",
            description: `${newVendor.companyName} can now log in.`
        });
        setNewVendor(initialNewVendorState); // Reset form
        setIsAddVendorOpen(false); // Close dialog
        refetchVendors(); // Refetch vendors to update the list
    } catch (error: any) {
        console.error("Add vendor error:", error);
        let description = "An unexpected error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            description = "This email is already registered to another user.";
        } else if (error.code === 'auth/weak-password') {
            description = "Password must be at least 6 characters long.";
        }
        toast({
            title: "Failed to Add Vendor",
            description,
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleEditVendorClick = (vendor: Seller) => {
    setSelectedVendor(vendor);
    setEditVendorData({
      name: vendor.name,
      companyName: vendor.companyName,
      location: vendor.location,
      bio: vendor.bio,
    });
    setIsEditVendorOpen(true);
  };
  
  const handleUpdateVendor = async () => {
      if (!selectedVendor) return;
      setIsSubmitting(true);
      try {
        await updateVendor(selectedVendor.id, editVendorData);
        toast({
            title: "Vendor Updated",
            description: `${editVendorData.companyName || selectedVendor.companyName} has been updated.`,
        });
        setIsEditVendorOpen(false);
        refetchVendors();
      } catch (error) {
        console.error("Update vendor error:", error);
         toast({
            title: "Update Failed",
            description: "Could not update the vendor's details. Please try again.",
            variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
  };
  
  const handleDeleteVendorClick = (vendor: Seller) => {
      setSelectedVendor(vendor);
      setIsDeleteVendorOpen(true);
  }
  
  const handleDeleteVendor = async () => {
      if (!selectedVendor) return;
      setIsSubmitting(true);
       try {
        await deleteVendor(selectedVendor.id);
         toast({
            title: "Vendor Deleted",
            description: `The vendor ${selectedVendor.companyName} has been deleted. Note: The user account and products still exist.`,
        });
        setIsDeleteVendorOpen(false);
        refetchVendors();
      } catch (error) {
         console.error("Delete vendor error:", error);
         toast({
            title: "Delete Failed",
            description: "Could not delete the vendor. Please try again.",
            variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
  }
  
  const renderTableContent = (Component: React.ReactNode) => {
    return isLoading ? (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : Component;
  }

  const renderAddDialog = () => {
    if (activeTab === 'vendors') {
        return (
             <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
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
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="companyName" className="text-right">
                          Company
                        </Label>
                        <Input
                          id="companyName"
                          className="col-span-3"
                          placeholder="e.g., Bella Hair Imports"
                          value={newVendor.companyName}
                          onChange={(e) => setNewVendor({...newVendor, companyName: e.target.value})}
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
                          value={newVendor.contactName}
                          onChange={(e) => setNewVendor({...newVendor, contactName: e.target.value})}
                        />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" className="col-span-3" placeholder="e.g., contact@example.com" value={newVendor.email} onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}/>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input id="password" type="password" className="col-span-3" placeholder="Set an initial password" value={newVendor.password} onChange={(e) => setNewVendor({...newVendor, password: e.target.value})}/>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                          Location
                        </Label>
                        <Input
                          id="location"
                          className="col-span-3"
                          placeholder="e.g., Lagos, Nigeria"
                          value={newVendor.location}
                          onChange={(e) => setNewVendor({...newVendor, location: e.target.value})}
                        />
                      </div>
                       <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="bio" className="text-right pt-2">Bio</Label>
                        <Textarea id="bio" className="col-span-3" placeholder="Tell us about the vendor..." value={newVendor.bio} onChange={(e) => setNewVendor({...newVendor, bio: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="avatar" className="text-right">Avatar</Label>
                        <Input id="avatar" type="file" className="col-span-3" disabled title="Feature not available yet"/>
                      </div>
                    </div>
                  <DialogFooter>
                     <Button type="submit" onClick={handleAddVendor} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
        )
    }
    // Logic for other tabs can go here
    return (
         <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {getTitle()}
        </Button>
    )
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
            {activeTab !== 'quote-requests' && renderAddDialog()}
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
                              <DropdownMenuItem onSelect={() => handleEditVendorClick(seller)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteVendorClick(seller)}>
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
      
       {/* Edit Vendor Dialog */}
      <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update the details for "{selectedVendor?.companyName}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-companyName" className="text-right">
                  Company
                </Label>
                <Input
                  id="edit-companyName"
                  className="col-span-3"
                  value={editVendorData.companyName || ''}
                  onChange={(e) => setEditVendorData({...editVendorData, companyName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contactName" className="text-right">
                  Contact
                </Label>
                <Input
                  id="edit-contactName"
                  className="col-span-3"
                  value={editVendorData.name || ''}
                  onChange={(e) => setEditVendorData({...editVendorData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">
                  Location
                </Label>
                <Input
                  id="edit-location"
                  className="col-span-3"
                  value={editVendorData.location || ''}
                  onChange={(e) => setEditVendorData({...editVendorData, location: e.target.value})}
                />
              </div>
                <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-bio" className="text-right pt-2">Bio</Label>
                <Textarea id="edit-bio" className="col-span-3" value={editVendorData.bio || ''} onChange={(e) => setEditVendorData({...editVendorData, bio: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditVendorOpen(false)}>Cancel</Button>
                <Button type="submit" onClick={handleUpdateVendor} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save changes
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Vendor Confirmation */}
      <AlertDialog open={isDeleteVendorOpen} onOpenChange={setIsDeleteVendorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor profile for "{selectedVendor?.companyName}". This will not delete their user account or products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVendor} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
