// =============================================================
// SFL — Street Football League
// app/matches/[id]/page.tsx
// Страница отдельного матча
// =============================================================

import { prisma }        from "@/lib/prisma";
import { auth }          from "@/auth";
import { notFound }      from "next/navigation";
import Link              from "next/link";
import { logoutAction }  from "@/app/actions/logout";
import JoinButton        from "./_components/JoinButton";
import type { Metadata } from "next";

export const revalidate = 30;

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Идёт набор", HOT: "Почти заполнено", FULL: "Мест нет",
  IN_PROGRESS: "Матч идёт", COMPLETED: "Завершён",
  CANCELLED: "Отменён", DRAFT: "Черновик",
};
const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-green-950 text-green-400", HOT: "bg-orange-950 text-orange-400",
  FULL: "bg-red-950 text-red-400", IN_PROGRESS: "bg-blue-950 text-blue-400",
  COMPLETED: "bg-zinc-800 text-zinc-500", CANCELLED: "bg-zinc-800 text-zinc-600",
  DRAFT: "bg-zinc-800 text-zinc-400",
};
const POSITION_LABEL: Record<string, string> = {
  GK: "Вратарь", LB: "Лев. защ.", RB: "Пр. защ.", CB: "Центр. защ.",
  CDM: "Опорник", CM: "Центр. ПЗ", CAM: "Атак. ПЗ",
  LW: "Лев. вингер", RW: "Пр. вингер", ST: "Нападающий",
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
    weekday: "long", hour: "2-digit", minute: "2-digit",
  }).format(date);
}
function formatPrice(som: number) {
  return new Intl.NumberFormat("ru-RU").format(som);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id }, select: { title: true },
  });
  return { title: match ? `${match.title} — SFL` : "Матч — SFL" };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const match = await prisma.match.findUnique({
    where:  { id },
    select: {
      id: true, title: true, date: true, address: true,
      venueName: true, priceSom: true, maxPlayers: true,
      status: true, description: true,
      teamAScore: true, teamBScore: true,
      registrations: {
        where:   { status: { in: ["PENDING", "CONFIRMED"] } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true, status: true,
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true, lastName: true,
                  mainPosition: true, rating: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!match) notFound();

  const taken  = match.registrations.length;
  const free   = match.maxPlayers - taken;
  const fillPct = Math.min(100, Math.round((taken / match.maxPlayers) * 100));

  // Проверяем записан ли текущий пользователь
  const userReg = session?.user
    ? match.registrations.find((r) => r.user.id === session.user.id)
    : null;

  const canJoin = ["OPEN", "HOT"].includes(match.status) && free > 0 && !userReg;
  const canLeave = !!userReg && !["COMPLETED","CANCELLED","IN_PROGRESS"].includes(match.status);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Навбар */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL</Link>
        <div className="flex items-center gap-6">
          <Link href="/matches" className="text-zinc-500 text-sm hover:text-white transition-colors">
            ← Матчи
          </Link>
          {session?.user ? (
            <form action={logoutAction}>
              <button type="submit" className="text-zinc-600 text-sm hover:text-white transition-colors">
                Выйти
              </button>
            </form>
          ) : (
            <Link href={`/login?callbackUrl=/matches/${match.id}`}
              className="bg-white text-black text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
              Войти
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Заголовок */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium">{match.title}</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {formatDateTime(new Date(match.date))}
            </p>
          </div>
          <span className={[
            "text-xs font-medium px-3 py-1.5 rounded-full shrink-0",
            STATUS_STYLE[match.status] ?? "bg-zinc-800 text-zinc-400",
          ].join(" ")}>
            {STATUS_LABEL[match.status] ?? match.status}
          </span>
        </div>

        {/* Счёт (если завершён) */}
        {match.status === "COMPLETED" &&
          match.teamAScore !== null && match.teamBScore !== null && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5 text-center">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Счёт матча</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-zinc-400 text-sm">Команда А</span>
              <span className="text-4xl font-medium">
                {match.teamAScore} — {match.teamBScore}
              </span>
              <span className="text-zinc-400 text-sm">Команда Б</span>
            </div>
          </div>
        )}

        {/* Детали */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          <Row label="Адрес"      value={match.venueName ?? match.address} />
          <Row label="Стоимость"  value={`${formatPrice(match.priceSom)} сум`} />
          <Row label="Формат"     value={`${match.maxPlayers} игроков`} />
          {match.description && (
            <div className="px-4 py-3">
              <p className="text-zinc-500 text-sm">{match.description}</p>
            </div>
          )}
        </div>

        {/* Полоска мест */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-500">Мест занято</span>
            <span className={free <= 0 ? "text-red-400" : free <= 3 ? "text-orange-400" : "text-white"}>
              {taken} / {match.maxPlayers}
              {free > 0 && <span className="text-zinc-500 ml-1">({free} свободно)</span>}
            </span>
          </div>
          <div className="bg-zinc-800 rounded-full h-1.5">
            <div
              className={[
                "h-1.5 rounded-full transition-all",
                free <= 0 ? "bg-red-400" : free <= 3 ? "bg-orange-400" : "bg-white",
              ].join(" ")}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* CTA — кнопка записи */}
        {!session?.user ? (
          <Link
            href={`/login?callbackUrl=/matches/${match.id}`}
            className="block w-full bg-white text-black font-medium text-center rounded-xl py-3 text-sm hover:opacity-90 transition-opacity"
          >
            Войдите чтобы записаться
          </Link>
        ) : (
          <JoinButton
            matchId={match.id}
            canJoin={canJoin}
            canLeave={canLeave}
            isRegistered={!!userReg}
            matchStatus={match.status}
          />
        )}

        {/* Список игроков */}
        <div>
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Записались ({taken})
          </h2>
          {taken === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-8 text-center">
              <p className="text-zinc-500 text-sm">Пока никто не записался</p>
              <p className="text-zinc-600 text-xs mt-1">Будь первым!</p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
              {match.registrations.map((reg, i) => {
                const p = reg.user.profile;
                const isMe = reg.user.id === session?.user?.id;
                return (
                  <div key={reg.id}
                    className={["flex items-center gap-3 px-4 py-3", isMe ? "bg-zinc-800/50" : ""].join(" ")}>
                    <span className="text-zinc-600 text-xs w-5">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium shrink-0">
                      {p ? `${p.firstName[0]}${p.lastName[0]}` : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-2">
                        {p ? `${p.firstName} ${p.lastName}` : "Игрок"}
                        {isMe && <span className="text-xs text-zinc-500">(вы)</span>}
                      </div>
                      {p && (
                        <div className="text-zinc-500 text-xs">
                          {POSITION_LABEL[p.mainPosition] ?? p.mainPosition}
                          {p.rating > 0 && ` · ★ ${p.rating.toFixed(1)}`}
                        </div>
                      )}
                    </div>
                    <span className={[
                      "text-xs px-2 py-0.5 rounded-full",
                      reg.status === "CONFIRMED"
                        ? "bg-green-950 text-green-400"
                        : "bg-zinc-800 text-zinc-500",
                    ].join(" ")}>
                      {reg.status === "CONFIRMED" ? "Оплачено" : "Ожидает"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}
