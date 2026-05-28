"use server";

// =============================================================
// SFL — Street Football League
// app/actions/register.ts
//
// Server Action для регистрации нового пользователя.
// Вызывается напрямую из клиентской формы — без API route.
// Выполняется исключительно на сервере: bcrypt, Prisma, БД.
// =============================================================

import bcrypt        from "bcryptjs";
import { prisma }    from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

// Тип ответа — либо успех, либо ошибки по полям + общая ошибка
export type RegisterState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {

  // ------------------------------------------------------------------
  // 1. Достаём данные из FormData и валидируем через Zod
  // ------------------------------------------------------------------
  const raw = {
    firstName:       formData.get("firstName"),
    lastName:        formData.get("lastName"),
    email:           formData.get("email"),
    phone:           formData.get("phone"),
    password:        formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success:     false,
      message:     "Проверьте правильность заполненных полей",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<Record<string, string[]>>,
    };
  }

  const { firstName, lastName, email, password, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // ------------------------------------------------------------------
  // 2. Проверяем уникальность email
  // ------------------------------------------------------------------
  const existingEmail = await prisma.user.findUnique({
    where:  { email: normalizedEmail },
    select: { id: true },
  });

  if (existingEmail) {
    return {
      success:     false,
      fieldErrors: { email: ["Этот email уже зарегистрирован"] },
    };
  }

  // ------------------------------------------------------------------
  // 3. Проверяем уникальность телефона (если передан)
  // ------------------------------------------------------------------
  if (phone) {
    const existingPhone = await prisma.user.findUnique({
      where:  { phone },
      select: { id: true },
    });

    if (existingPhone) {
      return {
        success:     false,
        fieldErrors: { phone: ["Этот номер телефона уже используется"] },
      };
    }
  }

  // ------------------------------------------------------------------
  // 4. Хэшируем пароль
  //    cost factor 12: ~250ms на современном сервере — баланс
  //    между безопасностью и временем ответа
  // ------------------------------------------------------------------
  const passwordHash = await bcrypt.hash(password, 12);

  // ------------------------------------------------------------------
  // 5. Создаём User + PlayerProfile в одной транзакции
  //    Если что-то упадёт — откатятся обе записи
  // ------------------------------------------------------------------
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email:        normalizedEmail,
          phone:        phone || null,
          passwordHash,
          role:         "USER",
          profile: {
            create: {
              firstName,
              lastName,
              // Игрок заполнит остальное на /profile/setup
              age:             0,
              heightCm:        0,
              weightKg:        0,
              mainPosition:    "CM",
              dominantFoot:    "RIGHT",
              experienceLevel: "AMATEUR",
              experienceYears: 0,
            },
          },
        },
      });
    });
  } catch (error) {
    console.error("[REGISTER ACTION ERROR]", error);
    return {
      success: false,
      message: "Внутренняя ошибка сервера. Попробуйте позже.",
    };
  }

  // ------------------------------------------------------------------
  // 6. Успех — клиент сделает signIn() и редирект
  // ------------------------------------------------------------------
  return {
    success: true,
    message: "Аккаунт создан успешно",
  };
}
