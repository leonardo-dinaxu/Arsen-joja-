"use server";

// =============================================================
// SFL — Street Football League
// app/actions/joinMatch.ts
// Запись игрока на матч
// =============================================================

import { z }             from "zod";
import { prisma }        from "@/lib/prisma";
import { requireAuth }   from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  matchId: z.string().cuid(),
});

export type JoinMatchState = {
  success:  boolean;
  message?: string;
};

export async function joinMatchAction(
  _prev: JoinMatchState,
  formData: FormData
): Promise<JoinMatchState> {

  const session = await requireAuth();
  const userId  = session.user.id;

  const parsed = schema.safeParse({ matchId: formData.get("matchId") });
  if (!parsed.success) {
    return { success: false, message: "Некорректный запрос" };
  }

  const { matchId } = parsed.data;

  // 1. Загружаем матч
  const match = await prisma.match.findUnique({
    where:  { id: matchId },
    select: {
      id: true, status: true, maxPlayers: true,
      _count: {
        select: {
          registrations: {
            where: { status: { in: ["PENDING", "CONFIRMED"] } },
          },
        },
      },
    },
  });

  if (!match) {
    return { success: false, message: "Матч не найден" };
  }

  // 2. Проверяем статус матча
  if (!["OPEN", "HOT"].includes(match.status)) {
    return { success: false, message: "Запись на этот матч недоступна" };
  }

  // 3. Проверяем наличие мест
  if (match._count.registrations >= match.maxPlayers) {
    return { success: false, message: "Все места уже заняты" };
  }

  // 4. Проверяем — не записан ли уже
  const existing = await prisma.matchRegistration.findUnique({
    where:  { userId_matchId: { userId, matchId } },
    select: { id: true, status: true },
  });

  if (existing) {
    if (existing.status === "KICKED") {
      return { success: false, message: "Вы были удалены с этого матча администратором" };
    }
    return { success: false, message: "Вы уже записаны на этот матч" };
  }

  // 5. Создаём регистрацию
  try {
    await prisma.$transaction(async (tx) => {
      await tx.matchRegistration.create({
        data: { userId, matchId, status: "PENDING" },
      });

      // Пересчитываем статус матча
      const taken = match._count.registrations + 1;
      const pct   = taken / match.maxPlayers;

      let newStatus = match.status;
      if (taken >= match.maxPlayers)    newStatus = "FULL";
      else if (pct >= 0.8)              newStatus = "HOT";
      else                              newStatus = "OPEN";

      if (newStatus !== match.status) {
        await tx.match.update({
          where: { id: matchId },
          data:  { status: newStatus },
        });
      }
    });
  } catch (error) {
    console.error("[JOIN MATCH ERROR]", error);
    return { success: false, message: "Ошибка при записи. Попробуйте ещё раз." };
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");

  return { success: true, message: "Вы успешно записаны на матч!" };
}

// ── Отмена записи ────────────────────────────────────────────

export async function leaveMatchAction(
  _prev: JoinMatchState,
  formData: FormData
): Promise<JoinMatchState> {

  const session = await requireAuth();
  const userId  = session.user.id;

  const parsed = schema.safeParse({ matchId: formData.get("matchId") });
  if (!parsed.success) return { success: false, message: "Некорректный запрос" };

  const { matchId } = parsed.data;

  const registration = await prisma.matchRegistration.findUnique({
    where:  { userId_matchId: { userId, matchId } },
    select: { id: true, status: true },
  });

  if (!registration || registration.status === "KICKED") {
    return { success: false, message: "Вы не записаны на этот матч" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.matchRegistration.update({
        where: { id: registration.id },
        data:  { status: "CANCELLED" },
      });

      // Если матч был FULL или HOT — открываем снова
      const match = await tx.match.findUnique({
        where:  { id: matchId },
        select: { status: true, maxPlayers: true,
          _count: { select: { registrations: { where: { status: { in: ["PENDING","CONFIRMED"] } } } } },
        },
      });

      if (match && ["FULL","HOT"].includes(match.status)) {
        const taken = match._count.registrations; // уже после отмены
        const pct   = taken / match.maxPlayers;
        const newStatus = pct >= 0.8 ? "HOT" : "OPEN";
        await tx.match.update({ where: { id: matchId }, data: { status: newStatus } });
      }
    });
  } catch (error) {
    console.error("[LEAVE MATCH ERROR]", error);
    return { success: false, message: "Ошибка при отмене записи." };
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");

  return { success: true, message: "Запись отменена" };
}
