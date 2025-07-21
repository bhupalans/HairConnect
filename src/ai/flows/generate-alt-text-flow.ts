'use server';
/**
 * @fileOverview An AI flow for generating SEO-friendly alt text for images.
 *
 * - generateAltText - A function that takes an image data URI and returns a descriptive alt text.
 * - GenerateAltTextInput - The input type for the generateAltText function.
 * - GenerateAltTextOutput - The return type for the generateAltText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAltTextInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z.string().describe('The generated SEO-friendly alt text for the image, no more than 125 characters.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;


const prompt = ai.definePrompt({
    name: 'generateAltTextPrompt',
    input: { schema: GenerateAltTextInputSchema },
    output: { schema: GenerateAltTextOutputSchema },
    prompt: `You are an SEO expert for an e-commerce marketplace that sells human hair products like wigs, bundles, and extensions.

Your task is to generate a concise, descriptive, and SEO-friendly alt text for the provided product image.

The alt text should:
- Be a maximum of 125 characters.
- Accurately describe the main subject of the image (e.g., color, texture, style of hair).
- Be useful for visually impaired users and search engines.
- Do not include "image of" or "picture of".

Image: {{media url=imageDataUri}}`,
});

const generateAltTextFlow = ai.defineFlow(
  {
    name: 'generateAltTextFlow',
    inputSchema: GenerateAltTextInputSchema,
    outputSchema: GenerateAltTextOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateAltText(
  input: GenerateAltTextInput
): Promise<GenerateAltTextOutput> {
  return generateAltTextFlow(input);
}
