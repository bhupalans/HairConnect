
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { Mail, Phone, Globe, MapPin, CalendarDays, Loader2, LogIn, BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import type { Seller, Product } from "@/lib/types";
import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname } from "next/navigation";

interface SellerProfileClientPageProps {
  seller: Seller;
  sellerProducts: Product[];
}

export function SellerProfileClientPage({ seller, sellerProducts }: SellerProfileClientPageProps) {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const isLoading = currentUser === undefined;
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);


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
                           <div className="flex items-center gap-1 text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                <BadgeCheck className="h-5 w-5" />
                                <span className="font-semibold text-sm">Verified</span>
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
              {currentUser ? (
                <Button asChild>
                    <a href={`mailto:${seller.contact.email}`}><Mail className="mr-2 h-4 w-4" /> Contact Seller</a>
                </Button>
              ) : (
                <Button asChild variant="secondary">
                    <Link href={`/login?redirect=${pathname}`}><LogIn className="mr-2 h-4 w-4" /> Login to Contact Seller</Link>
                </Button>
              )}
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
            {currentUser ? (
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
              </Card>
            ) : (
               <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Please <Link href="/login" className="text-primary underline">login</Link> or <Link href="/register" className="text-primary underline">register</Link> to view the seller's contact details.</p>
                  </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
