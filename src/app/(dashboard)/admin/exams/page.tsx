import { requireAdmin } from "@/lib/auth";
import ExamsPageClient from "./ExamsPageClient";

export default async function ExamsPage() {
  await requireAdmin();

  return <ExamsPageClient />;
}