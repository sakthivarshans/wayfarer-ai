import { ComingSoonCard } from "@/components/ui/ComingSoonCard";

export default function MyTripsPage() {
  return (
    <div className="pt-2">
      <ComingSoonCard
        title="Your trips"
        description="Every trip you've planned, so you can revisit or regenerate it. Built alongside trip creation in Phase 4."
      />
    </div>
  );
}
