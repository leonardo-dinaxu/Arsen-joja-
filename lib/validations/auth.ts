// =============================================================
// SFL — Street Football League
// lib/validations/auth.ts
//
// Zod-схемы для валидации форм регистрации и логина.
// Используются и на клиенте (react-hook-form), и на сервере
// (API routes + authorize() в Auth.js).
// =============================================================

import { z } from "zod";

// ---------------------------------------------------------------
// Логин
// ---------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Введите email" })
    .email("Некорректный email")
    .max(255),

  password: z
    .string({ required_error: "Введите пароль" })
    .min(6, "Пароль — минимум 6 символов")
    .max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------
// Регистрация
// ---------------------------------------------------------------
export const registerSchema = z
  .object({
    firstName: z
      .string({ required_error: "Введите имя" })
      .min(2, "Имя — минимум 2 символа")
      .max(50),

    lastName: z
      .string({ required_error: "Введите фамилию" })
      .min(2, "Фамилия — минимум 2 символа")
      .max(50),

    email: z
      .string({ required_error: "Введите email" })
      .email("Некорректный email")
      .max(255),

    phone: z
      .string()
      .regex(/^\+?[0-9\s\-()]{7,20}$/, "Некорректный номер телефона")
      .optional()
      .or(z.literal("")),

    password: z
      .string({ required_error: "Введите пароль" })
      .min(6,   "Пароль — минимум 6 символов")
      .max(128, "Пароль — максимум 128 символов"),

    confirmPassword: z
      .string({ required_error: "Повторите пароль" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path:    ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
