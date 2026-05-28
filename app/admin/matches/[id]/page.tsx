// =============================================================
// SFL — Street Football League
// app/admin/matches/[id]/page.tsx
// =============================================================

import { requireAdmin }  from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import { notFound }      from "next/navigation";
import Link              from "next/link";
import type { Metadata } from "next";
import MatchControls     from "./_components/MatchControls";
import PlayerList        from "./_components/PlayerList";
import ScoreForm         from "./_components/ScoreForm";

export const metadata: Metadata = { title: "Управление матчем — SFL Admin" };

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

function formatPrice(som: number) {
  return new Intl.NumberFormat("ru-RU").format(som);
}

export default async function AdminMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const match = await prisma.match.findUnique({
    where:  { id },
    select: {
      id: true, title: true, date: true, address: true,
      venueName: true, priceSom: true, maxPlayers: true,
      status: true, teamAScore: true, teamBScore: true,
      description: true,
      registrations: {
        where:   { status: { in: ["PENDING","CONFIRMED","KICKED"] } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true, status: true, team: true, createdAt: true,
          user: {
            select: {
              id: true, email: true,
              profile: {
                select: {
                  firstName: true, lastName: true,
                  mainPosition: true, rating: true, photoUrl: true,
                },
              },
            },
          },
          payment: {
            select: { status: true, amountSom: true, paidAt: true },
          },
        },
      },
    },
  });

  if (!match) notFound();

  const active   = match.registrations.filter((r) => r.status !== "KICKED");
  const kicked   = match.registrations.filter((r) => r.status === "KICKED");
  const confirmed = active.filter((r) => r.status === "CONFIRMED");
  const pending   = active.filter((r) => r.status === "PENDING");
  const collected = confirmed.reduce((sum, r) => sum + (r.payment?.amountSom ?? 0), 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-lg font-medium tracking-[0.2em] uppercase">
          ⬡ SFL Admin
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/matches/${id}/edit`}
            className="bg-zinc-800 text-zinc-300 text-sm px-4 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Редактировать
          </Link>
          <Link href="/admin" className="text-zinc-500 text-sm hover:text-white transition-colors">
            ← Назад
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Заголовок матча */}
        <div>
          <h1 className="text-2xl font-medium">{match.title}</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {formatDateTime(new Date(match.date))} · {match.venueName ?? match.address}
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Записалось"  value={active.length} sub={`из ${match.maxPlayers}`} />
          <StatCard label="Оплатили"    value={confirmed.length} sub="игроков" color="green" />
          <StatCard label="Ожидают"     value={pending.length}   sub="оплаты"  color="orange" />
          <StatCard label="Собрано"     value={formatPrice(collected)} sub="сум" />
        </div>

        {/* Управление статусом */}
        <Section title="Управление">
          <div className="p-5 space-y-4">
            <MatchControls matchId={match.id} currentStatus={match.status} />
            {(match.status === "COMPLETED" || match.status === "IN_PROGRESS") && (
              <ScoreForm
                matchId={match.id}
                teamAScore={match.teamAScore}
                teamBScore={match.teamBScore}
              />
            )}
          </div>
        </Section>

        {/* Список игроков */}
        <Section title={`Игроки (${active.length})`}>
          {active.length === 0 ? (
            <p className="px-5 py-8 text-center text-zinc-500 text-sm">
              Никто ещё не записался
            </p>
          ) : (
            <PlayerList
              registrations={active}
              matchId={match.id}
              priceSom={match.priceSom}
            />
          )}
        </Section>

        {/* Удалённые */}
        {kicked.length > 0 && (
          <Section title={`Удалены (${kicked.length})`}>
            <PlayerList
              registrations={kicked}
              matchId={match.id}
              priceSom={match.priceSom}
              readonly
            />
          </Section>
        )}

      </div>
    </main>
  );
}

function StatCard({
  label, value, sub, color,
}: {
  label: string; value: string | number; sub?: string; color?: "green" | "orange";
}) {
  const valClass = color === "green"  ? "text-green-400"
                 : color === "orange" ? "text-orange-400"
                 : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
      <div className={["text-xl font-medium", valClass].join(" ")}>{value}</div>
      {sub   && <div className="text-zinc-600 text-xs">{sub}</div>}
      <div className="text-zinc-500 text-xs mt-1">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
        {title}
      </h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
