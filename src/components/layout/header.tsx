
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Scissors, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Seller } from "@/lib/types";


const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <Scissors className="h-7 w-7 text-primary" />
    <span className="text-2xl font-headline font-bold text-primary">
      HairBuySell
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
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'vendor' | 'admin' | null>(null);
  const [sellerProfile, setSellerProfile] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // Determine user role and fetch profile data if needed
        const sellerDocRef = doc(db, "sellers", currentUser.uid);
        const sellerDoc = await getDoc(sellerDocRef);
        
        if (sellerDoc.exists()) {
          setUserRole("vendor");
          setSellerProfile({ id: sellerDoc.id, ...sellerDoc.data() } as Seller);
        } else {
          const adminDocRef = doc(db, "admins", currentUser.uid);
          const adminDoc = await getDoc(adminDocRef);
          if (adminDoc.exists()) {
            setUserRole("admin");
            setSellerProfile(null);
          } else {
            setUserRole(null); // Should not happen if DB is consistent
            setSellerProfile(null);
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        setSellerProfile(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setSheetOpen(false); // Close mobile menu on logout
      router.push("/");
    });
  };

  const dashboardPath = userRole === "admin" ? "/admin/dashboard" : "/vendor/dashboard";

  const renderAuthSection = () => {
    if (isLoading) {
      return <Loader2 className="h-6 w-6 animate-spin" />;
    }

    if (user && userRole === 'vendor' && sellerProfile) {
       return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={sellerProfile.avatarUrl} alt={sellerProfile.name} />
                    <AvatarFallback>{sellerProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{sellerProfile.companyName || sellerProfile.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Logged in as Vendor</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={dashboardPath}>My Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }

    if (user && userRole === 'admin') {
       return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Admin Account <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Logged in as Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={dashboardPath}>My Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }
    
    return (
       <Button variant="outline" asChild>
          <Link href="/login">Login / Register</Link>
        </Button>
    );
  }
  
  const renderMobileAuthSection = () => {
      if (isLoading) {
          return null; // Or a loading indicator
      }
      if (user && userRole) {
          return (
               <div className="flex flex-col gap-4">
                  <Button asChild size="lg" onClick={() => setSheetOpen(false)}>
                    <Link href={dashboardPath}>My Dashboard</Link>
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleLogout}>
                    Logout
                  </Button>
               </div>
          )
      }
      return (
         <Button variant="outline" asChild size="lg" onClick={() => setSheetOpen(false)}>
            <Link href="/login">Login / Register</Link>
          </Button>
      )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
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
          {renderAuthSection()}
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
                  {renderMobileAuthSection()}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
