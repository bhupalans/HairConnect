
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { getBuyerById } from "@/lib/data";
import type { Buyer } from "@/lib/types";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ArrowRight, BadgeCheck, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BuyerVerifyPaymentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [buyer, setBuyer] = useState<Buyer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const buyerProfile = await getBuyerById(currentUser.uid);
                if (buyerProfile) {
                    if (buyerProfile.isVerified) {
                        toast({ title: "Already Verified", description: "Your account is already verified." });
                        router.push('/buyer/dashboard');
                        return;
                    }
                    setBuyer(buyerProfile);
                } else {
                    toast({ title: "Error", description: "Buyer profile not found.", variant: "destructive" });
                    router.push('/login');
                    return;
                }
            } else {
                router.push('/login?redirect=/buyer/verify-payment');
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
            const token = await user.getIdToken();
            const functionUrl = 'https://us-central1-hairconnect-db.cloudfunctions.net/createCheckoutSession';

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    success_url: `${window.location.origin}/payment-status?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: window.location.href,
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create checkout session.');
            }

            const session = await response.json();

            if (session.url) {
                window.location.href = session.url;
            } else {
                 throw new Error("No checkout URL returned.");
            }
        } catch (error: any) {
            console.error("Stripe checkout error:", error);
            toast({
                title: "Payment Error",
                description: error.message || "Could not connect to our payment provider. Please try again.",
                variant: "destructive",
            });
            setIsRedirecting(false);
        }
    };

    if (isLoading || !buyer) {
        return (
            <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-xl px-4 py-8 md:py-16">
            <Card className="shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-fit rounded-full bg-primary/10 p-4">
                        <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-headline mt-4">Become a Verified Buyer</CardTitle>
                    <CardDescription className="text-lg">
                        Start your monthly subscription to build trust and get prioritized responses from sellers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-secondary/30 p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Item</span>
                            <span className="font-semibold">Buyer Verification Subscription</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Billed to</span>
                            <span className="font-semibold">{buyer.name} ({buyer.contact.email})</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-2xl font-bold text-primary">$5.00 / month</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-center">Subscription Benefits</h3>
                        <div className="space-y-2 text-muted-foreground max-w-md mx-auto">
                            <div className="flex items-start">
                                <BadgeCheck className="h-5 w-5 mr-2 text-green-600 mt-0.5 flex-shrink-0"/>
                                <span>Gain a <span className="font-semibold text-primary">verified badge</span> on your profile to stand out.</span>
                            </div>
                            <div className="flex items-start">
                                <BadgeCheck className="h-5 w-5 mr-2 text-green-600 mt-0.5 flex-shrink-0"/>
                                <span>Signal to sellers that you are a <span className="font-semibold text-primary">serious and committed buyer</span>.</span>
                            </div>
                            <div className="flex items-start">
                                <BadgeCheck className="h-5 w-5 mr-2 text-green-600 mt-0.5 flex-shrink-0"/>
                                <span>Get <span className="font-semibold text-primary">prioritized responses</span> from top vendors.</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleProceedToPayment} disabled={isRedirecting} size="lg" className="w-full">
                            {isRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Proceed to Payment
                            {!isRedirecting && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    