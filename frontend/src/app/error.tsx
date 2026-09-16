"use client";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
      <h1 className="text-xl font-semibold text-text-heading">Something went wrong</h1>
      <p className="text-text-body">Please try again.</p>
      <button
        onClick={reset}
        className="rounded-full bg-ink-900 px-4 py-2 text-white hover:bg-ink-950"
      >
        Retry
      </button>
    </main>
  );
}
