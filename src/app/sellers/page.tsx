
import { getSellers } from "@/lib/data";
import { UserCard } from "@/components/user-card";

export const dynamic = 'force-dynamic';

export default async function SellersPage() {
  const sellers = await getSellers();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">Our Sellers</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with trusted and verified hair vendors from all over the world.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {sellers.map((seller) => (
          <UserCard key={seller.id} user={seller} userType="seller" />
        ))}
      </div>
    </div>
  );
}
