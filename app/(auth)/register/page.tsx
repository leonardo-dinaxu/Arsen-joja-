"use client";

// =============================================================
// SFL — Street Football League
// app/(auth)/register/page.tsx
//
// Страница регистрации.
// 1. Отправляет POST /api/auth/register
// 2. После успеха — signIn() → редирект на /profile/setup
// =============================================================

import { useState }   from "react";
import { signIn }     from "next-auth/react";
import { useRouter }  from "next/navigation";
import { useForm }    from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link           from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setServerError(null);

    try {
      // 1. Регистрируем пользователя
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Ошибка регистрации");
        return;
      }

      // 2. Автоматически входим после регистрации
      const loginResult = await signIn("credentials", {
        email:    data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Регистрация прошла, но вход не удался → отправляем на /login
        router.push("/login");
        return;
      }

      // 3. Редирект на заполнение профиля
      router.push("/profile/setup");
      router.refresh();
    } catch {
      setServerError("Произошла ошибка. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Логотип */}
        <div className="text-center mb-10">
          <span className="text-2xl font-medium tracking-[0.25em] text-white uppercase">
            ⬡ SFL
          </span>
          <p className="text-zinc-500 text-sm mt-2">Street Football League</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-white text-xl font-medium mb-1">Создать аккаунт</h1>
          <p className="text-zinc-500 text-sm mb-6">Заполните данные для регистрации</p>

          {serverError && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Имя + Фамилия */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="firstName">
                  Имя
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Азиз"
                  {...register("firstName")}
                  className={`
                    w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-white text-sm
                    placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors
                    ${errors.firstName ? "border-red-700" : "border-zinc-700"}
                  `}
                />
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="lastName">
                  Фамилия
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Турсунов"
                  {...register("lastName")}
                  className={`
                    w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-white text-sm
                    placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors
                    ${errors.lastName ? "border-red-700" : "border-zinc-700"}
                  `}
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`
                  w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm
                  placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors
                  ${errors.email ? "border-red-700" : "border-zinc-700"}
                `}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Телефон */}
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="phone">
                Телефон <span className="text-zinc-600">(необязательно)</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                {...register("phone")}
                className={`
                  w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm
                  placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors
                  ${errors.phone ? "border-red-700" : "border-zinc-700"}
                `}
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Минимум 6 символов"
                {...register("password")}
                className={`
                  w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm
                  placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors
                  ${errors.password ? "border-red-700" : "border-zinc-700"}
                `}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="confirmPassword">
                Повторите пароль
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={`
                  w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm
                  placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors
                  ${errors.confirmPassword ? "border-red-700" : "border-zinc-700"}
                `}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                transition-opacity hover:opacity-90 disabled:opacity-50 mt-2
              "
            >
              {isLoading ? "Регистрируем..." : "Создать аккаунт"}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-sm mt-6">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-white hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
}
