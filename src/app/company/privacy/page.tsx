import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline text-primary">Privacy Policy</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Your privacy is important to us.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground max-w-none">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">1. Information We Collect</h3>
            <p>
                We collect information you provide directly to us, such as when you create an account, list a product, or communicate with other users. This may include your name, email address, company details, and any other information you choose to provide. (This is placeholder text).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">2. How We Use Information</h3>
            <p>
                We use the information we collect to operate, maintain, and provide you with the features and functionality of the service, as well as to communicate directly with you, such as to send you email messages and push notifications. (This is placeholder text).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">3. Sharing of Information</h3>
            <p>
                We do not share your personal information with third parties except as described in this Privacy Policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf. (This is placeholder text).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">4. Your Choices</h3>
            <p>
                You may update or correct your account information at any time by logging into your account. You can also unsubscribe from promotional email communications from us by following the instructions in those emails. (This is placeholder text).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary/90">5. Contact Us</h3>
            <p>
                If you have any questions about this Privacy Policy, please contact us. (This is placeholder text).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
