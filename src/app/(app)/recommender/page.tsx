import { RecommenderForm } from "@/components/app/recommender-form";

export default function RecommenderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Smart Venue Recommender</h1>
        <p className="text-muted-foreground">Let our AI assistant help you find the perfect venue for your event.</p>
      </div>
      <div className="flex justify-center">
        <RecommenderForm />
      </div>
    </div>
  );
}
