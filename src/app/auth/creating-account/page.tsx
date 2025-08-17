
"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addBuyer } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { BuyerRegistrationData } from '@/lib/types';

export default function CreatingAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const effectRan = useRef(false);

  useEffect(() => {
    // This check prevents the effect from running twice in development due to React.StrictMode.
    if (effectRan.current === true) {
      return;
    }
    effectRan.current = true;

    const processRegistration = async () => {
      // Retrieve the registration data from sessionStorage
      const storedData = sessionStorage.getItem('buyerRegistrationData');

      if (!storedData) {
        toast({
          title: 'Registration Error',
          description: 'No registration data found. Please try again.',
          variant: 'destructive',
        });
        router.push('/register/buyer');
        return;
      }

      try {
        const registrationData: BuyerRegistrationData = JSON.parse(storedData);
        
        // Call the function to create the user and their Firestore document
        await addBuyer(registrationData);
        
        toast({
          title: "Registration Successful!",
          description: "A verification email has been sent. Please check your inbox.",
        });

        // Clean up sessionStorage
        sessionStorage.removeItem('buyerRegistrationData');

        // Redirect to the unified email verification instructions page
        router.push('/auth/verify-email');

      } catch (error: any) {
        console.error('Account creation error:', error);
        
        // Clean up sessionStorage even on error
        sessionStorage.removeItem('buyerRegistrationData');

        if (error.code === 'auth/email-already-in-use') {
          toast({
            title: 'Email Already Registered',
            description: 'This email is already in use. Please try logging in.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registration Failed',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          });
        }
        
        // Redirect back to the registration page on failure
        router.push('/register/buyer');
      }
    };

    processRegistration();
    // The empty dependency array ensures this effect runs only once on mount.
    // Eslint will warn, but it is the intended behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/20 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Creating your account, please wait...</p>
    </div>
  );
}
