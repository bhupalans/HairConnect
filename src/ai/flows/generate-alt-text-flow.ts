'use server';
/**
 * @fileOverview An AI flow for generating SEO-friendly alt text for product images.
 *
 * - generateAltText - A function that takes an image and a hint and returns a descriptive alt tag.
 * - GenerateAltTextInput - The input type for the generateAltText function.
 * - GenerateAltTextOutput - The return type for the generateAltText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAltTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a hair product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  hint: z.string().describe('A text hint describing the product, e.g., "blonde wavy hair extension". This provides context for the image.'),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z.string().describe('A descriptive, SEO-friendly alt tag for the image.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateAltTextPrompt',
  input: {schema: GenerateAltTextInputSchema},
  output: {schema: GenerateAltTextOutputSchema},
  prompt: `You are an expert in e-commerce SEO. Your task is to generate a concise, descriptive, and SEO-friendly alt tag for the given product image.

The product is related to: {{{hint}}}.

The alt text should accurately describe the image for visually impaired users and for search engine crawlers. Focus on the visual characteristics of the product in the image, such as color, texture, style, and length. Do not include "image of" or "picture of".

Product Hint: {{{hint}}}
Image: {{media url=photoDataUri}}`,
});

const generateAltTextFlow = ai.defineFlow(
  {
    name: 'generateAltTextFlow',
    inputSchema: GenerateAltTextInputSchema,
    outputSchema: GenerateAltTextOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateAltText(input: GenerateAltTextInput): Promise<GenerateAltTextOutput> {
  return generateAltTextFlow(input);
}
