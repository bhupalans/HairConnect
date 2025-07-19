
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { countries } from "@/lib/countries";

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create a unique list of countries based on dial_code to prevent duplicate key errors
  const uniqueCountriesByDialCode = Array.from(
    countries
      .filter(c => c.dial_code)
      .reduce((map, country) => {
        // Use dial_code as the key to ensure uniqueness.
        // This will keep the first country encountered for a given dial code.
        if (!map.has(country.dial_code!)) {
          map.set(country.dial_code!, country);
        }
        return map;
      }, new Map<string, typeof countries[0]>())
      .values()
  ).sort((a, b) => a.name.localeCompare(b.name));


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const companyName = formData.get("companyName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const country = formData.get("country") as string;
    const city = formData.get("city") as string;
    const phoneCode = formData.get("phoneCode") as string;
    const localPhone = formData.get("localPhone") as string;
    const bio = formData.get("bio") as string;

    const location = city && country ? `${city}, ${country}` : city || country;
    const fullPhoneNumber = phoneCode && localPhone ? `${phoneCode}${localPhone.replace(/\D/g, '')}` : "";


    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Create a corresponding seller document in Firestore
      // The document ID will be the user's UID from Authentication
      await setDoc(doc(db, "sellers", user.uid), {
        name: name,
        companyName: companyName,
        location: location,
        bio: bio,
        avatarUrl: `https://placehold.co/100x100?text=${name.charAt(0)}`,
        memberSince: new Date().toISOString(),
        productIds: [],
        contact: {
          email: user.email,
          phone: fullPhoneNumber,
        },
      });

      toast({
        title: "Registration Successful!",
        description: "Welcome to HairConnect. You can now log in.",
      });

      setIsSubmitted(true);

    } catch (error: any) {
      console.error("Registration error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already registered. Please try logging in.";
      } else if (error.code === 'auth/weak-password') {
        description = "The password is too weak. Please choose a stronger password.";
      }
      toast({
        title: "Registration Failed",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              <p className="text-muted-foreground mb-6">You're all set. You can now log in to access your dashboard.</p>
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="grid gap-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" name="name" placeholder="e.g., Aisha Bella" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" placeholder="e.g., Bella Hair Imports" required />
                  </div>
              </div>
               <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Must be at least 6 characters" required />
                </div>
              </div>
               <div className="grid md:grid-cols-2 gap-6">
                 <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Select name="country" required>
                        <SelectTrigger id="country">
                            <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" placeholder="e.g., Lagos" required />
                  </div>
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="localPhone">Phone Number (Optional)</Label>
                 <div className="flex gap-2">
                    <Select name="phoneCode">
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                           {uniqueCountriesByDialCode.map(c => <SelectItem key={c.dial_code} value={c.dial_code!}>{`${c.name} (${c.dial_code})`}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input id="localPhone" name="localPhone" type="tel" placeholder="e.g., 801 234 5678" />
                 </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">About Your Business (Bio)</Label>
                <Textarea id="bio" name="bio" placeholder="Tell buyers about your products and what makes your business unique." required />
              </div>
              <CardFooter className="p-0 pt-4 flex flex-col items-center gap-4">
                <Button className="w-full" type="submit" disabled={isLoading}>
                   {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
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
