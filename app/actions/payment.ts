"use server";

// =============================================================
// SFL — app/actions/payment.ts
// Способы оплаты:
//   CARD — перевод на карту, игрок жмёт "Я оплатил" →
//          платёж PENDING, ждёт подтверждения админа
//   CASH — наличными при встрече → сразу CONFIRMED
// =============================================================

import { z }              from "zod";
import { prisma }         from "@/lib/prisma";
import { requireAuth }    from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  matchId:  z.string().cuid(),
  provider: z.enum(["CARD", "CASH"]),
});

export type PaymentState = {
  success:    boolean;
  message?:   string;
  redirectTo?: string;
};

export async function choosePaymentAction(
  _prev: PaymentState,
  formData: FormData
): Promise<PaymentState> {

  const session = await requireAuth();
  const userId  = session.user.id;

  const parsed = schema.safeParse({
    matchId:  formData.get("matchId"),
    provider: formData.get("provider"),
  });
  if (!parsed.success) return { success: false, message: "Некорректный запрос" };

  const { matchId, provider } = parsed.data;

  const registration = await prisma.matchRegistration.findUnique({
    where:  { userId_matchId: { userId, matchId } },
    select: { id: true, status: true, payment: { select: { id: true } } },
  });
  if (!registration) return { success: false, message: "Вы не записаны на этот матч" };
  if (registration.status === "CONFIRMED") return { success: true, redirectTo: `/matches/${matchId}` };

  const match = await prisma.match.findUnique({
    where: { id: matchId }, select: { priceSom: true },
  });
  if (!match) return { success: false, message: "Матч не найден" };

  // ── CASH — сразу подтверждаем ──────────────────────────────
  if (provider === "CASH") {
    await prisma.$transaction(async (tx) => {
      if (registration.payment) {
        await tx.payment.update({
          where: { id: registration.payment.id },
          data:  { status: "MANUAL", provider: "cash", paidAt: new Date() },
        });
      } else {
        await tx.payment.create({
          data: { registrationId: registration.id, userId, amountSom: match.priceSom, status: "MANUAL", provider: "cash", paidAt: new Date() },
        });
      }
      await tx.matchRegistration.update({ where: { id: registration.id }, data: { status: "CONFIRMED" } });
    });

    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/matches");
    revalidatePath("/dashboard");
    return { success: true, redirectTo: `/matches/${matchId}` };
  }

  // ── CARD — игрок перевёл, ждём подтверждения админа ────────
  // Платёж PENDING + provider "card". Регистрация остаётся PENDING.
  // Админ подтвердит вручную в панели (кнопка "Отметить").
  if (registration.payment) {
    await prisma.payment.update({
      where: { id: registration.payment.id },
      data:  { status: "PENDING", provider: "card" },
    });
  } else {
    await prisma.payment.create({
      data: { registrationId: registration.id, userId, amountSom: match.priceSom, status: "PENDING", provider: "card" },
    });
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
  return { success: true, redirectTo: `/matches/${matchId}` };
}
