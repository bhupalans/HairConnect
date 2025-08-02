
import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import type { Product } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    category?: string;
    sort?: string;
    texture?: string;
    origin?: string;
    minPrice?: string;
    maxPrice?: string;
    minLength?: string;
    maxLength?: string;
  };
}) {
  const query = searchParams?.query || "";
  const category = searchParams?.category || "";
  const sort = searchParams?.sort || "";
  const textures = searchParams?.texture ? searchParams.texture.split(',') : [];
  const origins = searchParams?.origin ? searchParams.origin.split(',') : [];
  const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const minLength = searchParams?.minLength ? parseInt(searchParams.minLength) : undefined;
  const maxLength = searchParams?.maxLength ? parseInt(searchParams.maxLength) : undefined;


  const products = await getProducts();
  
  // Get unique values for filters from all products
  const allOrigins = [...new Set(products.map(p => p.specs.origin).filter(Boolean))];
  const allTextures = [...new Set(products.map(p => p.specs.texture).filter(Boolean))];


  let filteredProducts = products.filter((product: Product) => {
    const matchesCategory = category ? product.category === category : true;
    const matchesQuery = query ? product.name.toLowerCase().includes(query.toLowerCase()) : true;
    const matchesTexture = textures.length > 0 ? textures.includes(product.specs.texture) : true;
    const matchesOrigin = origins.length > 0 ? origins.includes(product.specs.origin) : true;
    const matchesMinPrice = minPrice !== undefined ? product.price >= minPrice : true;
    const matchesMaxPrice = maxPrice !== undefined ? product.price <= maxPrice : true;
    
    const productLength = parseInt(product.specs.length.replace(' inches', ''));
    const matchesMinLength = minLength !== undefined ? productLength >= minLength : true;
    const matchesMaxLength = maxLength !== undefined ? productLength <= maxLength : true;
    
    return matchesCategory && matchesQuery && matchesTexture && matchesOrigin && matchesMinPrice && matchesMaxPrice && matchesMinLength && matchesMaxLength;
  });

  if (sort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">Our Products</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our extensive collection of high-quality hair from trusted vendors worldwide.
        </p>
      </header>
      
      <div className="grid md:grid-cols-4 gap-8">
        <div className="col-span-1">
           <ProductFilters origins={allOrigins} textures={allTextures} />
        </div>
        <div className="md:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-headline text-primary">No Products Found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
