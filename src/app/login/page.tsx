
"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LoginForm } from "./login-form";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

function AuthPageFallback() {
    return (
        <div className="flex justify-center items-center py-4 h-[280px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect them away from the login page.
        // The header will determine the correct dashboard.
        // We'll give a slight delay for the user context to be fully established.
        router.push('/vendor/dashboard');
      } else {
        // User is not logged in, show the page.
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] bg-secondary/20">
            <AuthPageFallback />
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
