"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthContext";
import { getAuthErrorMessage } from "./authErrors";

export function SignupForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email, password);
      router.push("/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text-heading">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-surface-border px-3 py-2 text-sm text-text-heading outline-none focus:border-ink-500 focus:ring-2 focus:ring-ink-100"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-text-heading">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-surface-border px-3 py-2 text-sm text-text-heading outline-none focus:border-ink-500 focus:ring-2 focus:ring-ink-100"
        />
        <p className="text-xs text-text-muted">At least 6 characters.</p>
      </div>
      {error && <p className="text-sm text-status-danger">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
