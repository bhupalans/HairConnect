import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline text-primary">Privacy Policy</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground max-w-none prose prose-stone dark:prose-invert prose-h3:text-primary/90 prose-h3:font-semibold prose-h3:text-xl">
          <p>
            HairBuySell ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the "Service"). Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>

          <h3>1. Information We Collect</h3>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Service includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, company name, location, and contact information that you voluntarily give to us when you register for an account or when you choose to participate in various activities related to the Service, such as creating a profile or sending a quote request.
            </li>
            <li>
              <strong>Profile and Product Data:</strong> Information you provide in your public profile (e.g., bio, years in business) and any data or images you upload for product listings.
            </li>
            <li>
              <strong>Financial Data:</strong> We may collect data related to your payment method (e.g., subscription status, customer ID) when you subscribe to our "Verified" services. All payment information is stored and processed by our payment processor, Stripe. You should review their privacy policy and contact them directly for responses to your questions.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Service.
            </li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Facilitate communication and transactions between buyers and sellers.</li>
            <li>Process payments and subscriptions for "Verified" status.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable user-to-user communications.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
          </ul>

          <h3>3. Sharing of Your Information</h3>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <ul>
            <li>
              <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
            </li>
            <li>
              <strong>With Other Users:</strong> When you interact with other users of the Service (e.g., as a buyer viewing a seller's profile or a seller receiving a quote request), those users will see your name, company name, profile photo, and other details you have made public.
            </li>
            <li>
              <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (Stripe), data analysis, email delivery, hosting services (Firebase), and customer service.
            </li>
          </ul>
          
          <h3>4. Data Security & Retention</h3>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. We will retain your information for as long as your account is active or as needed to provide you services and to comply with our legal obligations.
          </p>

          <h3>5. Your Rights and Choices</h3>
          <p>
            You may at any time review or change the information in your account by logging into your account settings and updating your profile. If you wish to terminate your account, you may do so by contacting us using the contact information provided below. Upon your request, we will deactivate or delete your account and information from our active databases.
          </p>
          
          <h3>6. Contact Us</h3>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us through our <a href="/company/contact" className="text-primary underline">contact page</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
