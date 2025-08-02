
import { getBuyers } from "@/lib/data";
import { UserCard } from "@/components/user-card";
import { UserFilters } from "@/components/user-filters";
import type { Buyer } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function BuyersPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    location?: string;
    buyerType?: string;
    yearsInBusiness?: string;
  };
}) {
  const allBuyers = await getBuyers();

  const query = searchParams?.query || "";
  const locations = searchParams?.location ? searchParams.location.split(',') : [];
  const buyerTypes = searchParams?.buyerType ? searchParams.buyerType.split(',') : [];
  const yearsInBusiness = searchParams?.yearsInBusiness ? searchParams.yearsInBusiness.split(',') : [];

  const filteredBuyers = allBuyers.filter((buyer: Buyer) => {
    const matchesQuery = query ? (buyer.name.toLowerCase().includes(query.toLowerCase()) || buyer.companyName?.toLowerCase().includes(query.toLowerCase())) : true;
    const matchesLocation = locations.length > 0 ? locations.includes(buyer.location.split(', ').pop() as string) : true;
    const matchesBuyerType = buyerTypes.length > 0 ? buyerTypes.includes(buyer.buyerType as string) : true;
    const matchesYears = yearsInBusiness.length > 0 ? yearsInBusiness.includes(buyer.yearsInBusiness as string) : true;

    return matchesQuery && matchesLocation && matchesBuyerType && matchesYears;
  });

  // Get unique values for filters from all buyers
  const allCountries = [...new Set(allBuyers.map(b => b.location.split(', ').pop() as string).filter(Boolean))].sort();
  const allBuyerTypes = [...new Set(allBuyers.map(b => b.buyerType).filter(Boolean))];
  const allYearsInBusiness = [...new Set(allBuyers.map(b => b.yearsInBusiness).filter(Boolean))];


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">Our Buyers</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover reputable salons, stylists, and distributors looking to source high-quality hair.
        </p>
      </header>

       <div className="grid md:grid-cols-4 gap-8">
        <div className="col-span-1">
           <UserFilters 
             userType="buyer"
             locations={allCountries}
             buyerTypes={allBuyerTypes}
             yearsInBusiness={allYearsInBusiness}
           />
        </div>
        <div className="md:col-span-3">
          {filteredBuyers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBuyers.map((buyer) => (
                <UserCard key={buyer.id} user={buyer} userType="buyer" />
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
              <h2 className="text-2xl font-headline text-primary">No Buyers Found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
