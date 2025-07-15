
import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { QuoteForm } from "./quote-form";

function QuotePageFallback() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-center h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function QuotePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
            <CardTitle className="text-4xl md:text-5xl font-headline text-primary">
              Request a Quote
            </CardTitle>
            <CardDescription className="text-lg">
              Fill out the form below to get a custom quote from our network of vendors.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<QuotePageFallback />}>
            <QuoteForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
