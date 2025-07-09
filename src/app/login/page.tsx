import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/20">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Login</CardTitle>
          <CardDescription>
            Access your HairConnect dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <Button asChild>
            <Link href="/admin/dashboard">Sign in as Admin</Link>
          </Button>
           <Button variant="secondary" asChild>
            <Link href="/vendor/dashboard">Sign in as Vendor</Link>
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            New to HairConnect?{" "}
            <Link href="/register" className="underline text-primary font-medium">
              Register as a vendor
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
