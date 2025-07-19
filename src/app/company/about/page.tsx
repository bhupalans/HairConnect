import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline text-primary">About HairBuySell</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Connecting the world through beautiful, ethically sourced hair.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-muted-foreground max-w-none">
          <p>
            Welcome to HairBuySell, the premier global B2B marketplace dedicated to the human hair industry. Our mission is to create a transparent, trustworthy, and efficient platform where hair vendors and buyers can connect, transact, and grow their businesses.
          </p>
          <p>
            Founded by industry veterans who understood the challenges of sourcing high-quality hair, HairBuySell was built to solve a simple problem: how can reputable sellers find serious buyers, and how can buyers trust the quality of the hair they purchase? We bridge that gap by providing a vetted community of professionals, detailed product listings, and direct lines of communication.
          </p>
          <p>
            We believe in ethical sourcing, unparalleled quality, and the power of connection. Whether you are a local collector, a large-scale distributor, a salon owner, or a stylist, HairBuySell is your partner in the global hair trade. Join us in building a more connected and trustworthy hair industry for everyone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
