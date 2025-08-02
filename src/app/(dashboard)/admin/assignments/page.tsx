import { requireAdmin } from "@/lib/auth";
import AssignmentsPageClient from "./AssignmentsPageClient";

export default async function AssignmentsPage() {
  await requireAdmin();

  return <AssignmentsPageClient />;
}