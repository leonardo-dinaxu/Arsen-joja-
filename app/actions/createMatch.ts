"use server";

// =============================================================
// SFL — Street Football League
// app/actions/createMatch.ts
// =============================================================

import { z }           from "zod";
import { prisma }      from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { redirect }    from "next/navigation";

const matchSchema = z.object({
  title:      z.string().min(3, "Минимум 3 символа").max(100),
  date:       z.string().min(1, "Укажите дату"),
  time:       z.string().min(1, "Укажите время"),
  address:    z.string().min(5, "Укажите адрес"),
  venueName:  z.string().optional(),
  priceSom:   z.coerce.number().int().min(1000, "Минимум 1000 сум"),
  maxPlayers: z.coerce.number().int().min(2).max(30),
  description: z.string().optional(),
});

export type CreateMatchState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function createMatchAction(
  _prev: CreateMatchState,
  formData: FormData
): Promise<CreateMatchState> {

  await requireAdmin();

  const raw = Object.fromEntries(
    ["title","date","time","address","venueName",
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

  const { date, time, venueName, description, ...rest } = parsed.data;

  // Объединяем дату и время в один объект Date
  const dateTime = new Date(`${date}T${time}:00`);
  if (isNaN(dateTime.getTime())) {
    return { success: false, message: "Некорректная дата или время" };
  }

  try {
    await prisma.match.create({
      data: {
        ...rest,
        date:        dateTime,
        venueName:   venueName  || null,
        description: description || null,
        status:      "OPEN",
      },
    });
  } catch (error) {
    console.error("[CREATE MATCH ERROR]", error);
    return { success: false, message: "Ошибка сохранения. Попробуйте позже." };
  }

  redirect("/admin");
}
