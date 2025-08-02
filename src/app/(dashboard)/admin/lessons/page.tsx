import { requireAdmin } from "@/lib/auth";
import LessonsPageClient from "./LessonsPageClient";

export default async function LessonsPage() {
  await requireAdmin();

  return <LessonsPageClient />;
}