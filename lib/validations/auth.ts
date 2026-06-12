import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Введите email")
    .email("Некорректный email")
    .max(255),
  password: z
    .string()
    .min(6, "Пароль — минимум 6 символов")
    .max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Имя — минимум 2 символа").max(50),
    lastName:  z.string().min(2, "Фамилия — минимум 2 символа").max(50),
    email:     z.string().min(1, "Введите email").email("Некорректный email").max(255),
    phone:     z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, "Некорректный номер телефона").optional().or(z.literal("")),
    password:  z.string().min(6, "Пароль — минимум 6 символов").max(128),
    confirmPassword: z.string().min(1, "Повторите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path:    ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;