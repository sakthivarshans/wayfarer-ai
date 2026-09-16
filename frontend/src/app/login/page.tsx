import Link from "next/link";
import { LoginForm } from "@/features/auth/LoginForm";
import { site } from "@/config/site";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-6">
      <div className="w-full max-w-sm rounded-card bg-surface-card p-8 shadow-card">
        <h1 className="text-xl font-bold text-text-heading">{site.name}</h1>
        <p className="mt-1 text-sm text-text-body">Sign in to plan your next trip.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-ink-700 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
