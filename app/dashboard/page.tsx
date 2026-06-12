import { requireAuth }   from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import { redirect }      from "next/navigation";
import SiteNav           from "@/components/SiteNav";
import Image             from "next/image";
import Link              from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Дашборд — SFL" };

const POSITION_LABELS: Record<string, string> = {
  GK: "Вратарь", LB: "Левый защитник", RB: "Правый защитник",
  CB: "Центральный защитник", CDM: "Опорный полузащитник",
  CM: "Центральный полузащитник", CAM: "Атакующий полузащитник",
  LW: "Левый вингер", RW: "Правый вингер", ST: "Нападающий",
};
const FOOT_LABELS: Record<string, string> = { LEFT: "Левая", RIGHT: "Правая", BOTH: "Обе" };
const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: "Новичок", AMATEUR: "Любитель", INTERMEDIATE: "Средний",
  EXPERIENCED: "Опытный", PROFESSIONAL: "Профессионал",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  if (String(session.user.role) === "ADMIN") redirect("/admin");

  const profile = await prisma.playerProfile.findUnique({
    where:  { userId: session.user.id },
    select: {
      firstName: true, lastName: true, age: true,
      heightCm: true, weightKg: true, mainPosition: true,
      altPosition: true, dominantFoot: true,
      experienceLevel: true, experienceYears: true,
      rating: true, matchesPlayed: true, goalsScored: true,
    },
  });

  const isProfileComplete = profile && profile.age > 0 && profile.heightCm > 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav
        isLoggedIn
        active="/dashboard"
        links={[
          { href: "/matches",   label: "Матчи" },
          { href: "/profile",   label: "Профиль" },
          { href: "/dashboard", label: "Дашборд" },
        ]}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 page-fade">

        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="" width={56} height={56} className="rounded-full" />
          <div>
            <h1 className="font-display text-3xl tracking-wide">
              Привет, {profile?.firstName ?? session.user.firstName}!
            </h1>
            <p className="text-zinc-500 text-sm">{session.user.email}</p>
          </div>
        </div>

        {!isProfileComplete && (
          <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl px-5 py-4
                          flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Заполните профиль</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Укажите рост, вес и позицию — чтобы записываться на матчи
              </p>
            </div>
            <Link href="/profile/setup"
              className="shrink-0 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg
                         hover:opacity-90 transition-opacity">
              Заполнить
            </Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Рейтинг" value={profile?.rating ? profile.rating.toFixed(1) : "—"} />
          <StatCard label="Матчей"  value={profile?.matchesPlayed ?? 0} />
          <StatCard label="Голов"   value={profile?.goalsScored ?? 0} />
        </div>

        <Section title="Аккаунт">
          <Row label="Email" value={session.user.email ?? "—"} />
          <Row label="Роль"  value={String(session.user.role) === "ADMIN" ? "Администратор" : "Игрок"} />
        </Section>

        {profile && (
          <Section title="Игровой профиль">
            <Row label="Имя"     value={`${profile.firstName} ${profile.lastName}`} />
            {profile.age > 0      && <Row label="Возраст"    value={`${profile.age} лет`} />}
            {profile.heightCm > 0 && <Row label="Рост / Вес" value={`${profile.heightCm} см · ${profile.weightKg} кг`} />}
            <Row label="Позиция"  value={POSITION_LABELS[profile.mainPosition] ?? profile.mainPosition} />
            {profile.altPosition  && <Row label="Доп. позиция" value={POSITION_LABELS[profile.altPosition] ?? profile.altPosition} />}
            <Row label="Нога"     value={FOOT_LABELS[profile.dominantFoot] ?? profile.dominantFoot} />
            <Row label="Уровень"  value={EXPERIENCE_LABELS[profile.experienceLevel] ?? profile.experienceLevel} />
            {profile.experienceYears > 0 && <Row label="Опыт" value={`${profile.experienceYears} лет`} />}
          </Section>
        )}

        <Section title="Быстрые действия">
          <div className="grid grid-cols-2 gap-3 p-4">
            <ActionButton href="/matches" label="Найти матч" />
            <ActionButton href="/profile" label="Мой профиль" />
          </div>
        </Section>

      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-4 text-center">
      <div className="font-display text-3xl">{value}</div>
      <div className="text-zinc-500 text-xs mt-1">{label}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">{title}</h2>
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
        {children}
      </div>
    </div>
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
function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="bg-[#111111] border border-white/[0.08] hover:border-white/25 transition-colors
                 rounded-xl px-4 py-3 text-sm font-medium text-center block">
      {label}
    </Link>
  );
}
