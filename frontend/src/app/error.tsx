"use client";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-slate-800">Something went wrong</h1>
      <p className="text-slate-600">Please try again.</p>
      <button
        onClick={reset}
        className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
      >
        Retry
      </button>
    </main>
  );
}
