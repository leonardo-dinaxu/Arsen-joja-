import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
      <span className="text-3xl font-medium tracking-[0.25em] text-white uppercase mb-3">
        ⬡ SFL
      </span>
      <p className="text-zinc-500 text-sm mb-8">Street Football League</p>
      <h1 className="text-white text-4xl font-medium mb-4">
        Найди свою команду.<br />
        <span className="text-zinc-500">Играй каждую неделю.</span>
      </h1>
      <div className="flex gap-3 mt-6">
        <Link
          href="/register"
          className="bg-white text-black font-medium px-6 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Зарегистрироваться
        </Link>
        <Link
          href="/login"
          className="border border-zinc-700 text-white px-6 py-2.5 rounded-lg text-sm hover:border-zinc-500 transition-colors"
        >
          Войти
        </Link>
      </div>
    </main>
  );
}
