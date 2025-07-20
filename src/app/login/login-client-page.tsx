
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "./login-form";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function LoginClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true); // Show loader while we determine role and redirect
        
        // Check for admin role first.
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
        
        // If not admin, check for seller role.
        const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
        if (sellerDoc.exists()) {
          toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting you to your dashboard.",
          });
          // This is where we would add an email verification check in the future.
          // For now, we redirect directly.
          const redirectUrl = searchParams.get("redirect") || "/vendor/dashboard";
          router.push(redirectUrl);
          return;
        }
        
        // Fallback if user is in auth but not DB (e.g., deleted from Firestore)
        // This is a security measure to prevent orphaned auth accounts from staying logged in.
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
        <div className="flex justify-center items-center py-4 h-[280px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return <LoginForm />;
}
