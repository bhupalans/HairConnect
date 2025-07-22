
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getQuoteRequests, getContactMessages } from "@/lib/data";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { QuoteRequest, ContactMessage } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";


export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("quote-requests");
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (activeTab === 'quote-requests') {
            const requests = await getQuoteRequests();
            setQuoteRequests(requests);
        }
        if (activeTab === 'messages') {
            const messages = await getContactMessages();
            setContactMessages(messages);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Error", description: "Could not fetch data for the current tab.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [activeTab, toast]);
  
  const renderTableContent = (Component: React.ReactNode) => {
    return isLoading ? (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : Component;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Review incoming messages and quote requests.</p>
      </header>

      <Tabs defaultValue="quote-requests" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="quote-requests">Quote Requests</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="quote-requests">
          <Card>
            <CardHeader>
              <CardTitle>Quote Requests</CardTitle>
              <CardDescription>
                A log of all quote requests submitted on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableContent(
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Vendor ID</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteRequests.length > 0 ? quoteRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="text-sm">
                            {format(new Date(req.date), "PPp")}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{req.buyerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {req.buyerEmail}
                            </div>
                          </TableCell>
                          <TableCell>{req.productId}</TableCell>
                          <TableCell>{req.sellerId}</TableCell>
                          <TableCell>{req.quantity}</TableCell>
                          <TableCell className="max-w-[300px] text-sm text-muted-foreground whitespace-pre-wrap">{req.details || 'N/A'}</TableCell>
                        </TableRow>
                      )) : (
                      <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">No quote requests yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>
                Messages submitted through the contact form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTableContent(
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactMessages.length > 0 ? contactMessages.map((msg) => (
                        <TableRow key={msg.id}>
                          <TableCell className="text-sm">
                            {format(new Date(msg.date), "PPp")}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{msg.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {msg.email}
                            </div>
                          </TableCell>
                          <TableCell>{msg.subject}</TableCell>
                          <TableCell className="max-w-[400px] text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</TableCell>
                        </TableRow>
                      )) : (
                      <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">No messages yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
