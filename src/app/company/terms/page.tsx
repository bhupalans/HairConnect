import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline text-primary">Terms of Service</CardTitle>
           <CardDescription className="text-lg text-muted-foreground mt-2">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground max-w-none prose prose-stone dark:prose-invert prose-h3:text-primary/90 prose-h3:font-semibold prose-h3:text-xl">
            <h3>1. Agreement to Terms</h3>
            <p>
                By accessing or using the HairBuySell website and services (the "Service"), you agree to be bound by these Terms of Service ("Terms"). These Terms affect your legal rights and obligations. If you do not agree to be bound by all of these Terms, do not access or use the Service.
            </p>

            <h3>2. User Accounts</h3>
            <p>
                To access certain features of the Service, you must register for an account. When you register, you agree to provide accurate, current, and complete information. You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to reclaim usernames or terminate accounts that are inactive or violate these Terms.
            </p>

            <h3>3. Role of HairBuySell</h3>
            <p>
                HairBuySell is a marketplace platform that connects buyers and sellers of hair products. We are not a party to any transaction between users. We do not buy, sell, or take possession of any products listed on the Service. We are not responsible for the quality, safety, legality, or any other aspect of the products listed, nor for the actions or inactions of any buyer or seller. All transactions are conducted at the users' own risk.
            </p>
            
            <h3>4. Subscriptions and Payments</h3>
            <p>
                We offer optional paid subscriptions for "Verified" status for both buyers and sellers. These subscriptions are billed on a recurring basis. By purchasing a subscription, you agree to pay the specified fees. All payments are handled by our third-party payment processor, Stripe. We are not responsible for any errors made by the payment processor. You may manage or cancel your subscription through the "Billing" tab in your user dashboard.
            </p>

            <h3>5. User Conduct and Content</h3>
            <p>
                You are solely responsible for your conduct and any data, text, information, images, and other content that you submit, post, or display on the Service. You agree not to post content that is illegal, fraudulent, defamatory, or infringes on any third-party's intellectual property rights. We reserve the right, but have no obligation, to remove or modify user content for any reason.
            </p>

            <h3>6. Intellectual Property</h3>
            <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of HairBuySell and its licensors. You retain all rights to the content you post on the Service, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection with the Service.
            </p>

            <h3>7. Termination</h3>
            <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>

            <h3>8. Disclaimers and Limitation of Liability</h3>
            <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the service will be uninterrupted, secure, or error-free. In no event shall HairBuySell, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
            
             <h3>9. Changes to Terms</h3>
            <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Last Updated" date.
            </p>

            <h3>10. Contact Us</h3>
            <p>
                If you have any questions about these Terms, please contact us through our <a href="/company/contact" className="text-primary underline">contact page</a>.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
