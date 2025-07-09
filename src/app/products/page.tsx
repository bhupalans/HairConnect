import { products, categories } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    category?: string;
    sort?: string;
  };
}) {
  const query = searchParams?.query || "";
  const category = searchParams?.category || "";
  const sort = searchParams?.sort || "";

  let filteredProducts = products.filter((product) => {
    const matchesCategory = category ? product.category === category : true;
    const matchesQuery = query ? product.name.toLowerCase().includes(query.toLowerCase()) : true;
    return matchesCategory && matchesQuery;
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

      <ProductFilters categories={categories} />

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
  );
}
