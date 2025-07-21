
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts, categories, getSourcingRequests } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Gem, Globe, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 4);
  const sourcingRequests = (await getSourcingRequests()).filter(req => req.status === 'active').slice(0, 4);

  return (
    <div className="flex flex-col">
      <section className="relative w-full flex items-center justify-center text-center bg-secondary/30 py-24 md:py-32">
        <Image
          src="https://cdn.pixabay.com/photo/2016/02/14/19/37/person-1200012_1280.jpg"
          alt="Various hair extensions and wigs"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 h-full w-full object-cover brightness-50"
          data-ai-hint="hair extensions wigs"
          priority
        />
        <div className="relative z-10 p-4 text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline">
            HairBuySell: The Global Marketplace for Premium Hair
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Discover, source, and trade the finest quality human hair from trusted vendors around the world.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="font-bold text-base">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-bold text-base">
              <Link href="/sellers">Find a Vendor</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="featured" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center text-primary mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/products" className="font-bold">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section id="categories" className="py-16 md:py-24 bg-secondary/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center text-primary mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {categories.map((category) => (
              <Link href={`/products?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <Card className="hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                      <Image src={category.icon} alt={category.name} width={40} height={40} className="text-primary" />
                    </div>
                    <h3 className="font-headline text-xl text-primary">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="sourcing-requests" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-headline text-center text-primary mb-2">Active Sourcing Requests</h2>
              <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                  Opportunities for sellers. Buyers are actively looking for these products right now.
              </p>
              {sourcingRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sourcingRequests.map(req => (
                           <Card key={req.id} className="p-6 flex flex-col sm:flex-row items-start gap-4">
                              <div className="bg-primary/10 p-3 rounded-full hidden sm:block">
                                  <ShoppingBag className="h-6 w-6 text-primary"/>
                              </div>
                              <div className="flex-grow">
                                  <p className="font-semibold text-foreground mb-1 line-clamp-2">{req.requestDetails}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Posted by {req.buyerCompanyName || req.buyerName} - {formatDistanceToNow(new Date(req.datePosted), { addSuffix: true })}
                                  </p>
                              </div>
                              <Button asChild variant="secondary" className="mt-2 sm:mt-0 w-full sm:w-auto">
                                  <Link href={`/buyers/${req.buyerId}`}>View Details</Link>
                              </Button>
                           </Card>
                      ))}
                  </div>
              ) : (
                  <p className="text-center text-muted-foreground">There are no active sourcing requests at the moment.</p>
              )}
          </div>
      </section>

      <section id="why-us" className="py-16 md:py-24 bg-secondary/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center text-primary mb-12">Why Choose HairBuySell?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-headline text-primary mb-2">Unmatched Quality</h3>
              <p className="text-muted-foreground max-w-sm">We connect you with vendors providing only the highest-grade, ethically sourced human hair.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-headline text-primary mb-2">Global Reach</h3>
              <p className="text-muted-foreground max-w-sm">Access a diverse, international market of hair types, textures, and origins.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Gem className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-headline text-primary mb-2">Transparent & Direct</h3>
              <p className="text-muted-foreground max-w-sm">Communicate and transact directly with vendors to get the best deals and custom orders.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
