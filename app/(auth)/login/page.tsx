"use client";

// =============================================================
// SFL — app/(auth)/login/page.tsx
// =============================================================

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link  from "next/link";
import { loginAction, type LoginState } from "@/app/actions/login";

const initialState: LoginState = { success: false };

const inputCls =
  "w-full bg-[#111111] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm " +
  "placeholder:text-zinc-600 outline-none focus:border-white/30 transition-colors";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";

  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm page-fade">

        {/* Лого */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="SFL" width={88} height={88}
              className="rounded-full mx-auto shadow-[0_0_60px_rgba(255,255,255,0.1)]" priority />
          </Link>
          <h1 className="font-display text-3xl tracking-[0.2em] mt-5 text-white">ВХОД В ЛИГУ</h1>
          <p className="text-zinc-500 text-sm mt-1">Введите email и пароль</p>
        </div>

        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 sm:p-8">
          {state.message && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <div>
              <label className="block text-zinc-400 text-xs tracking-[0.15em] uppercase mb-2"
                htmlFor="email">Email</label>
              <input id="email" name="email" type="email"
                placeholder="you@example.com" autoComplete="email" required
                className={inputCls} />
              {state.fieldErrors?.email && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-zinc-400 text-xs tracking-[0.15em] uppercase mb-2"
                htmlFor="password">Пароль</label>
              <input id="password" name="password" type="password"
                placeholder="••••••••" autoComplete="current-password" required
                className={inputCls} />
              {state.fieldErrors?.password && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.password[0]}</p>
              )}
            </div>

            <button type="submit" disabled={isPending}
              className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm
                         transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 mt-2">
              {isPending ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-sm mt-6">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-white hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
