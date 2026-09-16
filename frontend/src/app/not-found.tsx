import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-page px-6 text-center">
      <h1 className="text-xl font-semibold text-text-heading">Page not found</h1>
      <Link href="/" className="text-ink-700 hover:underline">
        Back home
      </Link>
    </main>
  );
}
