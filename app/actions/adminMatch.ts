"use server";

// =============================================================
// SFL — Street Football League
// app/actions/adminMatch.ts
// Действия администратора над матчем
// =============================================================

import { z }            from "zod";
import { prisma }       from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

// ── Смена статуса матча ──────────────────────────────────────

const statusSchema = z.object({
  matchId: z.string().cuid(),
  status:  z.enum(["DRAFT","OPEN","HOT","FULL","IN_PROGRESS","COMPLETED","CANCELLED"]),
});

export async function updateMatchStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = statusSchema.safeParse({
    matchId: formData.get("matchId"),
    status:  formData.get("status"),
  });
  if (!parsed.success) return;

  await prisma.match.update({
    where: { id: parsed.data.matchId },
    data:  { status: parsed.data.status },
  });

  revalidatePath(`/admin/matches/${parsed.data.matchId}`);
  revalidatePath("/admin");
  revalidatePath("/matches");
}

// ── Отметить оплату вручную ──────────────────────────────────

const paymentSchema = z.object({
  registrationId: z.string().cuid(),
  matchId:        z.string().cuid(),
});

export async function markPaymentAction(formData: FormData) {
  const session = await requireAdmin();

  const parsed = paymentSchema.safeParse({
    registrationId: formData.get("registrationId"),
    matchId:        formData.get("matchId"),
  });
  if (!parsed.success) return;

  const { registrationId, matchId } = parsed.data;

  // Обновляем или создаём Payment
  const existing = await prisma.payment.findUnique({
    where: { registrationId },
  });

  if (existing) {
    await prisma.payment.update({
      where: { registrationId },
      data:  {
        status:          "MANUAL",
        markedByAdminId: session.user.id,
        markedAt:        new Date(),
        paidAt:          new Date(),
      },
    });
  } else {
    // Получаем сумму из матча
    const match = await prisma.match.findUnique({
      where:  { id: matchId },
      select: { priceSom: true },
    });

    await prisma.payment.create({
      data: {
        registrationId,
        userId:          (await prisma.matchRegistration.findUnique({
          where:  { id: registrationId },
          select: { userId: true },
        }))!.userId,
        amountSom:       match?.priceSom ?? 0,
        status:          "MANUAL",
        provider:        "manual",
        markedByAdminId: session.user.id,
        markedAt:        new Date(),
        paidAt:          new Date(),
      },
    });
  }

  // Подтверждаем регистрацию
  await prisma.matchRegistration.update({
    where: { id: registrationId },
    data:  { status: "CONFIRMED" },
  });

  revalidatePath(`/admin/matches/${matchId}`);
}

// ── Удалить игрока из матча ──────────────────────────────────

const kickSchema = z.object({
  registrationId: z.string().cuid(),
  matchId:        z.string().cuid(),
});

export async function kickPlayerAction(formData: FormData) {
  await requireAdmin();

  const parsed = kickSchema.safeParse({
    registrationId: formData.get("registrationId"),
    matchId:        formData.get("matchId"),
  });
  if (!parsed.success) return;

  await prisma.matchRegistration.update({
    where: { id: parsed.data.registrationId },
    data:  { status: "KICKED" },
  });

  revalidatePath(`/admin/matches/${parsed.data.matchId}`);
  revalidatePath("/matches");
}

// ── Обновить счёт матча ──────────────────────────────────────

const scoreSchema = z.object({
  matchId:    z.string().cuid(),
  teamAScore: z.coerce.number().int().min(0).max(99),
  teamBScore: z.coerce.number().int().min(0).max(99),
});

export async function updateScoreAction(formData: FormData) {
  await requireAdmin();

  const parsed = scoreSchema.safeParse({
    matchId:    formData.get("matchId"),
    teamAScore: formData.get("teamAScore"),
    teamBScore: formData.get("teamBScore"),
  });
  if (!parsed.success) return;

  await prisma.match.update({
    where: { id: parsed.data.matchId },
    data:  {
      teamAScore: parsed.data.teamAScore,
      teamBScore: parsed.data.teamBScore,
      status:     "COMPLETED",
    },
  });

  revalidatePath(`/admin/matches/${parsed.data.matchId}`);
  revalidatePath("/matches");
}
