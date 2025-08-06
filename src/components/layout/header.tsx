
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Gem, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Seller, Buyer } from "@/lib/types";
import { Separator } from "../ui/separator";


const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <Gem className="h-7 w-7 text-primary" />
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
  const [userRole, setUserRole] = useState<'vendor' | 'admin' | 'buyer' | null>(null);
  const [userProfile, setUserProfile] = useState<Partial<Seller | Buyer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserRole = async (uid: string): Promise<{ role: 'vendor' | 'admin' | 'buyer' | null, profile: any | null }> => {
        const sellerDocRef = doc(db, "sellers", uid);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
            return { role: "vendor", profile: { id: sellerDoc.id, ...sellerDoc.data() } as Seller };
        }
        
        const buyerDocRef = doc(db, "buyers", uid);
        const buyerDoc = await getDoc(buyerDocRef);
        if (buyerDoc.exists()) {
             return { role: "buyer", profile: { id: buyerDoc.id, ...buyerDoc.data() } };
        }
        
        const adminDocRef = doc(db, "admins", uid);
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists()) {
            return { role: "admin", profile: { name: 'Admin', avatarUrl: '' } };
        }

        return { role: null, profile: null };
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const { role, profile } = await fetchUserRole(currentUser.uid);
        
        // Admin users do not need email verification to use their dashboard.
        if (role === 'admin' || currentUser.emailVerified) {
          setUserRole(role);
          setUserProfile(profile);
        } else {
          // User is logged in but not verified
          setUserRole(null);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [pathname]); // Re-run on route change to catch state after login/logout navigation

  const handleLogout = () => {
    signOut(auth).then(() => {
      setSheetOpen(false);
      router.push("/");
    });
  };

  const getDashboardPath = () => {
      switch (userRole) {
          case "admin": return "/admin/dashboard";
          case "vendor": return "/vendor/dashboard";
          case "buyer": return "/buyer/dashboard";
          default: return "/";
      }
  }

  const renderAuthSection = () => {
    if (isLoading) {
      return <Loader2 className="h-6 w-6 animate-spin" />;
    }
    
    // Check for userRole which is now correctly set for admins
    if (user && userRole) {
       const dashboardPath = getDashboardPath();
       const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);
       
       return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                {userProfile?.avatarUrl && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                )}
                <span>{userProfile?.companyName || userProfile?.name || 'My Account'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Logged in as {roleLabel}</DropdownMenuLabel>
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
          <Link href="/login">Login / Sign Up</Link>
        </Button>
    );
  }
  
  const renderMobileAuthSection = () => {
      if (isLoading) {
          return null;
      }
      if (user && userRole && userProfile) {
          const dashboardPath = getDashboardPath();
          const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);
          return (
               <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                        <AvatarFallback className="text-2xl">{userProfile.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{userProfile.companyName || userProfile.name}</p>
                        <p className="text-sm text-muted-foreground">{roleLabel}</p>
                    </div>
                  </div>
                  <Separator className="my-2" />
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
         <div className="flex flex-col gap-4">
            <Button asChild size="lg" onClick={() => setSheetOpen(false)}>
                <Link href="/login">Login / Sign Up</Link>
            </Button>
         </div>
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
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
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
                  <Separator className="my-2" />
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
