// =============================================================
// SFL — Street Football League
// app/admin/matches/[id]/edit/page.tsx
// =============================================================

import { requireAdmin }  from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";
import EditMatchForm     from "./_components/EditMatchForm";

export const metadata: Metadata = { title: "Редактировать матч — SFL Admin" };

export default async function EditMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const match = await prisma.match.findUnique({
    where:  { id },
    select: {
      id: true, title: true, date: true, address: true,
      venueName: true, priceSom: true, maxPlayers: true,
      description: true, status: true,
    },
  });

  if (!match) notFound();

  // Форматируем дату и время для input[type=date/time]
  const dt      = new Date(match.date);
  const dateStr = dt.toISOString().split("T")[0];
  const timeStr = dt.toTimeString().slice(0, 5);

  return (
    <EditMatchForm
      match={{
        ...match,
        date:        dateStr,
        time:        timeStr,
        venueName:   match.venueName   ?? "",
        description: match.description ?? "",
      }}
    />
  );
}
