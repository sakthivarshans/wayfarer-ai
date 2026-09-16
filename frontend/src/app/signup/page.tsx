import Link from "next/link";
import { SignupForm } from "@/features/auth/SignupForm";
import { site } from "@/config/site";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-6">
      <div className="w-full max-w-sm rounded-card bg-surface-card p-8 shadow-card">
        <h1 className="text-xl font-bold text-text-heading">{site.name}</h1>
        <p className="mt-1 text-sm text-text-body">Create an account to start planning.</p>
        <div className="mt-6">
          <SignupForm />
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
