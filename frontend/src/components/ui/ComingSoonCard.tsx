import { Card } from "./Card";

export function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-text-heading">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-text-body">{description}</p>
    </Card>
  );
}
