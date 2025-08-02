
import { getSellers } from "@/lib/data";
import { UserCard } from "@/components/user-card";
import { UserFilters } from "@/components/user-filters";
import type { Seller } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function SellersPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    location?: string;
    verified?: string;
  };
}) {
  const allSellers = await getSellers();

  const query = searchParams?.query || "";
  const locations = searchParams?.location ? searchParams.location.split(',') : [];
  const verifiedOnly = searchParams?.verified === 'true';

  const filteredSellers = allSellers.filter((seller: Seller) => {
    const matchesQuery = query ? (seller.name.toLowerCase().includes(query.toLowerCase()) || seller.companyName.toLowerCase().includes(query.toLowerCase())) : true;
    const matchesLocation = locations.length > 0 ? locations.includes(seller.location.split(', ').pop() as string) : true;
    const matchesVerified = verifiedOnly ? seller.isVerified === true : true;
    
    return matchesQuery && matchesLocation && matchesVerified;
  });
  
  // Get unique locations for filter
  const allCountries = [...new Set(allSellers.map(s => s.location.split(', ').pop() as string).filter(Boolean))].sort();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">Our Sellers</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with trusted and verified hair vendors from all over the world.
        </p>
      </header>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="col-span-1">
           <UserFilters 
             userType="seller"
             locations={allCountries}
           />
        </div>
        <div className="md:col-span-3">
           {filteredSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSellers.map((seller) => (
                <UserCard key={seller.id} user={seller} userType="seller" />
                ))}
            </div>
           ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-headline text-primary">No Sellers Found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
           )}
        </div>
      </div>
    </div>
  );
}
