import { PageLoading } from "@/components/ui/PageLoading";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page">
      <PageLoading />
    </div>
  );
}
