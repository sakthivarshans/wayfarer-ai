import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-slate-800">Page not found</h1>
      <Link href="/" className="text-brand-600 hover:underline">
        Back home
      </Link>
    </main>
  );
}
