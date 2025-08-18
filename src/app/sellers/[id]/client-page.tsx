
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { Mail, Phone, Globe, MapPin, CalendarDays, Loader2, LogIn, BadgeCheck, Bookmark, BookmarkCheck } from "lucide-react";
import { format } from "date-fns";
import type { Seller, Product, Buyer } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname } from "next/navigation";
import { getBuyerById, saveSeller, unsaveSeller } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";


interface SellerProfileClientPageProps {
  seller: Seller;
  sellerProducts: Product[];
}

export function SellerProfileClientPage({ seller, sellerProducts }: SellerProfileClientPageProps) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = currentUser === undefined;
  const pathname = usePathname();

  const fetchBuyerAndCheckSavedStatus = useCallback(async (user: User) => {
    const fetchedBuyer = await getBuyerById(user.uid);
    if (fetchedBuyer) {
      setBuyer(fetchedBuyer);
      if (fetchedBuyer.savedSellerIds?.includes(seller.id)) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }
    } else {
        setBuyer(null); // User is not a buyer (could be a seller or admin)
    }
  }, [seller.id]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchBuyerAndCheckSavedStatus(user);
      } else {
        setBuyer(null);
        setIsSaved(false);
      }
    });
    return () => unsubscribe();
  }, [fetchBuyerAndCheckSavedStatus]);
  
  const handleSaveToggle = async () => {
    if (!currentUser || !buyer) {
        toast({ title: "Please log in as a buyer to save vendors.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        if (isSaved) {
            await unsaveSeller(currentUser.uid, seller.id);
            setIsSaved(false);
            toast({ title: "Vendor Removed", description: `${seller.companyName} has been removed from your saved vendors.`});
        } else {
            await saveSeller(currentUser.uid, seller.id);
            setIsSaved(true);
            toast({ title: "Vendor Saved!", description: `${seller.companyName} has been added to your saved vendors.`});
        }
    } catch (error) {
        console.error("Failed to toggle save state:", error);
        toast({ title: "Error", description: "Could not update your saved vendors list.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const renderActionButtons = () => {
    if (isLoading) {
       return <div className="h-10 w-64 bg-muted rounded-md animate-pulse" />;
    }
    
    // Not logged in
    if (!currentUser) {
       return (
            <div className="flex items-center gap-4">
                 <Button asChild>
                    <Link href={`/login?redirect=${pathname}`}>
                        <Mail className="mr-2 h-4 w-4" /> Login to Contact Seller
                    </Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link href={`/login?redirect=${pathname}`}><Bookmark className="mr-2 h-4 w-4" /> Login to Save</Link>
                </Button>
            </div>
       )
    }
    
    // Logged in as a buyer
    if (buyer) {
        return (
             <div className="flex items-center gap-4">
                 <Button asChild>
                    <a href={`mailto:${seller.contact.email}`}><Mail className="mr-2 h-4 w-4" /> Contact Seller</a>
                </Button>
                <Button variant="outline" onClick={handleSaveToggle} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (isSaved ? <BookmarkCheck className="mr-2 h-4 w-4 text-primary"/> : <Bookmark className="mr-2 h-4 w-4"/>)}
                    {isSaving ? 'Saving...' : (isSaved ? 'Saved' : 'Save Vendor')}
                </Button>
             </div>
        )
    }
    
    // Logged in, but not as a buyer (i.e. a seller or admin)
    return (
        <Button asChild>
            <a href={`mailto:${seller.contact.email}`}><Mail className="mr-2 h-4 w-4" /> Contact Seller</a>
        </Button>
    )
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="bg-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Card className="overflow-hidden shadow-lg">
           <div className="p-8 bg-gradient-to-br from-secondary/40 via-background to-background">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                 <Image src={seller.avatarUrl} alt={seller.name} width={128} height={128} className="rounded-full border-4 border-background shadow-md" data-ai-hint="professional portrait" />
                 <div className="text-center sm:text-left">
                    <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <h1 className="text-3xl md:text-4xl font-headline text-primary">{seller.companyName}</h1>
                        {seller.isVerified && (
                           <div className="flex items-center gap-1 text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
                                <BadgeCheck className="h-5 w-5" />
                                <span>Verified</span>
                           </div>
                        )}
                    </div>
                    <p className="text-xl text-muted-foreground">{seller.name}</p>
                    <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{seller.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>Member since {format(new Date(seller.memberSince), 'MMMM yyyy')}</span>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
          <CardContent className="px-8 pb-8 pt-6">
            <p className="text-base max-w-3xl">{seller.bio}</p>
            <div className="mt-6">
              {renderActionButtons()}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-headline text-primary mb-6">Products from {seller.companyName}</h2>
            {sellerProducts.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {sellerProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <p>This seller has not listed any products yet.</p>
            )}
          </div>

          <div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                ) : currentUser ? (
                  <div className="space-y-4">
                      <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <a href={`mailto:${seller.contact.email}`} className="text-primary hover:underline">{seller.contact.email}</a>
                      </div>
                      {seller.contact.phone && (
                          <div className="flex items-center gap-3">
                              <Phone className="h-5 w-5 text-muted-foreground" />
                              <span>{seller.contact.phone}</span>
                          </div>
                      )}
                      {seller.contact.website && (
                          <div className="flex items-center gap-3">
                              <Globe className="h-5 w-5 text-muted-foreground" />
                              <a href={`https://${seller.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{seller.contact.website}</a>
                          </div>
                      )}
                  </div>
                ) : (
                    <div className="text-center text-muted-foreground bg-secondary/40 p-4 rounded-md">
                        <LogIn className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p>Please <Link href={`/login?redirect=${pathname}`} className="text-primary underline font-semibold">login</Link> or <Link href="/register" className="text-primary underline font-semibold">register</Link> to view the seller's contact details.</p>
                    </div>
                )}
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
