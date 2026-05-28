// =============================================================
// SFL — Street Football League
// app/matches/[id]/pay/page.tsx
// Страница выбора способа оплаты
// =============================================================

import { requireAuth }   from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import PaymentForm       from "./_components/PaymentForm";

export const metadata: Metadata = { title: "Оплата — SFL" };

function formatPrice(som: number) {
  return new Intl.NumberFormat("ru-RU").format(som);
}

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id }  = await params;

  const match = await prisma.match.findUnique({
    where:  { id },
    select: {
      id: true, title: true, date: true,
      priceSom: true, status: true,
    },
  });

  if (!match) notFound();

  // Проверяем регистрацию
  const registration = await prisma.matchRegistration.findUnique({
    where:  { userId_matchId: { userId: session.user.id, matchId: id } },
    select: { id: true, status: true },
  });

  // Не записан — на страницу матча
  if (!registration) redirect(`/matches/${id}`);

  // Уже оплачено — тоже на страницу матча
  if (registration.status === "CONFIRMED") redirect(`/matches/${id}?paid=already`);

  const dateStr = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(new Date(match.date));

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Логотип */}
        <div className="text-center mb-8">
          <span className="text-2xl font-medium tracking-[0.25em] uppercase">⬡ SFL</span>
        </div>

        {/* Карточка матча */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 mb-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Оплата участия</p>
          <p className="text-white font-medium">{match.title}</p>
          <p className="text-zinc-500 text-sm mt-0.5">{dateStr}</p>
          <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-between items-center">
            <span className="text-zinc-500 text-sm">Сумма</span>
            <span className="text-white text-xl font-medium">
              {formatPrice(match.priceSom)} <span className="text-zinc-500 text-sm">сум</span>
            </span>
          </div>
        </div>

        {/* Форма выбора способа оплаты */}
        <PaymentForm matchId={id} />

      </div>
    </main>
  );
}
