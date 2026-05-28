// =============================================================
// SFL — Street Football League
// auth.ts  (корень проекта)
//
// Auth.js v5 (next-auth@5) — основная конфигурация.
// Используем Credentials Provider: вход по email + пароль.
// JWT-сессии (без adapter'а для БД — токен хранится в cookie).
// =============================================================

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // ---------------------------------------------------------------
  // Провайдеры
  // ---------------------------------------------------------------
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Пароль",  type: "password" },
      },

      async authorize(credentials) {
        // 1. Валидируем входные данные через Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Ищем пользователя в БД
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id:           true,
            email:        true,
            passwordHash: true,
            role:         true,
            isActive:     true,
            profile: {
              select: {
                firstName: true,
                lastName:  true,
                photoUrl:  true,
              },
            },
          },
        });

        if (!user || !user.isActive) return null;

        // 3. Проверяем пароль
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        // 4. Обновляем lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data:  { lastLoginAt: new Date() },
        });

        // 5. Возвращаем объект пользователя — попадёт в JWT
        return {
          id:        user.id,
          email:     user.email,
          role:      user.role,
          firstName: user.profile?.firstName ?? "",
          lastName:  user.profile?.lastName  ?? "",
          photoUrl:  user.profile?.photoUrl  ?? null,
        };
      },
    }),
  ],

  // ---------------------------------------------------------------
  // JWT + Session callbacks — расширяем токен и сессию нашими полями
  // ---------------------------------------------------------------
  callbacks: {
    async jwt({ token, user }) {
      // При первом входе `user` присутствует — кладём данные в токен
      if (user) {
        token.id        = user.id as string;
        token.role      = (user as { role: Role }).role;
        token.firstName = (user as { firstName: string }).firstName;
        token.lastName  = (user as { lastName:  string }).lastName;
        token.photoUrl  = (user as { photoUrl:  string | null }).photoUrl;
      }
      return token;
    },

    async session({ session, token }) {
      // Пробрасываем кастомные поля в объект сессии
      session.user.id        = token.id        as string;
      session.user.role      = token.role      as Role;
      session.user.firstName = token.firstName as string;
      session.user.lastName  = token.lastName  as string;
      session.user.photoUrl  = token.photoUrl  as string | null;
      return session;
    },
  },

  // ---------------------------------------------------------------
  // Страницы
  // ---------------------------------------------------------------
  

  // ---------------------------------------------------------------
  // Настройки сессии
  // ---------------------------------------------------------------
  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 дней
  },

  // ---------------------------------------------------------------
  // Секрет (обязательно задать AUTH_SECRET в .env)
  // ---------------------------------------------------------------
  secret: process.env.AUTH_SECRET,
});
