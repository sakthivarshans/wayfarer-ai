import Link from "next/link";

const RESULT_TABS = [
  { href: "/results/places", label: "Places" },
  { href: "/results/transport", label: "Transport" },
  { href: "/results/hotels", label: "Hotels" },
] as const;

/**
 * Shared shell for the three results sub-tabs. Each tab page below renders
 * only a loading-skeleton / "no data yet" placeholder until its
 * corresponding backend phase (2, 3, 4) is built.
 */
export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section>
      <h1 className="text-2xl font-bold">Results</h1>
      <div className="mt-4 flex gap-2 border-b border-slate-200">
        {RESULT_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-t-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
