

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getBuyerById, getQuoteRequestsByBuyer, updateBuyerProfile, getSavedSellers } from "@/lib/data";
import { Loader2, User, Bookmark, ShieldCheck, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Buyer, QuoteRequest, Seller } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UserCard } from "@/components/user-card";

const initialProfileState: Partial<Buyer> = {
    companyName: "",
    name: "",
    location: "",
    bio: "",
    contact: { email: "", phone: "", website: "" },
    buyerType: "other",
    yearsInBusiness: "0-2",
};

const renderStatusBadge = (status: QuoteRequest['status']) => {
    switch (status) {
        case 'new':
            return <Badge variant="secondary">Sent</Badge>;
        case 'viewed':
            return <Badge variant="default" className="bg-blue-600">Viewed by Seller</Badge>;
        case 'responded':
            return <Badge variant="default" className="bg-green-600">Responded</Badge>;
        case 'archived':
            return <Badge variant="outline">Archived</Badge>;
        default:
            return <Badge variant="secondary">Sent</Badge>;
    }
}


export default function BuyerDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [buyer, setBuyer] = React.useState<Buyer | null>(null);
  const [quoteRequests, setQuoteRequests] = React.useState<QuoteRequest[]>([]);
  const [savedSellers, setSavedSellers] = React.useState<Seller[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = React.useState(false);
  const [isCreatingPortalLink, setIsCreatingPortalLink] = React.useState(false);


  const [profileData, setProfileData] = React.useState<Partial<Buyer>>(initialProfileState);
  const [newAvatarFile, setNewAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string>('');
  const [isAvatarRemoved, setIsAvatarRemoved] = React.useState(false);


  const fetchBuyerData = React.useCallback(async (currentUser: FirebaseUser) => {
    try {
        const [fetchedBuyer, fetchedQuotes, fetchedSavedSellers] = await Promise.all([
            getBuyerById(currentUser.uid),
            getQuoteRequestsByBuyer(currentUser.uid),
            getSavedSellers(currentUser.uid)
        ]);
        
        if (fetchedBuyer) {
          setBuyer(fetchedBuyer);
          setProfileData({
             name: fetchedBuyer.name,
             companyName: fetchedBuyer.companyName,
             location: fetchedBuyer.location,
             bio: fetchedBuyer.bio,
             contact: fetchedBuyer.contact,
             buyerType: fetchedBuyer.buyerType,
             yearsInBusiness: fetchedBuyer.yearsInBusiness,
             isVerified: fetchedBuyer.isVerified,
             stripeSubscriptionStatus: fetchedBuyer.stripeSubscriptionStatus,
          });
          setAvatarPreview(fetchedBuyer.avatarUrl);
          setQuoteRequests(fetchedQuotes);
          setSavedSellers(fetchedSavedSellers);
        } else {
          toast({ title: "Buyer Profile Not Found", description: "We couldn't find your profile. Please contact support.", variant: "destructive"});
        }
    } catch (error) {
        console.error("Failed to fetch buyer data:", error);
        toast({ title: "Error", description: "Could not fetch your data. Please refresh the page.", variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        if (!currentUser.emailVerified) {
          router.push('/auth/verify-email');
          return;
        }
        setUser(currentUser);
        await fetchBuyerData(currentUser);
      } else {
        router.push('/login?redirect=/buyer/dashboard');
      }
    });

    return () => unsubscribe();
  }, [fetchBuyerData, router]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatarFile(file);
      setIsAvatarRemoved(false);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setNewAvatarFile(null);
    setIsAvatarRemoved(true);
    const initialChar = profileData.name ? profileData.name.charAt(0) : 'B';
    setAvatarPreview(`https://placehold.co/100x100?text=${initialChar}`);
  };

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSubmittingProfile(true);

    try {
      const dataToUpdate: Partial<Buyer> = { ...profileData };
      if (dataToUpdate.contact?.website) {
        dataToUpdate.contact.website = dataToUpdate.contact.website.replace(/^(https?:\/\/)/, '');
      }

      await updateBuyerProfile(user.uid, dataToUpdate, newAvatarFile, isAvatarRemoved);
      
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      await fetchBuyerData(user); 
      setNewAvatarFile(null);
      setIsAvatarRemoved(false);

    } catch (error) {
      console.error("Update profile error:", error);
      toast({ title: "Update Failed", description: "Could not update your profile.", variant: "destructive"});
    } finally {
      setIsSubmittingProfile(false);
    }
  }

  const handleManageSubscription = async () => {
    if (!user) return;
    setIsCreatingPortalLink(true);

    try {
      const token = await user.getIdToken();
      const functionUrl = 'https://us-central1-hairconnect-db.cloudfunctions.net/createBuyerStripePortalLink';

      const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              return_url: window.location.href,
          })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create billing portal link.');
      }

      const { url } = await response.json();
      if (url) {
          window.open(url, '_blank');
      } else {
          throw new Error("No portal URL returned.");
      }
    } catch (error: any) {
        console.error("Stripe portal error:", error);
        toast({
            title: "Error",
            description: error.message || "Could not open the billing portal. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsCreatingPortalLink(false);
    }
  };


  if (isLoading || !user || !buyer) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-headline text-primary">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {buyer.name}! Manage your quotes and profile here.
          </p>
        </div>
      </header>

      {!buyer.isVerified && (
        <Card className="mb-6 bg-secondary/40 border-primary/20 border">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="h-10 w-10 text-primary/80" />
                    <div>
                        <h3 className="font-headline text-xl text-primary">Become a Verified Buyer</h3>
                        <p className="text-muted-foreground">Build trust with sellers and get better responses with a Verified badge.</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/buyer/verify-payment">Get Verified Now</Link>
                </Button>
            </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="quotes">
          <TabsList className="mb-4">
            <TabsTrigger value="quotes">My Quote Requests</TabsTrigger>
            <TabsTrigger value="saved-vendors">Saved Vendors</TabsTrigger>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="quotes">
            <Card>
                <CardHeader>
                <CardTitle>My Sent Quote Requests</CardTitle>
                <CardDescription>
                    A log of all quote requests you have submitted.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {quoteRequests.length > 0 ? (
                        quoteRequests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {format(new Date(req.date), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell>
                               {req.productId !== 'N/A' ? (
                                    <Link href={`/products/${req.productId}`} className="font-medium text-primary hover:underline">{req.productName}</Link>
                                ) : (
                                    <span className="font-medium">{req.productName}</span>
                                )}
                                <div className="text-xs text-muted-foreground">Qty: {req.quantity}</div>
                            </TableCell>
                            <TableCell>
                                {req.sellerId !== 'N/A' ? (
                                    <Link href={`/sellers/${req.sellerId}`} className="font-medium text-primary hover:underline">View Vendor</Link>
                                ) : (
                                    <span>General Inquiry</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {renderStatusBadge(req.status)}
                            </TableCell>
                            <TableCell className="max-w-[300px] text-sm text-muted-foreground whitespace-pre-wrap">
                                {req.details || 'N/A'}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            You haven't sent any quote requests yet.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="saved-vendors">
            <Card>
              <CardHeader>
                <CardTitle>My Saved Vendors</CardTitle>
                <CardDescription>
                  Your curated list of preferred vendors for quick access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedSellers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedSellers.map((seller) => (
                      <UserCard key={seller.id} user={seller} userType="seller" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-fit bg-secondary p-4 rounded-full mb-4">
                      <Bookmark className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-headline text-primary">No Saved Vendors Yet</h3>
                    <p className="text-muted-foreground mt-2 mb-4 max-w-sm mx-auto">
                      You can save vendors by clicking the "Save Vendor" button on their profile pages.
                    </p>
                    <Button asChild>
                      <Link href="/sellers">Browse Sellers</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="profile">
             <Card>
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your public buyer profile and contact information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="space-y-2">
                                <Label>Avatar</Label>
                                <Image src={avatarPreview || "https://placehold.co/100x100"} alt="Avatar preview" width={100} height={100} className="rounded-full object-cover border"/>
                                <div className="flex gap-2 max-w-[100px]">
                                    <Label htmlFor="avatar-upload" className="flex-grow">
                                        <div className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer w-full")}>Change</div>
                                    </Label>
                                    <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden"/>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveAvatar}>Remove</Button>
                                </div>
                            </div>
                            <div className="flex-grow space-y-6">
                               <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-name">Your Name</Label>
                                        <Input id="profile-name" value={profileData.name || ''} onChange={e => setProfileData(p => ({...p, name: e.target.value}))}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-companyName">Company Name (Optional)</Label>
                                        <Input id="profile-companyName" value={profileData.companyName || ''} onChange={e => setProfileData(p => ({...p, companyName: e.target.value}))}/>
                                    </div>
                               </div>
                               <div className="space-y-2">
                                    <Label htmlFor="profile-location">Location (e.g. City, Country)</Label>
                                    <Input id="profile-location" value={profileData.location || ''} onChange={e => setProfileData(p => ({...p, location: e.target.value}))}/>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-bio">About Your Business</Label>
                            <Textarea id="profile-bio" value={profileData.bio || ''} onChange={e => setProfileData(p => ({...p, bio: e.target.value}))} className="min-h-[150px]"/>
                        </div>
                        
                        <Separator />

                        <h3 className="text-lg font-medium">Business Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="buyer-type">Type of Business</Label>
                                <Select value={profileData.buyerType} onValueChange={(value: Buyer['buyerType']) => setProfileData(p => ({...p, buyerType: value}))}>
                                    <SelectTrigger id="buyer-type">
                                        <SelectValue placeholder="Select your business type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="salon">Salon Owner</SelectItem>
                                        <SelectItem value="distributor">Distributor / Wholesaler</SelectItem>
                                        <SelectItem value="stylist">Independent Stylist</SelectItem>
                                        <SelectItem value="retailer">Retailer</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="years-in-business">Years in Business</Label>
                                <Select value={profileData.yearsInBusiness} onValueChange={(value: Buyer['yearsInBusiness']) => setProfileData(p => ({...p, yearsInBusiness: value}))}>
                                    <SelectTrigger id="years-in-business">
                                        <SelectValue placeholder="Select years in business" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-2">0-2 years</SelectItem>
                                        <SelectItem value="2-5">2-5 years</SelectItem>
                                        <SelectItem value="5-10">5-10 years</SelectItem>
                                        <SelectItem value="10+">10+ years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                                <Input id="profile-website" type="text" placeholder="your-website.com" value={profileData.contact?.website || ''} onChange={e => setProfileData(p => ({...p, contact: {...p.contact, website: e.target.value}} as any))}/>
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
           <TabsContent value="billing">
            <Card>
                <CardHeader>
                    <CardTitle>Billing & Subscription</CardTitle>
                    <CardDescription>Manage your verified buyer subscription and view payment history.</CardDescription>
                </CardHeader>
                <CardContent>
                    {buyer.isVerified && buyer.stripeSubscriptionStatus ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border p-4 rounded-md">
                                <div>
                                    <p className="font-medium">Subscription Status</p>
                                    <Badge variant={buyer.stripeSubscriptionStatus === 'active' ? "default" : "destructive"} className="capitalize mt-1">
                                        {buyer.stripeSubscriptionStatus}
                                    </Badge>
                                </div>
                                <Button onClick={handleManageSubscription} disabled={isCreatingPortalLink}>
                                    {isCreatingPortalLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Manage Billing
                                </Button>
                            </div>
                             <p className="text-sm text-muted-foreground text-center">
                                You will be redirected to our secure payment partner, Stripe, to manage your subscription.
                            </p>
                        </div>
                    ) : (
                       <div className="text-center py-16">
                            <div className="mx-auto w-fit bg-secondary p-4 rounded-full mb-4">
                                <CreditCard className="h-12 w-12 text-primary"/>
                            </div>
                            <h3 className="text-2xl font-headline text-primary">No Active Subscription</h3>
                            <p className="text-muted-foreground mt-2 mb-4 max-w-sm mx-auto">You are not currently a verified buyer. Upgrade to gain a verified badge and build more trust with sellers.</p>
                            <Button asChild><Link href="/buyer/verify-payment">Become a Verified Buyer</Link></Button>
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
