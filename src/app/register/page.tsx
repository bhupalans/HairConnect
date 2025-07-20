
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
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { countries } from "@/lib/countries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";


const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  country: z.string({ required_error: "Please select a country." }).min(1, "Please select a country."),
  city: z.string().min(1, { message: "City is required." }),
  phoneCode: z.string().optional(),
  localPhone: z.string().optional(),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions." }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Error will be shown on the confirmPassword field
});


export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      city: "",
      phoneCode: "",
      localPhone: "",
      bio: "",
      terms: false,
    },
  });
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect them away from the register page.
        router.push('/vendor/dashboard');
      } else {
        // User is not logged in, show the page.
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const uniqueCountriesByDialCode = useMemo(() => {
    const seen = new Set();
    return countries
      .filter(c => {
        if (!c.dial_code || seen.has(c.dial_code)) {
          return false;
        }
        seen.add(c.dial_code);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
  
  const handleCountryChange = (countryName: string) => {
    form.setValue('country', countryName);
    const countryData = countries.find(c => c.name === countryName);
    if (countryData?.dial_code) {
      form.setValue('phoneCode', countryData.dial_code);
    }
  };


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const location = values.city && values.country ? `${values.city}, ${values.country}` : values.city || values.country;
    const fullPhoneNumber = values.phoneCode && values.localPhone ? `${values.phoneCode}${values.localPhone.replace(/\D/g, '')}` : "";

    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Step 1.5: Send verification email
      await sendEmailVerification(user);

      // Step 2: Create a corresponding seller document in Firestore
      await setDoc(doc(db, "sellers", user.uid), {
        name: values.name,
        companyName: values.companyName,
        location: location,
        bio: values.bio,
        avatarUrl: `https://placehold.co/100x100?text=${values.name.charAt(0)}`,
        memberSince: new Date().toISOString(),
        productIds: [],
        contact: {
          email: user.email,
          phone: fullPhoneNumber,
        },
      });

      toast({
        title: "Registration Successful!",
        description: "A verification email has been sent. Please check your inbox.",
      });

      // Step 3: Redirect to the dashboard where auth guards will handle the next step
      router.push('/vendor/dashboard');

    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === 'auth/email-already-in-use') {
        form.setError("email", {
          type: "manual",
          message: "This email is already registered. Please try logging in.",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  if (isLoading) {
     return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] bg-secondary/20">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Aisha Bella" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl><Input placeholder="e.g., Bella Hair Imports" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                    <div></div>
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" placeholder="Must be at least 6 characters" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl><Input type="password" placeholder="Re-enter your password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={handleCountryChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((c, index) => <SelectItem key={c.code + index} value={c.name}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl><Input placeholder="e.g., Lagos" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                 </div>
                 <div className="grid gap-2">
                   <Label>Phone Number (Optional)</Label>
                   <div className="flex gap-2">
                      <FormField control={form.control} name="phoneCode" render={({ field }) => (
                        <FormItem className="w-[240px]">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Country Code" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               {uniqueCountriesByDialCode.map((c, index) => <SelectItem key={c.dial_code! + index} value={c.dial_code!}>{`${c.name} (${c.dial_code})`}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="localPhone" render={({ field }) => (
                          <FormItem className="flex-grow">
                             <FormControl><Input type="tel" placeholder="e.g., 801 234 5678" {...field} /></FormControl>
                             <FormMessage />
                          </FormItem>
                      )} />
                   </div>
                 </div>
                 <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Your Business (Bio)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell buyers about your products and what makes your business unique." className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                 )} />
                 <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the HairBuySell{" "}
                            <Link href="/company/terms" className="underline text-primary hover:text-primary/80" target="_blank">
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/company/privacy" className="underline text-primary hover:text-primary/80" target="_blank">
                              Privacy Policy
                            </Link>
                            .
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                <CardFooter className="p-0 pt-4 flex flex-col items-center gap-4">
                  <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
                     {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    
