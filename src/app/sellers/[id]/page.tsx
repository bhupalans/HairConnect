import { getSellerById, getProductsBySeller } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { Mail, Phone, Globe, MapPin, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default async function SellerProfilePage({ params }: { params: { id: string } }) {
  const seller = await getSellerById(params.id);

  if (!seller) {
    notFound();
  }

  const sellerProducts = await getProductsBySeller(seller.id);

  return (
    <div className="bg-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Card className="overflow-hidden shadow-lg">
          <div className="h-48 bg-secondary/50 relative">
             <Image src="https://placehold.co/1200x400" alt="Cover image" data-ai-hint="abstract texture" layout="fill" objectFit="cover" />
             <div className="absolute top-24 left-8">
                <Image src={seller.avatarUrl} alt={seller.name} width={160} height={160} className="rounded-full border-4 border-card shadow-md" data-ai-hint="professional portrait" />
             </div>
          </div>
          <CardContent className="pt-28 pb-8 px-8">
            <h1 className="text-3xl md:text-4xl font-headline text-primary">{seller.companyName}</h1>
            <p className="text-xl text-muted-foreground">{seller.name}</p>
            
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{seller.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Member since {format(new Date(seller.memberSince), 'MMMM yyyy')}</span>
                </div>
            </div>

            <p className="mt-6 text-base max-w-3xl">{seller.bio}</p>

            <div className="mt-6">
                <Button asChild>
                    <a href={`mailto:${seller.contact.email}`}><Mail className="mr-2 h-4 w-4" /> Contact Seller</a>
                </Button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
