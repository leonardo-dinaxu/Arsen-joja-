"use client";

// =============================================================
// SFL — Street Football League
// app/(auth)/login/page.tsx
// =============================================================

import { useActionState }  from "react";
import { useSearchParams } from "next/navigation";
import Link                from "next/link";
import type { Metadata }   from "next";
import { loginAction, type LoginState } from "@/app/actions/login";

const initialState: LoginState = { success: false };

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";

  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <span className="text-2xl font-medium tracking-[0.25em] text-white uppercase">
            ⬡ SFL
          </span>
          <p className="text-zinc-500 text-sm mt-2">Street Football League</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-white text-xl font-medium mb-1">Вход в аккаунт</h1>
          <p className="text-zinc-500 text-sm mb-6">Введите email и пароль</p>

          {state.message && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="email">Email</label>
              <input id="email" name="email" type="email"
                placeholder="you@example.com" autoComplete="email" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5
                           text-white text-sm placeholder:text-zinc-600 outline-none
                           focus:border-zinc-500 transition-colors"
              />
              {state.fieldErrors?.email && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="password">Пароль</label>
              <input id="password" name="password" type="password"
                placeholder="••••••••" autoComplete="current-password" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5
                           text-white text-sm placeholder:text-zinc-600 outline-none
                           focus:border-zinc-500 transition-colors"
              />
              {state.fieldErrors?.password && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.password[0]}</p>
              )}
            </div>

            <button type="submit" disabled={isPending}
              className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                         transition-opacity hover:opacity-90 disabled:opacity-50">
              {isPending ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>

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
