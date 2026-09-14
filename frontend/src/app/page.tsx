import { site } from "@/config/site";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold text-brand-700">{site.name}</h1>
      <p className="max-w-md text-slate-600">{site.description}</p>
      <p className="text-sm text-slate-400">
        Scaffolding phase — sign-up, trip planner, and results pages are built in later phases.
      </p>
    </main>
  );
}
