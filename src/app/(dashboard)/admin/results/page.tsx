import { requireAdmin } from "@/lib/auth";
import ResultsPageClient from "./ResultsPageClient";

export default async function ResultsPage() {
  await requireAdmin();

  return <ResultsPageClient />;
}