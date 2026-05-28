// =============================================================
// SFL — Street Football League
// app/admin/matches/new/page.tsx
// =============================================================

import { requireAdmin } from "@/lib/auth-helpers";
import type { Metadata } from "next";
import CreateMatchForm  from "./_components/CreateMatchForm";

export const metadata: Metadata = { title: "Новый матч — SFL Admin" };

export default async function NewMatchPage() {
  await requireAdmin();
  return <CreateMatchForm />;
}
