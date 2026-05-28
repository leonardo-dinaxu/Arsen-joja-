// =============================================================
// SFL — Street Football League
// app/admin/page.tsx
// =============================================================

import { requireAdmin }  from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import { logoutAction }  from "@/app/actions/logout";
import Link              from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Админ — SFL" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Черновик", OPEN: "Набор", HOT: "Почти заполнен",
  FULL: "Заполнен", IN_PROGRESS: "Идёт", COMPLETED: "Завершён", CANCELLED: "Отменён",
};
const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-400", OPEN: "bg-green-950 text-green-400",
  HOT: "bg-orange-950 text-orange-400", FULL: "bg-red-950 text-red-400",
  IN_PROGRESS: "bg-blue-950 text-blue-400", COMPLETED: "bg-zinc-800 text-zinc-500",
  CANCELLED: "bg-zinc-800 text-zinc-600",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(date);
}

function formatPrice(som: number) {
  return new Intl.NumberFormat("ru-RU").format(som);
}

export default async function AdminPage() {
  await requireAdmin();

  const [matches, totalUsers, totalMatches] = await Promise.all([
    prisma.match.findMany({
      orderBy: { date: "desc" },
      take:    20,
      select: {
        id: true, title: true, date: true, status: true,
        priceSom: true, maxPlayers: true,
        _count: {
          select: {
            registrations: { where: { status: { in: ["PENDING","CONFIRMED"] } } },
          },
        },
      },
    }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.match.count(),
  ]);

  const upcomingCount = matches.filter(
    (m) => new Date(m.date) >= new Date() && m.status !== "CANCELLED"
  ).length;

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL Admin</span>
        <div className="flex items-center gap-6">
          <Link href="/matches" className="text-zinc-500 text-sm hover:text-white transition-colors">
            Сайт
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-zinc-600 text-sm hover:text-white transition-colors">
              Выйти
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Игроков"          value={totalUsers} />
          <StatCard label="Всего матчей"     value={totalMatches} />
          <StatCard label="Предстоящих"      value={upcomingCount} />
        </div>

        {/* Матчи */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
              Матчи
            </h2>
            <Link
              href="/admin/matches/new"
              className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              + Создать матч
            </Link>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {matches.length === 0 ? (
              <div className="px-6 py-10 text-center text-zinc-500 text-sm">
                Матчей пока нет
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {matches.map((match) => {
                  const taken = match._count.registrations;
                  const free  = match.maxPlayers - taken;
                  return (
                    <div key={match.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/50 transition-colors">

                      {/* Дата */}
                      <div className="text-zinc-500 text-xs w-32 shrink-0">
                        {formatDate(new Date(match.date))}
                      </div>

                      {/* Название */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{match.title}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">
                          {taken}/{match.maxPlayers} игроков · {formatPrice(match.priceSom)} сум
                        </div>
                      </div>

                      {/* Свободно */}
                      <div className={[
                        "text-xs shrink-0",
                        free <= 0 ? "text-red-400" : free <= 3 ? "text-orange-400" : "text-zinc-500"
                      ].join(" ")}>
                        {free <= 0 ? "Мест нет" : `${free} мест`}
                      </div>

                      {/* Статус */}
                      <span className={[
                        "text-xs px-2.5 py-1 rounded-full shrink-0",
                        STATUS_STYLE[match.status] ?? "bg-zinc-800 text-zinc-400",
                      ].join(" ")}>
                        {STATUS_LABEL[match.status] ?? match.status}
                      </span>

                      {/* Действия */}
                      <Link
                        href={`/admin/matches/${match.id}`}
                        className="text-zinc-500 text-xs hover:text-white transition-colors shrink-0"
                      >
                        Управление →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
      <div className="text-2xl font-medium">{value}</div>
      <div className="text-zinc-500 text-xs mt-1">{label}</div>
    </div>
  );
}
