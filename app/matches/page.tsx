// =============================================================
// SFL — Street Football League
// app/matches/page.tsx
// Server Component — загружает матчи из БД, рендерит список
// =============================================================

import { prisma }        from "@/lib/prisma";
import { auth }          from "@/auth";
import Link              from "next/link";
import { logoutAction }  from "@/app/actions/logout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Матчи — SFL" };

// Автообновление страницы каждые 60 секунд
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT:       "Черновик",
  OPEN:        "Идёт набор",
  HOT:         "Почти заполнено",
  FULL:        "Мест нет",
  IN_PROGRESS: "Идёт матч",
  COMPLETED:   "Завершён",
  CANCELLED:   "Отменён",
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT:       "bg-zinc-800 text-zinc-400",
  OPEN:        "bg-green-950 text-green-400",
  HOT:         "bg-orange-950 text-orange-400",
  FULL:        "bg-red-950 text-red-400",
  IN_PROGRESS: "bg-blue-950 text-blue-400",
  COMPLETED:   "bg-zinc-800 text-zinc-500",
  CANCELLED:   "bg-zinc-800 text-zinc-600",
};

const BAR_STYLE: Record<string, string> = {
  OPEN:        "bg-white",
  HOT:         "bg-orange-400",
  FULL:        "bg-red-400",
  IN_PROGRESS: "bg-blue-400",
  COMPLETED:   "bg-zinc-600",
  CANCELLED:   "bg-zinc-700",
  DRAFT:       "bg-zinc-600",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day:     "numeric",
    month:   "long",
    weekday: "short",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour:   "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPrice(som: number) {
  return new Intl.NumberFormat("ru-RU").format(som);
}

export default async function MatchesPage() {
  const session = await auth();

  // Загружаем матчи: не черновики, не старше 7 дней
  const matches = await prisma.match.findMany({
    where: {
      status: { notIn: ["DRAFT", "CANCELLED"] },
      date:   { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { date: "asc" },
    select: {
      id:          true,
      title:       true,
      date:        true,
      address:     true,
      venueName:   true,
      priceSom:    true,
      maxPlayers:  true,
      status:      true,
      _count: {
        select: {
          registrations: {
            where: { status: { in: ["PENDING", "CONFIRMED"] } },
          },
        },
      },
    },
  });

  // Если залогинен — загружаем его записи чтобы показать "Вы записаны"
  let userRegistrations: Set<string> = new Set();
  if (session?.user?.id) {
    const regs = await prisma.matchRegistration.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { matchId: true },
    });
    userRegistrations = new Set(regs.map((r) => r.matchId));
  }

  const upcoming  = matches.filter((m) => new Date(m.date) >= new Date());
  const past      = matches.filter((m) => new Date(m.date) <  new Date());

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Навбар */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL</Link>
        <div className="flex items-center gap-6">
          <Link href="/matches"   className="text-white text-sm">Матчи</Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-zinc-500 text-sm hover:text-white transition-colors">
                Дашборд
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="text-zinc-600 text-sm hover:text-white transition-colors">
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="bg-white text-black text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
              Войти
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium">Матчи</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Записывайтесь на ближайшие игры
          </p>
        </div>

        {/* Предстоящие матчи */}
        {upcoming.length > 0 ? (
          <div className="space-y-3 mb-10">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
              Предстоящие
            </h2>
            {upcoming.map((match) => {
              const registered = userRegistrations.has(match.id);
              const taken      = match._count.registrations;
              const free       = match.maxPlayers - taken;
              const fillPct    = Math.min(100, Math.round((taken / match.maxPlayers) * 100));

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  taken={taken}
                  free={free}
                  fillPct={fillPct}
                  registered={registered}
                  isLoggedIn={!!session?.user}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-12 text-center mb-10">
            <p className="text-zinc-400 text-sm">Ближайших матчей пока нет</p>
            <p className="text-zinc-600 text-xs mt-1">Следите за обновлениями</p>
          </div>
        )}

        {/* Прошедшие матчи */}
        {past.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
              Прошедшие
            </h2>
            {past.map((match) => {
              const taken   = match._count.registrations;
              const free    = match.maxPlayers - taken;
              const fillPct = Math.min(100, Math.round((taken / match.maxPlayers) * 100));
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  taken={taken}
                  free={free}
                  fillPct={fillPct}
                  registered={false}
                  isLoggedIn={!!session?.user}
                  past
                />
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

// ── Карточка матча ───────────────────────────────────────────

interface MatchCardProps {
  match: {
    id:        string;
    title:     string;
    date:      Date;
    address:   string;
    venueName: string | null;
    priceSom:  number;
    maxPlayers: number;
    status:    string;
  };
  taken:      number;
  free:       number;
  fillPct:    number;
  registered: boolean;
  isLoggedIn: boolean;
  past?:      boolean;
}

function MatchCard({ match, taken, free, fillPct, registered, isLoggedIn, past }: MatchCardProps) {
  const isFull      = match.status === "FULL" || free <= 0;
  const isCompleted = match.status === "COMPLETED" || match.status === "CANCELLED";

  return (
    <div className={[
      "bg-zinc-900 border rounded-xl p-5 transition-colors",
      past || isCompleted ? "border-zinc-800 opacity-60" : "border-zinc-800 hover:border-zinc-700",
    ].join(" ")}>

      {/* Верх: дата + статус */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">
            {formatDate(new Date(match.date))}
          </div>
          <div className="text-lg font-medium mt-0.5">{match.title}</div>
        </div>
        <span className={[
          "text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-3",
          STATUS_STYLE[match.status] ?? "bg-zinc-800 text-zinc-400",
        ].join(" ")}>
          {STATUS_LABEL[match.status] ?? match.status}
        </span>
      </div>

      {/* Мета */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-500 mb-4">
        <span>🕐 {formatTime(new Date(match.date))}</span>
        <span>📍 {match.venueName ?? match.address}</span>
        <span>💰 {formatPrice(match.priceSom)} сум</span>
      </div>

      {/* Полоска заполненности */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
          <span>{taken} из {match.maxPlayers} игроков</span>
          <span className={free <= 0 ? "text-red-400" : free <= 3 ? "text-orange-400" : "text-zinc-400"}>
            {free <= 0 ? "Мест нет" : `${free} свободно`}
          </span>
        </div>
        <div className="bg-zinc-800 rounded-full h-1">
          <div
            className={["h-1 rounded-full transition-all", BAR_STYLE[match.status] ?? "bg-zinc-600"].join(" ")}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {/* Кнопка */}
      {!past && !isCompleted && (
        <div className="flex items-center justify-between">
          {registered ? (
            <Link
              href={`/matches/${match.id}`}
              className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors"
            >
              ✓ Вы записаны →
            </Link>
          ) : isLoggedIn ? (
            <Link
              href={`/matches/${match.id}`}
              className={[
                "text-sm font-medium px-5 py-2 rounded-lg transition-opacity",
                isFull
                  ? "bg-zinc-800 text-zinc-500 pointer-events-none"
                  : "bg-white text-black hover:opacity-90",
              ].join(" ")}
            >
              {isFull ? "Мест нет" : "Записаться"}
            </Link>
          ) : (
            <Link
              href={`/login?callbackUrl=/matches/${match.id}`}
              className="bg-white text-black text-sm font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Войти и записаться
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
