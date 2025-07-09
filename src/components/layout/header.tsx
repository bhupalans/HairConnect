"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Scissors } from "lucide-react";
import { useState } from "react";

const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <Scissors className="h-7 w-7 text-primary" />
    <span className="text-2xl font-headline font-bold text-primary">
      HairConnect
    </span>
  </Link>
);

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/sellers", label: "Sellers" },
  { href: "/buyers", label: "Buyers" },
];

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Logo />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button asChild>
            <Link href="/quote">Request a Quote</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Admin Login</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="p-4">
                <div className="mb-8">
                    <Logo />
                </div>
                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSheetOpen(false)}
                      className="text-xl font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-8 flex flex-col gap-4">
                  <Button asChild size="lg" onClick={() => setSheetOpen(false)}>
                    <Link href="/quote">Request a Quote</Link>
                  </Button>
                   <Button variant="outline" asChild size="lg" onClick={() => setSheetOpen(false)}>
                    <Link href="/login">Admin Login</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
