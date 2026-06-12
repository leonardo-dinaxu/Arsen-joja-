import { prisma }        from "@/lib/prisma";
import { auth }          from "@/auth";
import SiteNav           from "@/components/SiteNav";
import Link              from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Матчи — SFL" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Идёт набор", HOT: "Почти заполнено", FULL: "Мест нет",
  IN_PROGRESS: "Идёт матч", COMPLETED: "Завершён", CANCELLED: "Отменён", DRAFT: "Черновик",
};
const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-green-950 text-green-400", HOT: "bg-orange-950 text-orange-400",
  FULL: "bg-red-950 text-red-400", IN_PROGRESS: "bg-blue-950 text-blue-400",
  COMPLETED: "bg-white/[0.06] text-zinc-500", CANCELLED: "bg-white/[0.06] text-zinc-600",
  DRAFT: "bg-white/[0.06] text-zinc-400",
};
const BAR_STYLE: Record<string, string> = {
  OPEN: "bg-white", HOT: "bg-orange-400", FULL: "bg-red-400",
  IN_PROGRESS: "bg-blue-400", COMPLETED: "bg-zinc-600", CANCELLED: "bg-zinc-700", DRAFT: "bg-zinc-600",
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", weekday: "short" }).format(d);
}
function fmtTime(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(d);
}
function fmtPrice(s: number) { return new Intl.NumberFormat("ru-RU").format(s); }

export default async function MatchesPage() {
  const session = await auth();

  const matches = await prisma.match.findMany({
    where: {
      status: { notIn: ["DRAFT", "CANCELLED"] },
      date:   { gte: new Date(Date.now() - 7 * 864e5) },
    },
    orderBy: { date: "asc" },
    select: {
      id: true, title: true, date: true, address: true, venueName: true,
      priceSom: true, maxPlayers: true, status: true,
      _count: { select: { registrations: { where: { status: { in: ["PENDING","CONFIRMED"] } } } } },
    },
  });

  let userRegs = new Set<string>();
  if (session?.user?.id) {
    const regs = await prisma.matchRegistration.findMany({
      where:  { userId: session.user.id, status: { in: ["PENDING","CONFIRMED"] } },
      select: { matchId: true },
    });
    userRegs = new Set(regs.map((r) => r.matchId));
  }

  const upcoming = matches.filter((m) => new Date(m.date) >= new Date());
  const past     = matches.filter((m) => new Date(m.date) <  new Date());

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav
        isLoggedIn={!!session?.user}
        active="/matches"
        links={[
          { href: "/matches",   label: "Матчи" },
          { href: "/dashboard", label: "Дашборд" },
        ]}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 page-fade">
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">Матчи</h1>
          <p className="text-zinc-500 text-sm mt-1">Записывайтесь на ближайшие игры</p>
        </div>

        {upcoming.length > 0 ? (
          <div className="space-y-3 mb-10">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">Предстоящие</h2>
            {upcoming.map((m) => (
              <MatchCard key={m.id} m={m} registered={userRegs.has(m.id)} isLoggedIn={!!session?.user} />
            ))}
          </div>
        ) : (
          <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl px-6 py-12 text-center mb-10">
            <p className="text-zinc-400 text-sm">Ближайших матчей пока нет</p>
            <p className="text-zinc-600 text-xs mt-1">Следите за обновлениями</p>
          </div>
        )}

        {past.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">Прошедшие</h2>
            {past.map((m) => (
              <MatchCard key={m.id} m={m} registered={false} isLoggedIn={!!session?.user} past />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

interface CardProps {
  m: {
    id: string; title: string; date: Date; address: string; venueName: string | null;
    priceSom: number; maxPlayers: number; status: string;
    _count: { registrations: number };
  };
  registered: boolean; isLoggedIn: boolean; past?: boolean;
}

function MatchCard({ m, registered, isLoggedIn, past }: CardProps) {
  const taken = m._count.registrations;
  const free  = m.maxPlayers - taken;
  const pct   = Math.min(100, Math.round((taken / m.maxPlayers) * 100));
  const isFull = m.status === "FULL" || free <= 0;
  const isDone = m.status === "COMPLETED" || m.status === "CANCELLED";

  return (
    <div className={[
      "bg-[#0A0A0A] border rounded-2xl p-5 transition-colors",
      past || isDone ? "border-white/[0.08] opacity-60" : "border-white/[0.08] hover:border-white/20",
    ].join(" ")}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">{fmtDate(new Date(m.date))}</div>
          <div className="font-display text-2xl mt-0.5 tracking-wide">{m.title}</div>
        </div>
        <span className={["text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-3",
          STATUS_STYLE[m.status] ?? "bg-white/[0.06] text-zinc-400"].join(" ")}>
          {STATUS_LABEL[m.status] ?? m.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-500 mb-4">
        <span>🕐 {fmtTime(new Date(m.date))}</span>
        <span>📍 {m.venueName ?? m.address}</span>
        <span>💰 {fmtPrice(m.priceSom)} сум</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
          <span>{taken} из {m.maxPlayers} игроков</span>
          <span className={free <= 0 ? "text-red-400" : free <= 3 ? "text-orange-400" : "text-zinc-400"}>
            {free <= 0 ? "Мест нет" : `${free} свободно`}
          </span>
        </div>
        <div className="bg-white/[0.06] rounded-full h-1">
          <div className={["h-1 rounded-full transition-all", BAR_STYLE[m.status] ?? "bg-zinc-600"].join(" ")}
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {!past && !isDone && (
        <div className="flex items-center justify-between">
          {registered ? (
            <Link href={`/matches/${m.id}`} className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors">
              ✓ Вы записаны →
            </Link>
          ) : isLoggedIn ? (
            <Link href={`/matches/${m.id}`}
              className={["text-sm font-medium px-5 py-2 rounded-lg transition-opacity",
                isFull ? "bg-white/[0.06] text-zinc-500 pointer-events-none" : "bg-white text-black hover:opacity-90"].join(" ")}>
              {isFull ? "Мест нет" : "Записаться"}
            </Link>
          ) : (
            <Link href={`/login?callbackUrl=/matches/${m.id}`}
              className="bg-white text-black text-sm font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Войти и записаться
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
