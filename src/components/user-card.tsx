import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Seller, Buyer } from "@/lib/types";
import { Button } from "./ui/button";
import { MapPin, BadgeCheck } from "lucide-react";

interface UserCardProps {
  user: Seller | Buyer;
  userType: 'seller' | 'buyer';
}

export function UserCard({ user, userType }: UserCardProps) {
  const profileLink = `/${userType}s/${user.id}`;
  
  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
      <CardContent className="p-6 flex-grow flex flex-col items-center">
        <Link href={profileLink} className="block">
          <div className="relative h-24 w-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/20">
            <Image
              src={user.avatarUrl}
              alt={user.name}
              data-ai-hint="professional portrait"
              fill
              className="object-cover"
            />
          </div>
        </Link>
        <Link href={profileLink} className="block">
          <div className="flex items-center gap-2 justify-center">
            <CardTitle className="text-xl font-headline leading-tight hover:text-primary transition-colors">
              {'companyName' in user && user.companyName ? user.companyName : user.name}
            </CardTitle>
            {user.isVerified && <BadgeCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />}
          </div>
        </Link>
        {'companyName' in user && user.companyName && (
           <CardDescription className="text-base">{user.name}</CardDescription>
        )}
        <div className="flex items-center text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 mr-1"/>
            <span>{user.location}</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground flex-grow line-clamp-3">{user.bio}</p>
      </CardContent>
      <CardFooter className="p-4 bg-secondary/20">
        <Button asChild className="w-full">
            <Link href={profileLink}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
