"use client";

// =============================================================
// SFL — Street Football League
// app/(auth)/register/page.tsx
// =============================================================

import { useActionState, useEffect } from "react";
import { signIn }        from "next-auth/react";
import { useRouter }     from "next/navigation";
import Link              from "next/link";
import { registerAction, type RegisterState } from "@/app/actions/register";

const initialState: RegisterState = { success: false };

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (state.success) {
      // Данные для входа берём из формы через sessionStorage
      const email    = sessionStorage.getItem("reg_email")    ?? "";
      const password = sessionStorage.getItem("reg_password") ?? "";
      if (email && password) {
        signIn("credentials", { email, password, redirect: false }).then(() => {
          sessionStorage.removeItem("reg_email");
          sessionStorage.removeItem("reg_password");
          router.push("/profile/setup");
          router.refresh();
        });
      } else {
        router.push("/login");
      }
    }
  }, [state.success, router]);

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    if (input.name === "email")    sessionStorage.setItem("reg_email",    input.value);
    if (input.name === "password") sessionStorage.setItem("reg_password", input.value);
  }

  const inputCls = (error?: string) => [
    "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
    "placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors",
    error ? "border-red-700" : "border-zinc-700",
  ].join(" ");

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <span className="text-2xl font-medium tracking-[0.25em] text-white uppercase">⬡ SFL</span>
          <p className="text-zinc-500 text-sm mt-2">Street Football League</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-white text-xl font-medium mb-1">Создать аккаунт</h1>
          <p className="text-zinc-500 text-sm mb-6">Заполните данные для регистрации</p>

          {state.message && !state.fieldErrors && !state.success && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-sm mb-1.5">Имя</label>
                <input name="firstName" type="text" placeholder="Азиз" required
                  className={inputCls(state.fieldErrors?.firstName?.[0])} />
                {state.fieldErrors?.firstName && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.firstName[0]}</p>}
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1.5">Фамилия</label>
                <input name="lastName" type="text" placeholder="Турсунов" required
                  className={inputCls(state.fieldErrors?.lastName?.[0])} />
                {state.fieldErrors?.lastName && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.lastName[0]}</p>}
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">Email</label>
              <input name="email" type="email" placeholder="you@example.com"
                autoComplete="email" required onInput={handleInput}
                className={inputCls(state.fieldErrors?.email?.[0])} />
              {state.fieldErrors?.email && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email[0]}</p>}
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">
                Телефон <span className="text-zinc-600">(необязательно)</span>
              </label>
              <input name="phone" type="tel" placeholder="+998 90 123 45 67"
                className={inputCls(state.fieldErrors?.phone?.[0])} />
              {state.fieldErrors?.phone && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.phone[0]}</p>}
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">Пароль</label>
              <input name="password" type="password" placeholder="Минимум 6 символов"
                autoComplete="new-password" required onInput={handleInput}
                className={inputCls(state.fieldErrors?.password?.[0])} />
              {state.fieldErrors?.password && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.password[0]}</p>}
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">Повторите пароль</label>
              <input name="confirmPassword" type="password" placeholder="••••••••"
                autoComplete="new-password" required
                className={inputCls(state.fieldErrors?.confirmPassword?.[0])} />
              {state.fieldErrors?.confirmPassword && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.confirmPassword[0]}</p>}
            </div>

            <button type="submit" disabled={isPending}
              className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                         transition-opacity hover:opacity-90 disabled:opacity-50">
              {isPending ? "Создаём аккаунт..." : "Зарегистрироваться"}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-sm mt-6">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-white hover:underline">Войти</Link>
        </p>
      </div>
    </main>
  );
}
