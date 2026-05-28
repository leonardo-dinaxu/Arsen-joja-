"use server";

// =============================================================
// SFL — Street Football League
// app/actions/payment.ts
// =============================================================

import { z }             from "zod";
import { prisma }        from "@/lib/prisma";
import { requireAuth }   from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  matchId:  z.string().cuid(),
  provider: z.enum(["PAYME", "CLICK", "CASH"]),
});

export type PaymentState = {
  success:   boolean;
  message?:  string;
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

  if (!parsed.success) {
    return { success: false, message: "Некорректный запрос" };
  }

  const { matchId, provider } = parsed.data;

  const registration = await prisma.matchRegistration.findUnique({
    where:  { userId_matchId: { userId, matchId } },
    select: { id: true, status: true, payment: { select: { id: true, status: true } } },
  });

  if (!registration) {
    return { success: false, message: "Вы не записаны на этот матч" };
  }

  if (registration.status === "CONFIRMED") {
    return { success: true, redirectTo: `/matches/${matchId}` };
  }

  const match = await prisma.match.findUnique({
    where:  { id: matchId },
    select: { priceSom: true, title: true },
  });

  if (!match) {
    return { success: false, message: "Матч не найден" };
  }

  // ── CASH ────────────────────────────────────────────────────
  if (provider === "CASH") {
    await prisma.$transaction(async (tx) => {
      if (registration.payment) {
        await tx.payment.update({
          where: { id: registration.payment.id },
          data:  { status: "MANUAL", provider: "cash", paidAt: new Date() },
        });
      } else {
        await tx.payment.create({
          data: {
            registrationId: registration.id,
            userId,
            amountSom: match.priceSom,
            status:    "MANUAL",
            provider:  "cash",
            paidAt:    new Date(),
          },
        });
      }
      await tx.matchRegistration.update({
        where: { id: registration.id },
        data:  { status: "CONFIRMED" },
      });
    });

    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/matches");
    revalidatePath("/dashboard");

    // Редирект делает клиент
    return { success: true, redirectTo: `/matches/${matchId}` };
  }

  // ── PAYME / CLICK ────────────────────────────────────────────
  const providerKey = provider.toLowerCase();

  const payment = registration.payment
    ? await prisma.payment.update({
        where: { id: registration.payment.id },
        data:  { status: "PENDING", provider: providerKey },
      })
    : await prisma.payment.create({
        data: {
          registrationId: registration.id,
          userId,
          amountSom: match.priceSom,
          status:    "PENDING",
          provider:  providerKey,
        },
      });

  const returnUrl = `${process.env.NEXTAUTH_URL}/matches/${matchId}`;

  let paymentUrl = "";
  if (provider === "PAYME") {
    paymentUrl = `https://checkout.paycom.uz?amount=${match.priceSom * 100}&order_id=${payment.id}&callback=${encodeURIComponent(returnUrl)}`;
  }
  if (provider === "CLICK") {
    paymentUrl = `https://my.click.uz/services/pay?amount=${match.priceSom}&transaction_param=${payment.id}&return_url=${encodeURIComponent(returnUrl)}`;
  }

  return { success: true, redirectTo: paymentUrl };
}
