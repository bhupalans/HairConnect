"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Scissors, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This effect runs on the client after hydration, so window.localStorage is available.
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      setLoggedInUser(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setSheetOpen(false); // Close mobile menu on logout
    router.push("/");
  };

  const dashboardPath = loggedInUser === "admin" ? "/admin/dashboard" : "/vendor/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b">
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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Button asChild>
            <Link href="/quote">Request a Quote</Link>
          </Button>
          {loggedInUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  My Account <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Logged in as {loggedInUser === 'admin' ? 'Admin' : 'Vendor'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardPath}>My Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">Login / Register</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
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
                  {loggedInUser ? (
                     <div className="flex flex-col gap-4">
                        <Button asChild size="lg" onClick={() => setSheetOpen(false)}>
                          <Link href={dashboardPath}>My Dashboard</Link>
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleLogout}>
                          Logout
                        </Button>
                     </div>
                  ) : (
                    <Button variant="outline" asChild size="lg" onClick={() => setSheetOpen(false)}>
                      <Link href="/login">Login / Register</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
