import { buyers } from "@/lib/data";
import { UserCard } from "@/components/user-card";

export default function BuyersPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">Our Buyers</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover reputable salons, stylists, and distributors looking to source high-quality hair.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {buyers.map((buyer) => (
          <UserCard key={buyer.id} user={buyer} userType="buyer" />
        ))}
      </div>
    </div>
  );
}
