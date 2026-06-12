import { requireAdmin }  from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import SiteNav           from "@/components/SiteNav";
import Link              from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Админ — SFL" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Черновик", OPEN: "Набор", HOT: "Почти заполнен",
  FULL: "Заполнен", IN_PROGRESS: "Идёт", COMPLETED: "Завершён", CANCELLED: "Отменён",
};
const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-white/[0.06] text-zinc-400", OPEN: "bg-green-950 text-green-400",
  HOT: "bg-orange-950 text-orange-400", FULL: "bg-red-950 text-red-400",
  IN_PROGRESS: "bg-blue-950 text-blue-400", COMPLETED: "bg-white/[0.06] text-zinc-500",
  CANCELLED: "bg-white/[0.06] text-zinc-600",
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
      orderBy: { date: "desc" }, take: 20,
      select: {
        id: true, title: true, date: true, status: true,
        priceSom: true, maxPlayers: true,
        _count: { select: { registrations: { where: { status: { in: ["PENDING","CONFIRMED"] } } } } },
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
      <SiteNav
        isLoggedIn
        links={[{ href: "/matches", label: "Сайт" }]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 page-fade">

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Игроков"     value={totalUsers} />
          <StatCard label="Всего матчей" value={totalMatches} />
          <StatCard label="Предстоящих" value={upcomingCount} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl tracking-wide">Матчи</h2>
            <Link href="/admin/matches/new"
              className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              + Создать матч
            </Link>
          </div>

          <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl overflow-hidden">
            {matches.length === 0 ? (
              <div className="px-6 py-10 text-center text-zinc-500 text-sm">Матчей пока нет</div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {matches.map((match) => {
                  const taken = match._count.registrations;
                  const free  = match.maxPlayers - taken;
                  return (
                    <Link key={match.id} href={`/admin/matches/${match.id}`}
                      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4
                                 hover:bg-white/[0.03] transition-colors">
                      <div className="text-zinc-500 text-xs w-24 sm:w-32 shrink-0">
                        {formatDate(new Date(match.date))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{match.title}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">
                          {taken}/{match.maxPlayers} · {formatPrice(match.priceSom)} сум
                        </div>
                      </div>
                      <span className={[
                        "text-[11px] px-2.5 py-1 rounded-full shrink-0 hidden sm:inline",
                        STATUS_STYLE[match.status] ?? "bg-white/[0.06] text-zinc-400",
                      ].join(" ")}>
                        {STATUS_LABEL[match.status] ?? match.status}
                      </span>
                    </Link>
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
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-4 text-center">
      <div className="font-display text-3xl">{value}</div>
      <div className="text-zinc-500 text-xs mt-1">{label}</div>
    </div>
  );
}
