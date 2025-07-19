
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const redirectUrl = searchParams.get("redirect");

      const sellerDocRef = doc(db, "sellers", user.uid);
      const sellerDoc = await getDoc(sellerDocRef);

      if (sellerDoc.exists()) {
        toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting you to your dashboard.",
        });
        const finalRedirectPath = redirectUrl || "/vendor/dashboard";
        router.push(finalRedirectPath);
        return;
      } else {
        await auth.signOut();
        toast({
          title: "Login Failed",
          description: "Your user profile could not be found. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please check your credentials and try again.";
      }
      toast({
        title: "Login Failed",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
        </div>
        <CardFooter className="flex-col items-stretch gap-3 pt-6 px-0">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
  );
}
