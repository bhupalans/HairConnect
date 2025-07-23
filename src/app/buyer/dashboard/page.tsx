
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function BuyerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // A more robust role check will be added later
        setUser(currentUser);
      } else {
        router.push("/login?redirect=/buyer/dashboard");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-primary">Buyer Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user?.displayName || user?.email}!
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
          <CardDescription>
            This dashboard is currently being built. Come back soon to manage your profile, sourcing requests, and quotes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Thank you for your patience!</p>
        </CardContent>
      </Card>
    </div>
  );
}
