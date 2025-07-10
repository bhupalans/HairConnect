
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function RegisterPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Registration Successful!",
      description: "Welcome to HairConnect. You can now manage your vendor dashboard.",
    });
    setIsSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Become a Vendor</CardTitle>
          <CardDescription>
            Join our global marketplace and reach thousands of buyers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">Thank you for registering!</h3>
              <p className="text-muted-foreground mb-6">You're all set. Start managing your store and adding products now.</p>
              <Button asChild>
                <Link href="/vendor/dashboard">Go to Your Dashboard</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="grid gap-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="e.g., Aisha Bella" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" placeholder="e.g., Bella Hair Imports" required />
                  </div>
              </div>
               <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                </div>
              </div>
               <div className="grid md:grid-cols-2 gap-6">
                 <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., Lagos, Nigeria" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="e.g., +1 234 567 8900" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">About Your Business (Bio)</Label>
                <Textarea id="bio" placeholder="Tell buyers about your products and what makes your business unique." required />
              </div>
              <CardFooter className="p-0 pt-4 flex flex-col items-center gap-4">
                <Button className="w-full" type="submit">Create Account</Button>
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Log in
                    </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
