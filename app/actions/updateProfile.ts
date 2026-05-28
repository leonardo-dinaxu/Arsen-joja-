"use server";

// =============================================================
// SFL — Street Football League
// app/actions/updateProfile.ts
// =============================================================

import { z }           from "zod";
import { prisma }      from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { redirect }    from "next/navigation";

const profileSchema = z.object({
  firstName:       z.string().min(2, "Минимум 2 символа").max(50),
  lastName:        z.string().min(2, "Минимум 2 символа").max(50),
  age:             z.coerce.number().int().min(14, "Минимум 14 лет").max(60, "Максимум 60 лет"),
  heightCm:        z.coerce.number().int().min(140, "Минимум 140 см").max(220, "Максимум 220 см"),
  weightKg:        z.coerce.number().int().min(40,  "Минимум 40 кг").max(150,  "Максимум 150 кг"),
  mainPosition:    z.enum(["GK","LB","RB","CB","CDM","CM","CAM","LW","RW","ST"]),
  altPosition:     z.enum(["GK","LB","RB","CB","CDM","CM","CAM","LW","RW","ST"]).optional(),
  dominantFoot:    z.enum(["LEFT","RIGHT","BOTH"]),
  experienceLevel: z.enum(["BEGINNER","AMATEUR","INTERMEDIATE","EXPERIENCED","PROFESSIONAL"]),
  experienceYears: z.coerce.number().int().min(0).max(50),
  phone:           z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, "Некорректный номер").optional().or(z.literal("")),
});

export type ProfileState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {

  const session = await requireAuth();

  const raw = Object.fromEntries(
    ["firstName","lastName","age","heightCm","weightKg",
     "mainPosition","altPosition","dominantFoot",
     "experienceLevel","experienceYears","phone"]
    .map((k) => [k, formData.get(k)])
  );

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success:     false,
      message:     "Проверьте правильность заполненных полей",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<Record<string, string[]>>,
    };
  }

  const { phone, altPosition, ...rest } = parsed.data;

  try {
    // Обновляем профиль
    await prisma.playerProfile.update({
      where: { userId: session.user.id },
      data:  {
        ...rest,
        altPosition: altPosition ?? null,
      },
    });

    // Обновляем телефон на User если передан
    if (phone) {
      await prisma.user.update({
        where: { id: session.user.id },
        data:  { phone },
      });
    }
  } catch (error) {
    console.error("[UPDATE PROFILE ERROR]", error);
    return { success: false, message: "Ошибка сохранения. Попробуйте позже." };
  }

  redirect("/dashboard");
}
