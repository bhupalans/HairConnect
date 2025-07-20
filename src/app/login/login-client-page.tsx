
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
        
        // This page is for vendors. Check for seller role.
        const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
        if (sellerDoc.exists()) {
          toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting you to your dashboard.",
          });
          // In the future, we can add an email verification check here.
          // For now, we redirect directly.
          const redirectUrl = searchParams.get("redirect") || "/vendor/dashboard";
          router.push(redirectUrl);
          return;
        }
        
        // If user is authenticated but not in the sellers collection,
        // it means they are not a vendor. Sign them out.
        await auth.signOut();
        toast({
            title: "Access Denied",
            description: "This login is for registered vendors only. Please use the admin login if you are an administrator.",
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
