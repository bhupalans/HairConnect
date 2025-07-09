import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline text-primary">Terms of Service</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Please read our terms and conditions carefully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground max-w-none">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">1. Introduction</h3>
            <p>
                Welcome to HairConnect. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our platform, you agree to be bound by these Terms. (This is placeholder text).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">2. User Accounts</h3>
            <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service. (This is placeholder text).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">3. Content & Transactions</h3>
            <p>
                Our service allows you to post product listings and engage in transactions with other users. You are responsible for the content you post and the transactions you enter into. HairConnect serves as a platform and is not a party to any transaction between buyers and sellers. (This is placeholder text).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">4. Limitation of Liability</h3>
            <p>
                In no event shall HairConnect, nor its directors or employees, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service. (This is placeholder text).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">5. Changes to Terms</h3>
            <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. (This is placeholder text).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
