
import { getBuyerById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default async function BuyerProfilePage({ params }: { params: { id: string } }) {
  const buyer = await getBuyerById(params.id);

  if (!buyer) {
    notFound();
  }

  return (
    <div className="bg-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Card className="overflow-hidden shadow-lg">
           <div className="p-8 bg-gradient-to-br from-secondary/40 via-background to-background">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                 <Image src={buyer.avatarUrl} alt={buyer.name} width={128} height={128} className="rounded-full border-4 border-background shadow-md" data-ai-hint="professional portrait" />
                 <div className="text-center sm:text-left">
                    <h1 className="text-3xl md:text-4xl font-headline text-primary">{buyer.companyName || buyer.name}</h1>
                    {buyer.companyName && <p className="text-xl text-muted-foreground">{buyer.name}</p>}
                    <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{buyer.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>Member since {format(new Date(buyer.memberSince), 'MMMM yyyy')}</span>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
          <CardContent className="px-8 pb-8 pt-6">
            <p className="text-base max-w-3xl">{buyer.bio}</p>
            <div className="mt-6">
                <Button asChild>
                    <a href={`mailto:${buyer.contact.email}`}><Mail className="mr-2 h-4 w-4" /> Contact Buyer</a>
                </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Sourcing Needs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This buyer is actively seeking new vendors. Reach out to them with your product catalog if you believe it's a good fit.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
