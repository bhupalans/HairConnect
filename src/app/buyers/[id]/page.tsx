

import { getBuyerById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, CalendarDays, BarChart3, Clock, Bookmark, Building, User, Briefcase, ShoppingBag, BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import type { Buyer } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const buyerTypeLabels: Record<NonNullable<Buyer['buyerType']>, string> = {
    salon: "Salon Owner",
    distributor: "Distributor / Wholesaler",
    stylist: "Independent Stylist",
    retailer: "Retailer",
    other: "Other"
}

export default async function BuyerProfilePage({ params }: { params: { id: string } }) {
  const buyer = await getBuyerById(params.id);

  if (!buyer) {
    notFound();
  }
  
  const websiteLink = buyer.contact?.website ? (buyer.contact.website.startsWith('http') ? buyer.contact.website : `https://${buyer.contact.website}`) : null;

  return (
    <div className="bg-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <Card className="overflow-hidden shadow-lg">
               <div className="p-8 bg-gradient-to-br from-secondary/40 via-background to-background">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                     <Image src={buyer.avatarUrl} alt={buyer.name} width={128} height={128} className="rounded-full border-4 border-background shadow-md" data-ai-hint="professional portrait" />
                     <div className="text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <h1 className="text-3xl md:text-4xl font-headline text-primary">{buyer.companyName || buyer.name}</h1>
                            {buyer.isVerified && (
                               <div className="flex items-center gap-1 text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
                                    <BadgeCheck className="h-5 w-5" />
                                    <span>Verified</span>
                               </div>
                            )}
                        </div>
                        {buyer.companyName && <p className="text-xl text-muted-foreground">{buyer.name}</p>}
                        <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{buyer.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                <span>Member since {format(new Date(buyer.memberSince), 'MMMM yyyy')}</span>
                            </div>
                        </div>
                     </div>
                  </div>
               </div>
              <CardContent className="px-8 pb-8 pt-6">
                 <h2 className="text-2xl font-headline text-primary mb-4">About {buyer.companyName || buyer.name}</h2>
                 <p className="text-base max-w-3xl whitespace-pre-wrap">{buyer.bio}</p>
                 <div className="mt-6">
                    <Button asChild>
                        <a href={`mailto:${buyer.contact.email}`}><Mail className="mr-2 h-4 w-4" /> Contact Buyer</a>
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
              <Card>
                 <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Briefcase />
                        Business Details
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3 text-sm">
                    {buyer.buyerType && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Buyer Type</span>
                            <span className="font-semibold">{buyerTypeLabels[buyer.buyerType]}</span>
                        </div>
                    )}
                    {buyer.yearsInBusiness && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Years in Business</span>
                            <span className="font-semibold">{buyer.yearsInBusiness} years</span>
                        </div>
                    )}
                    {websiteLink && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Website</span>
                            <a href={websiteLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline truncate">
                                {buyer.contact.website}
                            </a>
                        </div>
                    )}
                 </CardContent>
              </Card>
              
               <Card>
                 <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <BarChart3 />
                        Activity Snapshot
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Quote Requests Sent</span>
                        <span className="font-semibold">{buyer.quoteRequestCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Saved Vendors</span>
                        <span className="font-semibold">{buyer.savedSellerIds?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Active</span>
                        <span className="font-semibold">{format(new Date(buyer.lastActivity || buyer.memberSince), 'dd MMM yyyy')}</span>
                    </div>
                 </CardContent>
              </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

    