import { Card, CardHeader } from "@/components/ui/Card";
import { TripPlannerForm } from "@/features/trips/TripPlannerForm";

export default function TripPlannerPage() {
  return (
    <div className="pt-2">
      <Card className="max-w-2xl">
        <CardHeader title="Plan a trip" />
        <TripPlannerForm />
      </Card>
    </div>
  );
}
