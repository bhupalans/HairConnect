
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { getOpenQuoteRequests } from '@/lib/data';
import type { QuoteRequest } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function SellerMarketplacePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openRequests, setOpenRequests] = useState<QuoteRequest[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Verify the user is a seller before showing the page
        const sellerDoc = await getDoc(doc(db, 'sellers', currentUser.uid));
        if (sellerDoc.exists()) {
          setIsSeller(true);
          try {
            const requests = await getOpenQuoteRequests();
            setOpenRequests(requests);
          } catch (error) {
            console.error("Failed to fetch open requests:", error);
          }
        } else {
          // If not a seller, redirect away to their respective dashboard or homepage
          const buyerDoc = await getDoc(doc(db, 'buyers', currentUser.uid));
          if (buyerDoc.exists()) {
            router.push('/buyer/dashboard');
          } else {
            router.push('/');
          }
          return;
        }
      } else {
        // No user logged in, redirect to login
        router.push('/login?redirect=/sellers/marketplace');
        return;
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link href="/vendor/dashboard" className={cn(buttonVariants({ variant: 'ghost' }), 'text-muted-foreground')}>
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Back to My Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-headline text-primary">Sourcing Marketplace</CardTitle>
          <CardDescription>
            Browse general quote requests from buyers across the platform. This is your opportunity to find new leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="w-[50%]">Sourcing Need / Details</TableHead>
                    <TableHead>Action</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {openRequests.length > 0 ? (
                    openRequests.map((req) => (
                    <TableRow key={req.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(req.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                        <div className="font-medium">{req.buyerName}</div>
                        <div className="text-xs text-muted-foreground">{req.buyerEmail}</div>
                        </TableCell>
                        <TableCell>{req.quantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-foreground">{req.productName}</span>
                                <p className="whitespace-pre-wrap">{req.details}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                        <Button asChild variant="outline" size="sm">
                            <a href={`mailto:${req.buyerEmail}?subject=Re: Your Sourcing Request on HairBuySell&body=Hello ${req.buyerName},%0D%0A%0D%0AI saw your request for '${req.productName}' and I can help.`}>
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Buyer
                            </a>
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        There are no open sourcing requests at the moment.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
          {/* Mobile Card List */}
          <div className="space-y-4 md:hidden">
            {openRequests.length > 0 ? (
                openRequests.map(req => (
                    <Card key={req.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                             <div className="font-semibold">{req.buyerName}</div>
                             <div className="text-xs text-muted-foreground">{req.buyerEmail}</div>
                           </div>
                           <div className="text-xs text-muted-foreground text-right whitespace-nowrap">
                                {format(new Date(req.date), "dd MMM yyyy")}
                           </div>
                        </div>
                        <div className="border-t pt-3 mt-3">
                            <p className="font-semibold text-foreground">{req.productName}</p>
                            <p className="text-sm text-muted-foreground">Qty: {req.quantity}</p>
                            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{req.details}</p>
                        </div>
                        <div className="mt-3">
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <a href={`mailto:${req.buyerEmail}?subject=Re: Your Sourcing Request on HairBuySell&body=Hello ${req.buyerName},%0D%0A%0D%0AI saw your request for '${req.productName}' and I can help.`}>
                                    <Mail className="mr-2 h-4 w-4"/>
                                    Contact {req.buyerName}
                                </a>
                            </Button>
                        </div>
                    </Card>
                ))
            ) : (
                <div className="text-center py-10">
                    <p>There are no open sourcing requests at the moment.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
