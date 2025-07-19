
"use client";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      const redirectUrl = searchParams.get("redirect");

      const sellerDocRef = doc(db, "sellers", user.uid);
      const sellerDoc = await getDoc(sellerDocRef);
      const adminDocRef = doc(db, "admins", user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (sellerDoc.exists()) {
        toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting you to your dashboard.",
        });
        const finalRedirectPath = redirectUrl || "/vendor/dashboard";
        router.push(finalRedirectPath);
        return;
      }
      
      if (adminDoc.exists()) {
        toast({
            title: "Login Successful",
            description: "Welcome back, Admin! Redirecting you to your dashboard.",
        });
        const finalRedirectPath = redirectUrl || "/admin/dashboard";
        router.push(finalRedirectPath);
        return;
      }

      // If user exists in Auth but not in sellers or admins DB
      await auth.signOut();
      toast({
        title: "Login Failed",
        description: "Your user profile could not be found. Please contact support.",
        variant: "destructive",
      });
      
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/invalid-credential') {
        form.setError("password", {
            type: "manual",
            message: "Invalid email or password. Please try again.",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)}>
          <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <CardFooter className="flex-col items-stretch gap-3 pt-6 px-0">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                New to HairConnect?{" "}
                <Link href="/register" className="underline text-primary font-medium">
                  Register as a vendor
                </Link>
              </div>
          </CardFooter>
      </form>
    </Form>
  );
}
