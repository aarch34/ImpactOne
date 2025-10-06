'use server';

/**
 * @fileOverview A smart venue recommender AI agent.
 *
 * - recommendVenue - A function that recommends a venue based on the number of attendees and facility needs.
 * - RecommendVenueInput - The input type for the recommendVenue function.
 * - RecommendVenueOutput - The return type for the recommendVenue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendVenueInputSchema = z.object({
  attendees: z
    .number()
    .describe('The expected number of attendees for the event.'),
  facilities: z
    .string()
    .describe(
      'A comma-separated list of required facilities for the event (e.g., projector, whiteboard, sound system).' + 
      'Supported facilities are: projector, whiteboard, sound system, stage, kitchen, wifi.'
    ),
});
export type RecommendVenueInput = z.infer<typeof RecommendVenueInputSchema>;

const RecommendVenueOutputSchema = z.object({
  venue: z.string().describe('The recommended venue for the event.'),
  reason: z.string().describe('The reason for recommending the venue.'),
});
export type RecommendVenueOutput = z.infer<typeof RecommendVenueOutputSchema>;

export async function recommendVenue(
  input: RecommendVenueInput
): Promise<RecommendVenueOutput> {
  return recommendVenueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendVenuePrompt',
  input: {schema: RecommendVenueInputSchema},
  output: {schema: RecommendVenueOutputSchema},
  prompt: `You are an AI venue recommendation expert. Based on the number of attendees and the required facilities, you will recommend the most suitable venue.

Venues available:
- Auditorium (capacity: 500, facilities: projector, sound system, stage)
- Impact Greens (capacity: 200, facilities: projector, whiteboard, sound system, kitchen)
- Ramanujan Hall (capacity: 100, facilities: projector, whiteboard, sound system)

Consider the venue capacity and available facilities when making your recommendation. If a specific facility isn't available at any venue, mention that in the response.

Number of attendees: {{{attendees}}}
Required facilities: {{{facilities}}}

Respond with the recommended venue and a brief explanation of why it is the best choice. Consider the number of attendees and whether the required facilities are available at each venue.

Follow the schema for outputting the response.`,
});

const recommendVenueFlow = ai.defineFlow(
  {
    name: 'recommendVenueFlow',
    inputSchema: RecommendVenueInputSchema,
    outputSchema: RecommendVenueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
