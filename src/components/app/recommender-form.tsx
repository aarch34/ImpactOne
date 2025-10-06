"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { recommendVenue, RecommendVenueOutput } from "@/ai/flows/smart-venue-recommender";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  attendees: z.coerce.number().min(1, "Please enter the number of attendees."),
  facilities: z.string().min(3, "Please list required facilities."),
});

export function RecommenderForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendVenueOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attendees: 100,
      facilities: "projector, whiteboard",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const response = await recommendVenue(values);
      setResult(response);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Could not get recommendations. Please try again.",
      });
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Event Requirements</CardTitle>
            <CardDescription>
              Tell us about your event, and we'll suggest the best venue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Attendees</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Facilities</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., projector, whiteboard, sound system" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Get Recommendation
            </Button>
          </CardFooter>
        </form>
      </Form>

      {result && (
        <CardContent className="border-t pt-6">
            <div className="flex items-center gap-2 text-lg font-headline font-semibold text-primary">
                <Building2 className="h-5 w-5"/>
                <span>Recommended Venue</span>
            </div>
            <div className="mt-4 rounded-lg border bg-accent/20 p-4">
                <h3 className="text-xl font-bold text-accent-foreground">{result.venue}</h3>
                <p className="mt-2 text-sm text-foreground/80">{result.reason}</p>
            </div>
        </CardContent>
      )}
    </Card>
  );
}
