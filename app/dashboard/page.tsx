// =============================================================
// SFL — Street Football League
// app/dashboard/page.tsx
// =============================================================

import { requireAuth }   from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import { redirect }      from "next/navigation";
import { logoutAction }  from "@/app/actions/logout";
import Link              from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Дашборд — SFL" };

const POSITION_LABELS: Record<string, string> = {
  GK: "Вратарь", LB: "Левый защитник", RB: "Правый защитник",
  CB: "Центральный защитник", CDM: "Опорный полузащитник",
  CM: "Центральный полузащитник", CAM: "Атакующий полузащитник",
  LW: "Левый вингер", RW: "Правый вингер", ST: "Нападающий",
};
const FOOT_LABELS: Record<string, string> = {
  LEFT: "Левая", RIGHT: "Правая", BOTH: "Обе",
};
const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: "Новичок", AMATEUR: "Любитель", INTERMEDIATE: "Средний",
  EXPERIENCED: "Опытный", PROFESSIONAL: "Профессионал",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  if (session.user.role === "ADMIN") redirect("/admin");

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

      {/* Навбар */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL</span>
        <div className="flex items-center gap-6">
          <Link href="/matches" className="text-zinc-500 text-sm hover:text-white transition-colors">
            Матчи
          </Link>
          <Link href="/profile" className="text-zinc-500 text-sm hover:text-white transition-colors">
            Профиль
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-zinc-600 text-sm hover:text-white transition-colors">
              Выйти
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Приветствие */}
        <div>
          <h1 className="text-2xl font-medium">
            Привет, {profile?.firstName ?? session.user.firstName}!
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{session.user.email}</p>
        </div>

        {/* Баннер незаполненного профиля */}
        {!isProfileComplete && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Заполните профиль</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Укажите рост, вес и позицию — чтобы записываться на матчи
              </p>
            </div>
            <Link
              href="/profile/setup"
              className="shrink-0 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Заполнить
            </Link>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Рейтинг" value={profile?.rating ? profile.rating.toFixed(1) : "—"} />
          <StatCard label="Матчей"  value={profile?.matchesPlayed ?? 0} />
          <StatCard label="Голов"   value={profile?.goalsScored ?? 0} />
        </div>

        {/* Аккаунт */}
        <Section title="Аккаунт">
          <Row label="Email" value={session.user.email ?? "—"} />
          <Row label="Роль"  value={session.user.role === "ADMIN" ? "Администратор" : "Игрок"} />
        </Section>

        {/* Профиль */}
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

        {/* Быстрые действия */}
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
      <div className="text-2xl font-medium">{value}</div>
      <div className="text-zinc-500 text-xs mt-1">{label}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">{title}</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
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
    <Link href={href} className="bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-lg px-4 py-3 text-sm font-medium text-center block">
      {label}
    </Link>
  );
}
