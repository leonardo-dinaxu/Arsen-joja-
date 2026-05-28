"use server";

// =============================================================
// SFL — Street Football League
// app/actions/payment.ts
//
// Три способа оплаты:
//   PAYME  — редирект на Payme (заглушка URL, заменить на реальный)
//   CLICK  — редирект на Click  (заглушка URL, заменить на реальный)
//   CASH   — "при встрече", сразу помечается как CONFIRMED
// =============================================================

import { z }             from "zod";
import { prisma }        from "@/lib/prisma";
import { requireAuth }   from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { redirect }      from "next/navigation";

const schema = z.object({
  matchId:  z.string().cuid(),
  provider: z.enum(["PAYME", "CLICK", "CASH"]),
});

export type PaymentState = {
  success:  boolean;
  message?: string;
  redirect?: string; // URL для редиректа на платёжную систему
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

  if (!parsed.success) {
    return { success: false, message: "Некорректный запрос" };
  }

  const { matchId, provider } = parsed.data;

  // Проверяем регистрацию
  const registration = await prisma.matchRegistration.findUnique({
    where:  { userId_matchId: { userId, matchId } },
    select: { id: true, status: true, payment: { select: { id: true, status: true } } },
  });

  if (!registration) {
    return { success: false, message: "Вы не записаны на этот матч" };
  }

  if (registration.status === "CONFIRMED") {
    return { success: false, message: "Оплата уже подтверждена" };
  }

  // Получаем сумму матча
  const match = await prisma.match.findUnique({
    where:  { id: matchId },
    select: { priceSom: true, title: true },
  });

  if (!match) {
    return { success: false, message: "Матч не найден" };
  }

  // ── CASH — сразу подтверждаем ──────────────────────────────
  if (provider === "CASH") {
    await prisma.$transaction(async (tx) => {
      // Создаём или обновляем Payment
      if (registration.payment) {
        await tx.payment.update({
          where: { id: registration.payment.id },
          data:  {
            status:   "MANUAL",
            provider: "cash",
            paidAt:   new Date(),
          },
        });
      } else {
        await tx.payment.create({
          data: {
            registrationId: registration.id,
            userId,
            amountSom:  match.priceSom,
            status:     "MANUAL",
            provider:   "cash",
            paidAt:     new Date(),
          },
        });
      }

      // Подтверждаем регистрацию
      await tx.matchRegistration.update({
        where: { id: registration.id },
        data:  { status: "CONFIRMED" },
      });
    });

    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/matches");
    revalidatePath("/dashboard");

    redirect(`/matches/${matchId}?paid=cash`);
  }

  // ── PAYME / CLICK — создаём pending payment и редиректим ──
  const providerKey = provider.toLowerCase(); // "payme" | "click"

  // Создаём платёж со статусом PENDING
  let payment = registration.payment
    ? await prisma.payment.update({
        where: { id: registration.payment.id },
        data:  { status: "PENDING", provider: providerKey },
      })
    : await prisma.payment.create({
        data: {
          registrationId: registration.id,
          userId,
          amountSom:  match.priceSom,
          status:     "PENDING",
          provider:   providerKey,
        },
      });

  // Формируем URL платёжной системы
  // TODO: заменить на реальные credentials из .env
  const returnUrl = `${process.env.NEXTAUTH_URL}/matches/${matchId}/pay/callback?paymentId=${payment.id}&provider=${providerKey}`;

  let paymentUrl = "";

  if (provider === "PAYME") {
    // Реальная интеграция: https://developer.help.paycom.uz
    // const merchant = process.env.PAYME_MERCHANT_ID;
    // const encoded  = Buffer.from(`${merchant};${match.priceSom * 100}`).toString("base64");
    // paymentUrl = `https://checkout.paycom.uz/${encoded}`;
    paymentUrl = `https://checkout.paycom.uz?amount=${match.priceSom * 100}&order_id=${payment.id}&callback=${encodeURIComponent(returnUrl)}`;
  }

  if (provider === "CLICK") {
    // Реальная интеграция: https://docs.click.uz
    // const merchantId  = process.env.CLICK_MERCHANT_ID;
    // const serviceId   = process.env.CLICK_SERVICE_ID;
    // paymentUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${match.priceSom}&transaction_param=${payment.id}&return_url=${returnUrl}`;
    paymentUrl = `https://my.click.uz/services/pay?amount=${match.priceSom}&transaction_param=${payment.id}&return_url=${encodeURIComponent(returnUrl)}`;
  }

  return {
    success:  true,
    redirect: paymentUrl,
  };
}

// ── Webhook / callback — вызывается после успешной оплаты ────
// Используется в /api/payment/callback и /matches/[id]/pay/callback

export async function confirmPaymentAction(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where:  { id: paymentId },
    select: { id: true, registrationId: true, status: true },
  });

  if (!payment || payment.status === "PAID") return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data:  { status: "PAID", paidAt: new Date() },
    });
    await tx.matchRegistration.update({
      where: { id: payment.registrationId },
      data:  { status: "CONFIRMED" },
    });
  });
}
