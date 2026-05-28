"use client";

import { useState }       from "react";
import { signIn }         from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link               from "next/link";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";

  const [error,     setError]     = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email    = formData.get("email")    as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsPending(false);

    if (result?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

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

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
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
