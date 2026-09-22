import Link from "next/link";
import { LoginForm } from "@/features/auth/LoginForm";
import { AuthLayout } from "@/features/auth/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to plan your next trip."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-ink-700 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
