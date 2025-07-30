
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email to reset your password." }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handlePasswordReset = async (values: z.infer<typeof formSchema>) => {
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsSubmitted(true); // Show success message
    } catch (error: any) {
      console.error("Password reset error:", error);
      // We show a generic message to prevent email enumeration attacks
      // This is a security best practice
      setIsSubmitted(true); 
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-secondary/20">
        <Card className="w-full max-w-sm shadow-xl text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <MailCheck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline mt-4">Check Your Email</CardTitle>
                <CardDescription className="text-base">
                    If an account exists for <span className="font-semibold text-primary">{form.getValues('email')}</span>, you will receive a password reset link.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/login">Back to Login</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-secondary/20">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Reset Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to get back into your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
              <div className="text-center text-sm">
                 <Link href="/login" className="font-medium text-primary hover:underline">
                    Back to Login
                 </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
