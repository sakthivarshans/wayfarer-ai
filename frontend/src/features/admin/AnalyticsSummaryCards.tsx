import { MapPin, Route, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { AnalyticsSummary } from "./types";

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-ink-900">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-text-heading">{value.toLocaleString()}</p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export function AnalyticsSummaryCards({ analytics }: { analytics: AnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={Users} label="Total users" value={analytics.totalUsers} />
        <StatCard icon={Route} label="Trips created" value={analytics.totalTrips} />
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sand-800">
            <MapPin className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="font-display text-lg font-medium text-text-heading">Most-planned destinations</h3>
        </div>

        {analytics.topDestinations.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">No trips yet.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {analytics.topDestinations.map((item, index) => (
              <li key={item.destination} className="flex items-center justify-between text-sm">
                <span className="text-text-body">
                  <span className="mr-2 text-text-muted">{index + 1}.</span>
                  {item.destination}
                </span>
                <span className="font-medium text-text-heading">{item.count}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
