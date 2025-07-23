
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { Button } from "./ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/600x600';
  const imageAlt = product.images && product.images.length > 0 ? product.images[0].alt : product.name;

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <Link href={`/products/${product.id}`} className="block">
        <CardHeader className="p-0">
          <div className="relative aspect-square">
            <Image
              src={imageUrl}
              alt={imageAlt}
              data-ai-hint={`${product.specs.color} ${product.specs.texture} hair`}
              fill
              className="object-cover"
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">{product.category}</Badge>
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-lg font-headline leading-tight hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-secondary/20">
        <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
        <Button asChild size="sm">
            <Link href={`/products/${product.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
