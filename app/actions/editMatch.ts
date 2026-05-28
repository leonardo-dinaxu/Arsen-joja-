"use server";

// =============================================================
// SFL — Street Football League
// app/actions/editMatch.ts
// =============================================================

import { z }              from "zod";
import { prisma }         from "@/lib/prisma";
import { requireAdmin }   from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { redirect }       from "next/navigation";

const matchSchema = z.object({
  matchId:     z.string().cuid(),
  title:       z.string().min(3, "Минимум 3 символа").max(100),
  date:        z.string().min(1, "Укажите дату"),
  time:        z.string().min(1, "Укажите время"),
  address:     z.string().min(5, "Укажите адрес"),
  venueName:   z.string().optional(),
  priceSom:    z.coerce.number().int().min(1000, "Минимум 1000 сум"),
  maxPlayers:  z.coerce.number().int().min(2).max(30),
  description: z.string().optional(),
});

export type EditMatchState = {
  success:     boolean;
  message?:    string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function editMatchAction(
  _prev: EditMatchState,
  formData: FormData
): Promise<EditMatchState> {

  await requireAdmin();

  const raw = Object.fromEntries(
    ["matchId","title","date","time","address","venueName",
     "priceSom","maxPlayers","description"]
    .map((k) => [k, formData.get(k)])
  );

  const parsed = matchSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success:     false,
      message:     "Проверьте заполненные поля",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<Record<string, string[]>>,
    };
  }

  const { matchId, date, time, venueName, description, ...rest } = parsed.data;

  const dateTime = new Date(`${date}T${time}:00`);
  if (isNaN(dateTime.getTime())) {
    return { success: false, message: "Некорректная дата или время" };
  }

  // Проверяем что матч существует
  const existing = await prisma.match.findUnique({
    where:  { id: matchId },
    select: { id: true },
  });
  if (!existing) {
    return { success: false, message: "Матч не найден" };
  }

  try {
    await prisma.match.update({
      where: { id: matchId },
      data:  {
        ...rest,
        date:        dateTime,
        venueName:   venueName   || null,
        description: description || null,
      },
    });
  } catch (error) {
    console.error("[EDIT MATCH ERROR]", error);
    return { success: false, message: "Ошибка сохранения. Попробуйте позже." };
  }

  revalidatePath(`/admin/matches/${matchId}`);
  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/admin");
  revalidatePath("/matches");

  redirect(`/admin/matches/${matchId}`);
}

// ── Удалить матч ─────────────────────────────────────────────

export async function deleteMatchAction(formData: FormData) {
  await requireAdmin();

  const matchId = formData.get("matchId") as string;
  if (!matchId) return;

  // Удаляем в правильном порядке (cascade не всегда настроен)
  await prisma.$transaction([
    prisma.payment.deleteMany({
      where: { registration: { matchId } },
    }),
    prisma.rating.deleteMany({ where: { matchId } }),
    prisma.matchRegistration.deleteMany({ where: { matchId } }),
    prisma.video.deleteMany({ where: { matchId } }),
    prisma.match.delete({ where: { id: matchId } }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/matches");
  redirect("/admin");
}
