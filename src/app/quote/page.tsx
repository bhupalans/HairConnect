"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { categories } from "@/lib/data";

const quoteFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  hairType: z.string().min(1, "Please select a hair type."),
  length: z.string().min(1, "Please specify a length."),
  color: z.string().min(1, "Please specify a color."),
  texture: z.string().min(1, "Please select a texture."),
  quantity: z.string().min(1, "Please enter a quantity."),
  details: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const defaultValues: Partial<QuoteFormValues> = {};

export default function QuotePage() {
  const { toast } = useToast();
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues,
  });

  function onSubmit(data: QuoteFormValues) {
    console.log(data);
    toast({
      title: "Quote Request Sent!",
      description: "A vendor will contact you shortly. Thank you for using HairConnect.",
    });
    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
            <CardTitle className="text-4xl md:text-5xl font-headline text-primary">Request a Custom Quote</CardTitle>
            <CardDescription className="text-lg">
                Can't find what you're looking for? Fill out the form below to get a custom quote from our network of vendors.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                  control={form.control}
                  name="hairType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hair Type / Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Length (inches)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 18" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Natural Black or #613" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                  control={form.control}
                  name="texture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texture</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a texture" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="straight">Straight</SelectItem>
                          <SelectItem value="wavy">Wavy</SelectItem>
                          <SelectItem value="curly">Curly</SelectItem>
                          <SelectItem value="kinky-curly">Kinky Curly</SelectItem>
                          <SelectItem value="body-wave">Body Wave</SelectItem>
                          <SelectItem value="deep-wave">Deep Wave</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., 3 bundles or 1 wig" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about your needs, e.g., 'double drawn', 'HD lace', etc."
                        className="resize-y min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" size="lg">Submit Request</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
