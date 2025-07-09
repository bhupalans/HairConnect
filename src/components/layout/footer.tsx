import Link from "next/link";
import { Scissors } from "lucide-react";

const footerLinks = [
  { href: "/products", label: "Products" },
  { href: "/sellers", label: "Sellers" },
  { href: "/buyers", label: "Buyers" },
  { href: "/quote", label: "Request a Quote" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="bg-secondary/40 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
             <Link href="/" className="flex items-center gap-2 mb-4">
                <Scissors className="h-7 w-7 text-primary" />
                <span className="text-2xl font-headline font-bold text-primary">
                HairConnect
                </span>
            </Link>
            <p className="text-muted-foreground text-center md:text-left max-w-xs">The premier global marketplace for ethically sourced, high-quality human hair.</p>
          </div>
          
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                    <h3 className="font-headline text-lg font-semibold text-primary mb-4">Marketplace</h3>
                    <ul className="space-y-2">
                        {footerLinks.slice(0, 4).map(link => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h3 className="font-headline text-lg font-semibold text-primary mb-4">Company</h3>
                    <ul className="space-y-2">
                        <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-headline text-lg font-semibold text-primary mb-4">Legal</h3>
                     <ul className="space-y-2">
                        {footerLinks.slice(4).map(link => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HairConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
