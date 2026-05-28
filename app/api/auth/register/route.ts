// =============================================================
// SFL — Street Football League
// app/api/auth/register/route.ts
//
// POST /api/auth/register
// Создаёт нового пользователя (User) с хэшированным паролем.
// После успешной регистрации клиент может сразу делать signIn().
// =============================================================

import { NextResponse }       from "next/server";
import bcrypt                 from "bcryptjs";
import { prisma }             from "@/lib/prisma";
import { registerSchema }     from "@/lib/validations/auth";
import type { NextRequest }   from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Парсим тело запроса
    const body = await req.json();

    // 2. Валидируем через Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:  "Ошибка валидации",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { email, password, firstName, lastName, phone } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // 3. Проверяем, не занят ли email
    const existing = await prisma.user.findUnique({
      where:  { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    // 4. Проверяем уникальность телефона (если передан)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where:  { phone },
        select: { id: true },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Этот номер телефона уже зарегистрирован" },
          { status: 409 }
        );
      }
    }

    // 5. Хэшируем пароль (cost factor 12 — баланс безопасности и скорости)
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Создаём User + PlayerProfile в одной транзакции
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email:        normalizedEmail,
          phone:        phone ?? null,
          passwordHash,
          role:         "USER",
          profile: {
            create: {
              firstName,
              lastName,
              age:            0,   // игрок заполнит в профиле
              heightCm:       0,
              weightKg:       0,
              mainPosition:   "CM",
              dominantFoot:   "RIGHT",
              experienceLevel:"AMATEUR",
              experienceYears: 0,
            },
          },
        },
        select: {
          id:    true,
          email: true,
          role:  true,
          profile: {
            select: { firstName: true, lastName: true },
          },
        },
      });
      return newUser;
    });

    // 7. Возвращаем созданного пользователя (без хэша пароля!)
    return NextResponse.json(
      {
        message: "Регистрация прошла успешно",
        user: {
          id:        user.id,
          email:     user.email,
          role:      user.role,
          firstName: user.profile?.firstName,
          lastName:  user.profile?.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
