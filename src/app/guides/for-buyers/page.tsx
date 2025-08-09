
import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function BuyerGuidePage() {
  const filePath = path.join(process.cwd(), 'BUYER_GUIDE.md');
  const markdownContent = await fs.readFile(filePath, 'utf8');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
            <CardTitle className="text-4xl font-headline text-primary">Buyer's Guide</CardTitle>
        </CardHeader>
        <CardContent>
            <article className="prose prose-stone dark:prose-invert max-w-none prose-h1:font-headline prose-h1:text-primary prose-h2:font-headline prose-h2:text-primary/90 prose-h3:font-headline prose-h3:text-primary/80 prose-a:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent}
                </ReactMarkdown>
            </article>
        </CardContent>
      </Card>
    </div>
  );
}
