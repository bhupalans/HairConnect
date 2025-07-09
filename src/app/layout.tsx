import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "HairConnect - Global Human Hair Marketplace",
  description: "Your premier global marketplace for buying and selling high-quality human hair. Connect with suppliers, buy in bulk, and grow your hair business online.",
  keywords: [
    'buy human hair in bulk',
    'non-Remy hair bundles wholesale',
    'Indian hair supplier',
    'Vietnamese vs Chinese hair',
    'how to test human hair quality',
    'sell human hair online',
    'list my human hair business',
    'become a hair vendor',
    'export human hair from India',
    'start selling hair globally',
    'human hair marketplace',
    'raw hair',
    'virgin hair',
    'hair extensions',
    'wigs',
    'wholesale wig vendors',
    'hair factory direct',
    'private label hair extensions',
    'dropshipping hair vendors',
    'hair suppliers for salons',
    'B2B hair marketplace',
    'ethical hair suppliers',
    'raw hair vs virgin hair',
    'HD lace front wigs',
    'Vietnamese bone straight bundles',
    'double drawn hair',
    'kinky curly clip-ins',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
