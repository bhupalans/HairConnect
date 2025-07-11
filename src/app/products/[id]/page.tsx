
import { getProductById, getSellerById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, MessageSquareQuote, User } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  const seller = await getSellerById(product.sellerId);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Carousel className="rounded-lg overflow-hidden shadow-lg">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square relative">
                    <Image src={img} alt={`${product.name} image ${index + 1}`} fill className="object-cover" data-ai-hint={`${product.specs.color} ${product.specs.texture} hair`}/>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4"/>
            <CarouselNext className="right-4"/>
          </Carousel>
        </div>

        <div>
          <Badge variant="secondary">{product.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-headline text-primary mt-2">{product.name}</h1>
          <p className="text-3xl font-bold text-primary mt-4 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-lg text-muted-foreground">{product.description}</p>
          
          <div className="mt-6">
            <Button size="lg" className="w-full md:w-auto" asChild>
                <Link href={`/quote?productId=${product.id}`}>
                    <MessageSquareQuote className="mr-2 h-5 w-5"/>
                    Request a Quote
                </Link>
            </Button>
          </div>

          <Separator className="my-8" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                    <span className="capitalize text-muted-foreground">{key}</span>
                    <span className="font-semibold">{value}</span>
                </div>
            ))}
          </div>

          {seller && (
             <Card className="mt-8 bg-secondary/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <User className="h-5 w-5" />
                        Sold By
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Image src={seller.avatarUrl || 'https://placehold.co/60x60'} alt={seller.name} width={60} height={60} className="rounded-full border-2 border-primary/20" data-ai-hint="professional portrait" />
                        <div>
                            <Link href={`/sellers/${seller.id}`} className="text-lg font-bold text-primary hover:underline">{seller.companyName}</Link>
                            <p className="text-muted-foreground">{seller.location}</p>
                        </div>
                    </div>
                </CardContent>
             </Card>
          )}

        </div>
      </div>
    </div>
  );
}
