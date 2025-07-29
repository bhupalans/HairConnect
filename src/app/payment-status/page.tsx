
"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  // This check is simple. The real verification happens in the webhook.
  // We just show a success message if the user is redirected here from Stripe.
  if (!sessionId) {
    // If someone navigates here directly without a session_id, redirect them.
    router.replace('/');
    return (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="mt-4 text-3xl font-headline">Payment Successful!</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Thank you for your payment. Your account verification is being processed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="rounded-md bg-secondary/50 p-3 text-sm">
          <p className="text-muted-foreground">Your reference ID is:</p>
          <p className="font-mono text-xs break-all">{sessionId}</p>
        </div>
        <p className="text-muted-foreground">
          It may take a few moments for the "Verified" badge to appear on your profile. You can now return to your dashboard.
        </p>
        <div>
          <Button asChild>
            <Link href="/vendor/dashboard">Go to My Dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentStatusPage() {
    return (
        <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-secondary/20 p-4">
            <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-primary" />}>
                <PaymentStatusContent />
            </Suspense>
        </div>
    )
}
