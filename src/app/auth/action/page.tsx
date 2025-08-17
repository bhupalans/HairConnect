
"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc } from "firebase/firestore";

// --- Components for different auth actions ---

// 1. VERIFY EMAIL COMPONENT
const VerifyEmailAction = ({ oobCode }: { oobCode: string }) => {
  type VerificationStatus = 'verifying' | 'success' | 'error';
  const router = useRouter();
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
      
      router.push('/login');

    } catch (err) {
       console.error("Redirection error after verification:", err);
       toast({ title: "Error", description: "Could not redirect you to your dashboard.", variant: "destructive"});
       router.push('/login');
    }
  }, [router, toast]);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
        toast({
          title: "Email Verified!",
          description: "Your account is now active. Welcome!",
        });
        
        setTimeout(() => {
            if (auth.currentUser) {
                determineRoleAndRedirect(auth.currentUser.uid);
            } else {
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
  }, [oobCode, toast, determineRoleAndRedirect, router]);

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
                <p className="text-muted-foreground">Your email has been verified. Redirecting you...</p>
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
}


// 2. RESET PASSWORD COMPONENT
const formSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const ResetPasswordAction = ({ oobCode }: { oobCode: string }) => {
  type PageStatus = 'loading' | 'invalid' | 'valid' | 'success';
  const { toast } = useToast();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleVerifyCode = useCallback(async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code);
      setStatus('valid');
    } catch (err: any) {
        switch (err.code) {
          case 'auth/expired-action-code':
            setErrorMessage("This password reset link has expired. Please request a new one.");
            break;
          case 'auth/invalid-action-code':
            setErrorMessage("This reset link is invalid. It may have already been used or is malformed.");
            break;
          default:
            setErrorMessage("An unknown error occurred. Please try again.");
            break;
        }
      setStatus('invalid');
    }
  }, []);

  useEffect(() => {
    handleVerifyCode(oobCode);
  }, [oobCode, handleVerifyCode]);

  const handleResetSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setStatus('success');
    } catch (error: any) {
        console.error("Password reset confirmation error:", error);
        toast({ title: "Error", description: "Failed to reset password. The link may have expired.", variant: "destructive" });
        setStatus('invalid');
        setErrorMessage("Failed to reset your password. The link may have expired. Please try requesting a new one.");
    }
  };

  switch (status) {
      case 'loading':
        return (
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Verifying reset link...</p>
            </div>
        );
      case 'valid':
        return (
          <>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">Create New Password</CardTitle>
                <CardDescription>Please enter a new password for your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleResetSubmit)} className="space-y-6">
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                        <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Set New Password
                    </Button>
                  </form>
                </Form>
            </CardContent>
          </>
        );
      case 'success':
         return (
            <div className="text-center space-y-4 p-6">
                <div className="mx-auto bg-green-100 p-3 rounded-full w-fit"><CheckCircle className="h-12 w-12 text-green-600" /></div>
                <CardTitle className="text-3xl font-headline">Password Changed!</CardTitle>
                <p className="text-muted-foreground">Your password has been successfully updated. You can now log in.</p>
                <Button asChild><Link href="/login">Back to Login</Link></Button>
            </div>
         );
      case 'invalid':
        return (
            <div className="text-center space-y-4 p-6">
                <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit"><AlertCircle className="h-12 w-12 text-destructive" /></div>
                <CardTitle className="text-3xl font-headline text-destructive">Link Invalid</CardTitle>
                <p className="text-muted-foreground">{errorMessage}</p>
                <Button asChild><Link href="/forgot-password">Request a New Link</Link></Button>
            </div>
        );
    }
}


// --- MAIN PAGE COMPONENT (The Router) ---

function ActionHandler() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (!mode || !oobCode) {
        return (
             <div className="text-center space-y-4">
                <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit"><AlertCircle className="h-12 w-12 text-destructive" /></div>
                <CardTitle className="text-3xl font-headline text-destructive">Invalid Link</CardTitle>
                <p className="text-muted-foreground">The action link is missing necessary information.</p>
                <Button asChild><Link href="/">Go to Homepage</Link></Button>
            </div>
        )
    }

    switch (mode) {
        case 'verifyEmail':
            return <VerifyEmailAction oobCode={oobCode} />;
        case 'resetPassword':
            return <ResetPasswordAction oobCode={oobCode} />;
        default:
            return (
                <div className="text-center space-y-4">
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit"><AlertCircle className="h-12 w-12 text-destructive" /></div>
                    <CardTitle className="text-3xl font-headline text-destructive">Unsupported Action</CardTitle>
                    <p className="text-muted-foreground">This action is not supported by the application.</p>
                    <Button asChild><Link href="/">Go to Homepage</Link></Button>
                </div>
            );
    }
}

function LoadingFallback() {
    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardContent className="p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AuthActionPage() {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <Suspense fallback={<LoadingFallback />}>
            <ActionHandler />
          </Suspense>
        </Card>
      </div>
    );
}
