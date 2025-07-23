
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Building } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">Join HairBuySell</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose your role to get started. Connect with a global network of hair professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/register/vendor" className="block">
          <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Building className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">I am a Vendor</CardTitle>
              <CardDescription className="text-base pt-2">
                List your products, manage your inventory, and connect with buyers from around the world.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Button variant="secondary" className="w-full">Register as a Vendor</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/register/buyer" className="block">
          <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="items-center text-center">
               <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">I am a Buyer</CardTitle>
              <CardDescription className="text-base pt-2">
                Source high-quality hair, request quotes, and discover new vendors for your business needs.
              </CardDescription>
            </CardHeader>
             <CardContent className="text-center">
                <Button variant="secondary" className="w-full">Register as a Buyer</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
      <p className="mt-12 text-muted-foreground">
        Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
      </p>
    </div>
  );
}
