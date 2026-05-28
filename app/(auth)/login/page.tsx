"use client";

// =============================================================
// SFL — Street Football League
// app/(auth)/login/page.tsx
//
// Страница входа. Использует Auth.js signIn() на клиенте.
// После успешного входа редиректит на callbackUrl или /dashboard.
// =============================================================

import { useState }          from "react";
import { signIn }            from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm }           from "react-hook-form";
import { zodResolver }       from "@hookform/resolvers/zod";
import Link                  from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";
  const urlError     = searchParams.get("error");

  const [serverError, setServerError] = useState<string | null>(
    urlError === "CredentialsSignin" ? "Неверный email или пароль" : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await signIn("credentials", {
        email:    data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Неверный email или пароль");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setServerError("Произошла ошибка. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Логотип */}
        <div className="text-center mb-10">
          <span className="text-2xl font-medium tracking-[0.25em] text-white uppercase">
            ⬡ SFL
          </span>
          <p className="text-zinc-500 text-sm mt-2">Street Football League</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-white text-xl font-medium mb-1">Вход в аккаунт</h1>
          <p className="text-zinc-500 text-sm mb-6">Введите email и пароль</p>

          {/* Ошибка от сервера */}
          {serverError && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

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
                  placeholder:text-zinc-600 outline-none transition-colors
                  focus:border-zinc-500
                  ${errors.email ? "border-red-700" : "border-zinc-700"}
                `}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
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
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className={`
                  w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm
                  placeholder:text-zinc-600 outline-none transition-colors
                  focus:border-zinc-500
                  ${errors.password ? "border-red-700" : "border-zinc-700"}
                `}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Кнопка */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                transition-opacity hover:opacity-90 disabled:opacity-50 mt-2
              "
            >
              {isLoading ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>

        {/* Ссылка на регистрацию */}
        <p className="text-center text-zinc-600 text-sm mt-6">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-white hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}
