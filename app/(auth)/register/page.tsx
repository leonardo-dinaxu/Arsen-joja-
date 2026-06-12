"use client";

// =============================================================
// SFL — app/(auth)/register/page.tsx
// =============================================================

import { useActionState, useEffect } from "react";
import { signIn }    from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link  from "next/link";
import { registerAction, type RegisterState } from "@/app/actions/register";

const initialState: RegisterState = { success: false };

const inputCls = (error?: string) => [
  "w-full bg-[#111111] border rounded-xl px-4 py-3 text-white text-sm",
  "placeholder:text-zinc-600 outline-none focus:border-white/30 transition-colors",
  error ? "border-red-800" : "border-white/[0.08]",
].join(" ");

const labelCls = "block text-zinc-400 text-xs tracking-[0.15em] uppercase mb-2";

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (state.success) {
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

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm page-fade">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="SFL" width={88} height={88}
              className="rounded-full mx-auto shadow-[0_0_60px_rgba(255,255,255,0.1)]" priority />
          </Link>
          <h1 className="font-display text-3xl tracking-[0.2em] mt-5 text-white">JOIN THE LEAGUE</h1>
          <p className="text-zinc-500 text-sm mt-1">Создайте аккаунт игрока</p>
        </div>

        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 sm:p-8">
          {state.message && !state.fieldErrors && !state.success && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Имя</label>
                <input name="firstName" type="text" placeholder="Азиз" required
                  className={inputCls(state.fieldErrors?.firstName?.[0])} />
                {state.fieldErrors?.firstName && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.firstName[0]}</p>}
              </div>
              <div>
                <label className={labelCls}>Фамилия</label>
                <input name="lastName" type="text" placeholder="Турсунов" required
                  className={inputCls(state.fieldErrors?.lastName?.[0])} />
                {state.fieldErrors?.lastName && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.lastName[0]}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input name="email" type="email" placeholder="you@example.com"
                autoComplete="email" required onInput={handleInput}
                className={inputCls(state.fieldErrors?.email?.[0])} />
              {state.fieldErrors?.email && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email[0]}</p>}
            </div>

            <div>
              <label className={labelCls}>
                Телефон <span className="text-zinc-600 normal-case">(необязательно)</span>
              </label>
              <input name="phone" type="tel" placeholder="+998 90 123 45 67"
                className={inputCls(state.fieldErrors?.phone?.[0])} />
              {state.fieldErrors?.phone && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.phone[0]}</p>}
            </div>

            <div>
              <label className={labelCls}>Пароль</label>
              <input name="password" type="password" placeholder="Минимум 6 символов"
                autoComplete="new-password" required onInput={handleInput}
                className={inputCls(state.fieldErrors?.password?.[0])} />
              {state.fieldErrors?.password && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.password[0]}</p>}
            </div>

            <div>
              <label className={labelCls}>Повторите пароль</label>
              <input name="confirmPassword" type="password" placeholder="••••••••"
                autoComplete="new-password" required
                className={inputCls(state.fieldErrors?.confirmPassword?.[0])} />
              {state.fieldErrors?.confirmPassword && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.confirmPassword[0]}</p>}
            </div>

            <button type="submit" disabled={isPending}
              className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm
                         transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 mt-2">
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
