
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, sendEmailVerification, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // If the email is already verified, redirect to the dashboard.
        if (currentUser.emailVerified) {
          router.push("/vendor/dashboard");
          return;
        }
      } else {
        // No user is logged in, redirect to the login page.
        router.push("/login");
        return;
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);
  
  useEffect(() => {
    if (!user) return;
    
    // Set up an interval to periodically check the email verification status.
    const interval = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        toast({
          title: "Email Verified!",
          description: "Your account is now active. Welcome to your dashboard.",
        });
        router.push("/vendor/dashboard");
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [user, router, toast]);

  const handleResendEmail = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to resend a verification email.",
        variant: "destructive",
      });
      return;
    }
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: "Email Sent!",
        description: "A new verification email has been sent to your inbox.",
      });
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Failed to Send",
        description: "An error occurred while sending the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-secondary/20">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                <MailCheck className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-3xl font-headline mt-4">Verify Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent a verification link to <span className="font-semibold text-primary">{user?.email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
                Please check your inbox (and spam folder) and click the link to activate your account. This page will automatically redirect once you're verified.
            </p>
            <p className="text-sm font-medium text-destructive/80 px-4">
              Note: You must verify your email within 24 hours of registration, or your account will be automatically deleted.
            </p>
            <Button onClick={handleResendEmail} disabled={isResending}>
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend Verification Email
            </Button>
            <div className="text-sm">
                <p>
                    Wrong account?{" "}
                    <button onClick={() => auth.signOut()} className="font-medium text-primary hover:underline">
                        Log out
                    </button>
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
