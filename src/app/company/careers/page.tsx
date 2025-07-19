import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline text-primary">Careers at HairBuySell</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Join our team and help us revolutionize the global hair industry.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground space-y-6">
          <p className="text-xl">
            We are always looking for passionate, talented individuals to join our mission.
          </p>
          <p>
            Currently, there are no open positions. However, we encourage you to check back soon for updates. If you believe you would be a great fit for our team, feel free to send your resume and a cover letter to our contact email.
          </p>
          <div>
            <Button asChild>
                <a href="mailto:careers@hairbuysell.com">Submit Your Resume</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
