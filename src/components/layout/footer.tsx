import Link from "next/link";
import { Gem } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/40 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
             <Link href="/" className="flex items-center gap-2 mb-4">
                <Gem className="h-7 w-7 text-primary" />
                <span className="text-2xl font-headline font-bold text-primary">
                HairBuySell
                </span>
            </Link>
            <p className="text-muted-foreground text-center md:text-left max-w-xs">The premier global marketplace for ethically sourced, high-quality human hair.</p>
          </div>
          
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                    <h3 className="font-headline text-lg font-semibold text-primary mb-4">Marketplace</h3>
                    <ul className="space-y-2">
                        <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link></li>
                        <li><Link href="/sellers" className="text-muted-foreground hover:text-primary transition-colors">Sellers</Link></li>
                        <li><Link href="/buyers" className="text-muted-foreground hover:text-primary transition-colors">Buyers</Link></li>
                        <li><Link href="/quote" className="text-muted-foreground hover:text-primary transition-colors">Request a Quote</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-headline text-lg font-semibold text-primary mb-4">Company</h3>
                    <ul className="space-y-2">
                        <li><Link href="/company/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="/company/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                        <li><Link href="/company/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-headline text-lg font-semibold text-primary mb-4">Legal</h3>
                     <ul className="space-y-2">
                        <li><Link href="/company/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                        <li><Link href="/company/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HairBuySell. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
