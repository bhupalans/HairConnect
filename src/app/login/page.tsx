
"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LoginForm } from "./login-form";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

function AuthPageFallback() {
    return (
        <div className="flex justify-center items-center py-4 h-[280px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true); // Show loader while we determine role and redirect
        // User is logged in, determine role and redirect.
        const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
        if (sellerDoc.exists()) {
          toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting you to your dashboard.",
          });
          const redirectUrl = searchParams.get("redirect") || "/vendor/dashboard";
          router.push(redirectUrl);
          return;
        }
        
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
           toast({
            title: "Login Successful",
            description: "Welcome back, Admin! Redirecting you to your dashboard.",
          });
          const redirectUrl = searchParams.get("redirect") || "/admin/dashboard";
          router.push(redirectUrl);
          return;
        }
        
        // Fallback if user is in auth but not DB (shouldn't happen in normal flow)
        // Keep them on login page but stop loading.
        await auth.signOut();
        toast({
            title: "Login Failed",
            description: "Your user profile could not be found. Please contact support.",
            variant: "destructive",
        });
        setIsLoading(false);

      } else {
        // User is not logged in, show the login page.
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, toast, searchParams]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] bg-secondary/20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] bg-secondary/20">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Login</CardTitle>
            <CardDescription>
                Access your HairConnect dashboard.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Suspense fallback={<AuthPageFallback />}>
                <LoginForm />
            </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
