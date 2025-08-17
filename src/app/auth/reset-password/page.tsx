
"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type PageStatus = 'loading' | 'invalid' | 'valid' | 'success';

const formSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<PageStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleVerifyCode = useCallback(async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code);
      setActionCode(code);
      setStatus('valid');
    } catch (err: any) {
      console.error("Password reset code verification error:", err);
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
    const oobCode = searchParams.get('oobCode');
    if (oobCode) {
      handleVerifyCode(oobCode);
    } else {
      setErrorMessage("No password reset code found in the URL. Please use the link from your email.");
      setStatus('invalid');
    }
  }, [searchParams, handleVerifyCode]);

  const handleResetSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!actionCode) {
      toast({ title: "Error", description: "Action code is missing. Cannot reset password.", variant: "destructive" });
      return;
    }

    try {
      await confirmPasswordReset(auth, actionCode, values.password);
      setStatus('success');
    } catch (error: any) {
        console.error("Password reset confirmation error:", error);
        toast({ title: "Error", description: "Failed to reset password. The link may have expired.", variant: "destructive" });
        setStatus('invalid');
        setErrorMessage("Failed to reset your password. The link may have expired. Please try requesting a new one.");
    }
  };


  const renderContent = () => {
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
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                <div className="mx-auto bg-green-100 p-3 rounded-full w-fit">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-3xl font-headline">Password Changed!</CardTitle>
                <p className="text-muted-foreground">Your password has been successfully updated. You can now log in with your new password.</p>
                <Button asChild>
                    <Link href="/login">Back to Login</Link>
                </Button>
            </div>
         );
      case 'invalid':
        return (
            <div className="text-center space-y-4 p-6">
                <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="text-3xl font-headline text-destructive">Link Invalid</CardTitle>
                <p className="text-muted-foreground">{errorMessage}</p>
                <Button asChild>
                    <Link href="/forgot-password">Request a New Link</Link>
                </Button>
            </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
        {renderContent()}
    </Card>
  );
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

export default function ResetPasswordPage() {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-secondary/20 p-4">
        <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordContent />
        </Suspense>
      </div>
    );
}
