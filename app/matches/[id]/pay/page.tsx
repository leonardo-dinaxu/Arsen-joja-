import { requireAuth }   from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image             from "next/image";
import type { Metadata } from "next";
import PaymentForm       from "./_components/PaymentForm";

export const metadata: Metadata = { title: "Оплата — SFL" };

function fmtPrice(s: number) { return new Intl.NumberFormat("ru-RU").format(s); }

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id }  = await params;

  const match = await prisma.match.findUnique({
    where:  { id },
    select: { id: true, title: true, date: true, priceSom: true, status: true },
  });
  if (!match) notFound();

  const reg = await prisma.matchRegistration.findUnique({
    where:  { userId_matchId: { userId: session.user.id, matchId: id } },
    select: { id: true, status: true },
  });
  if (!reg) redirect(`/matches/${id}`);
  if (reg.status === "CONFIRMED") redirect(`/matches/${id}`);

  const dateStr = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(new Date(match.date));

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm page-fade">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="SFL" width={72} height={72}
            className="rounded-full mx-auto shadow-[0_0_50px_rgba(255,255,255,0.1)]" priority />
        </div>

        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl px-5 py-4 mb-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Оплата участия</p>
          <p className="text-white font-medium">{match.title}</p>
          <p className="text-zinc-500 text-sm mt-0.5">{dateStr}</p>
          <div className="border-t border-white/[0.05] mt-4 pt-4 flex justify-between items-center">
            <span className="text-zinc-500 text-sm">Сумма</span>
            <span className="font-display text-2xl">{fmtPrice(match.priceSom)} <span className="text-zinc-500 text-sm">сум</span></span>
          </div>
        </div>

        <PaymentForm matchId={id} />
      </div>
    </main>
  );
}
