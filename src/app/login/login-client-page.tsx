
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "./login-form";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

type UserRole = 'vendor' | 'admin' | 'buyer' | null;

export function LoginClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async (uid: string, retries = 3, delay = 1000): Promise<UserRole> => {
      for (let i = 0; i < retries; i++) {
        const sellerDoc = await getDoc(doc(db, "sellers", uid));
        if (sellerDoc.exists()) return "vendor";
        
        const buyerDoc = await getDoc(doc(db, "buyers", uid));
        if (buyerDoc.exists()) return "buyer";
        
        const adminDoc = await getDoc(doc(db, "admins", uid));
        if (adminDoc.exists()) return "admin";
        
        // If not found, wait for the delay before the next attempt
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      return null;
    };

    const getDashboardPath = (role: UserRole) => {
      switch (role) {
          case "admin": return "/admin/dashboard";
          case "vendor": return "/vendor/dashboard";
          case "buyer": return "/buyer/dashboard";
          default: return "/";
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true); // Show loader while we determine role and redirect
        
        const userRole = await fetchUserRole(user.uid);
        
        if (userRole) {
          if (!user.emailVerified) {
            router.push('/auth/verify-email');
            return;
          }

          toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting you to your dashboard.",
          });
          const redirectUrl = searchParams.get("redirect") || getDashboardPath(userRole);
          router.push(redirectUrl);
          return;
        }
        
        // If user is authenticated but has no role after retries, sign out.
        // This could be an admin trying to use the main login, or a data consistency issue.
        await auth.signOut();
        toast({
            title: "Access Denied",
            description: "Your user role could not be determined. Please use the correct login page or contact support.",
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
