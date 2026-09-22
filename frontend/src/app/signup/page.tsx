import Link from "next/link";
import { SignupForm } from "@/features/auth/SignupForm";
import { AuthLayout } from "@/features/auth/AuthLayout";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Start planning"
      subtitle="Create an account to start planning."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
