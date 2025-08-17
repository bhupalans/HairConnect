
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MailCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";

type VerificationStatus = 'verifying' | 'success' | 'error';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [error, setError] = useState<string | null>(null);

  const determineRoleAndRedirect = useCallback(async (uid: string) => {
    try {
      const sellerDoc = await getDoc(doc(db, "sellers", uid));
      if (sellerDoc.exists()) {
        router.push("/vendor/dashboard");
        return;
      }

      const buyerDoc = await getDoc(doc(db, "buyers", uid));
      if (buyerDoc.exists()) {
        router.push("/buyer/dashboard");
        return;
      }
      
      // Fallback if role is not found
      router.push('/login');

    } catch (err) {
       console.error("Redirection error after verification:", err);
       toast({ title: "Error", description: "Could not redirect you to your dashboard.", variant: "destructive"});
       router.push('/login');
    }
  }, [router, toast]);


  useEffect(() => {
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      setError("Verification code not found. Please try the link from your email again.");
      setStatus('error');
      return;
    }

    const handleVerification = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
        toast({
          title: "Email Verified!",
          description: "Your account is now active. Welcome!",
        });
        
        // Wait for auth state to propagate before trying to redirect
        setTimeout(() => {
            if (auth.currentUser) {
                determineRoleAndRedirect(auth.currentUser.uid);
            } else {
                // If user is somehow not logged in, send to login page.
                router.push('/login');
            }
        }, 3000);

      } catch (err: any) {
        console.error("Verification error:", err);
        switch (err.code) {
          case 'auth/expired-action-code':
            setError("This verification link has expired. Please request a new one by trying to log in again.");
            break;
          case 'auth/invalid-action-code':
            setError("This verification link is invalid. It may have already been used or is malformed.");
            break;
          case 'auth/user-disabled':
            setError("Your account has been disabled. Please contact support.");
            break;
          default:
            setError("An unknown error occurred. Please try again.");
            break;
        }
        setStatus('error');
      }
    };

    handleVerification();
  }, [searchParams, toast, determineRoleAndRedirect, router]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Verifying your email address...</p>
            </div>
        );
      case 'success':
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto bg-green-100 p-3 rounded-full w-fit">
                    <MailCheck className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-3xl font-headline">Verification Successful!</CardTitle>
                <p className="text-muted-foreground">Your email has been verified. Redirecting you to your dashboard...</p>
            </div>
        );
      case 'error':
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="text-3xl font-headline text-destructive">Verification Failed</CardTitle>
                <p className="text-muted-foreground">{error}</p>
                <Button asChild>
                    <Link href="/login">Back to Login</Link>
                </Button>
            </div>
        );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader />
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

