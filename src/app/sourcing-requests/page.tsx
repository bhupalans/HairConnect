
import { getSourcingRequests } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SourcingRequestsPage() {
  const sourcingRequests = (await getSourcingRequests()).filter(req => req.status === 'active');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">Active Sourcing Requests</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore all active requests from buyers across the platform. Find your next opportunity here.
        </p>
      </header>
      
      {sourcingRequests.length > 0 ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {sourcingRequests.map(req => (
            <Card key={req.id} className="p-6 flex flex-col sm:flex-row items-start gap-4 transition-shadow hover:shadow-md">
                <div className="bg-primary/10 p-3 rounded-full mt-1 hidden sm:block">
                    <ShoppingBag className="h-6 w-6 text-primary"/>
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-lg text-foreground mb-1">{req.requestDetails}</p>
                    <p className="text-sm text-muted-foreground">
                        Posted by {req.buyerCompanyName || req.buyerName} - {formatDistanceToNow(new Date(req.datePosted), { addSuffix: true })}
                    </p>
                </div>
                <Button asChild variant="secondary" className="mt-2 sm:mt-0 w-full sm:w-auto flex-shrink-0">
                    <Link href={`/buyers/${req.buyerId}`}>View Buyer Profile</Link>
                </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-headline text-primary">No Active Requests</h2>
          <p className="text-muted-foreground mt-2">There are currently no active sourcing requests. Check back soon!</p>
        </div>
      )}

    </div>
  );
}
