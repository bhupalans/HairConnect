
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth, functions } from "@/lib/firebase";
import { getSellerById } from "@/lib/data";
import type { Seller } from "@/lib/types";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ArrowRight, BadgeCheck, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function VerifyPaymentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [seller, setSeller] = useState<Seller | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const sellerProfile = await getSellerById(currentUser.uid);
                if (sellerProfile) {
                    if (sellerProfile.isVerified) {
                        toast({ title: "Already Verified", description: "Your account is already verified." });
                        router.push('/vendor/dashboard');
                        return;
                    }
                    setSeller(sellerProfile);
                } else {
                    toast({ title: "Error", description: "Seller profile not found.", variant: "destructive" });
                    router.push('/login');
                    return;
                }
            } else {
                router.push('/login?redirect=/vendor/verify-payment');
                return;
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [router, toast]);

    const handleProceedToPayment = async () => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to proceed.", variant: "destructive" });
            return;
        }
        setIsRedirecting(true);

        try {
            // Use the httpsCallable for the new onRequest function
            const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
            const result = await createCheckoutSession({
                success_url: `${window.location.origin}/payment-status?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: window.location.href,
            });
            
            const data = result.data as { url: string };
            if (data.url) {
                // Redirect to Stripe's checkout page
                window.location.href = data.url;
            } else {
                 throw new Error("No checkout URL returned.");
            }
        } catch (error) {
            console.error("Stripe checkout error:", error);
            toast({
                title: "Payment Error",
                description: "Could not connect to our payment provider. Please try again.",
                variant: "destructive",
            });
            setIsRedirecting(false);
        }
    };

    if (isLoading || !seller) {
        return (
            <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 md:py-16">
            <Card className="shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-fit rounded-full bg-primary/10 p-4">
                        <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-headline mt-4">Become a Verified Seller</CardTitle>
                    <CardDescription className="text-lg">
                        Confirm your one-time payment to gain a verified badge and build trust with buyers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-secondary/30 p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Item</span>
                            <span className="font-semibold">Seller Verification Fee</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Billed to</span>
                            <span className="font-semibold">{seller.companyName} ({seller.contact.email})</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-2xl font-bold text-primary">$10.00 (One-time)</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-center">Verification Benefits</h3>
                        <ul className="list-inside list-disc space-y-1 text-muted-foreground text-center">
                            <li><BadgeCheck className="inline-block h-4 w-4 mr-2 text-green-600"/>Gain a verified badge on your profile</li>
                            <li><BadgeCheck className="inline-block h-4 w-4 mr-2 text-green-600"/>Build trust and credibility with buyers</li>
                            <li><BadgeCheck className="inline-block h-4 w-4 mr-2 text-green-600"/>Increase your visibility in seller listings</li>
                        </ul>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleProceedToPayment} disabled={isRedirecting} size="lg" className="w-full">
                            {isRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Proceed to Pay
                            {!isRedirecting && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
