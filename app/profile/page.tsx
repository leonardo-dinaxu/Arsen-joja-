// =============================================================
// SFL — Street Football League
// app/profile/page.tsx
// Страница профиля текущего пользователя
// =============================================================

import { requireAuth }   from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import { logoutAction }  from "@/app/actions/logout";
import Link              from "next/link";
import type { Metadata } from "next";
import ProfileEditForm   from "./_components/ProfileEditForm";

export const metadata: Metadata = { title: "Мой профиль — SFL" };

const POSITION_LABELS: Record<string, string> = {
  GK: "Вратарь",        LB: "Левый защитник",    RB: "Правый защитник",
  CB: "Центр. защитник", CDM: "Опорный ПЗ",       CM: "Центральный ПЗ",
  CAM: "Атакующий ПЗ",  LW: "Левый вингер",       RW: "Правый вингер",
  ST: "Нападающий",
};
const FOOT_LABELS:       Record<string, string> = { LEFT: "Левая", RIGHT: "Правая", BOTH: "Обе" };
const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: "Новичок", AMATEUR: "Любитель", INTERMEDIATE: "Средний",
  EXPERIENCED: "Опытный", PROFESSIONAL: "Профессионал",
};

export default async function ProfilePage() {
  const session = await requireAuth();

  const [profile, user, recentMatches] = await Promise.all([
    prisma.playerProfile.findUnique({
      where:  { userId: session.user.id },
      select: {
        firstName: true, lastName: true, age: true,
        heightCm: true, weightKg: true,
        mainPosition: true, altPosition: true,
        dominantFoot: true, experienceLevel: true, experienceYears: true,
        rating: true, matchesPlayed: true, goalsScored: true, assistsMade: true,
        totalRatings: true, photoUrl: true,
      },
    }),
    prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { email: true, phone: true, createdAt: true },
    }),
    // Последние 5 матчей
    prisma.matchRegistration.findMany({
      where:   { userId: session.user.id, status: { in: ["PENDING","CONFIRMED"] } },
      orderBy: { createdAt: "desc" },
      take:    5,
      select: {
        status: true,
        match: {
          select: {
            id: true, title: true, date: true,
            status: true, teamAScore: true, teamBScore: true,
          },
        },
      },
    }),
  ]);

  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(user.createdAt)
    : "—";

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Навбар */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL</Link>
        <div className="flex items-center gap-6">
          <Link href="/matches"   className="text-zinc-500 text-sm hover:text-white transition-colors">Матчи</Link>
          <Link href="/dashboard" className="text-zinc-500 text-sm hover:text-white transition-colors">Дашборд</Link>
          <form action={logoutAction}>
            <button type="submit" className="text-zinc-600 text-sm hover:text-white transition-colors">
              Выйти
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Шапка профиля */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-5">
          {/* Аватар */}
          <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center
                          text-xl font-medium shrink-0">
            {profile
              ? `${profile.firstName[0]}${profile.lastName[0]}`
              : session.user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-medium">
              {profile ? `${profile.firstName} ${profile.lastName}` : "Игрок"}
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">{user?.email}</p>
            <p className="text-zinc-600 text-xs mt-1">Участник с {memberSince}</p>
          </div>
          {/* Рейтинг */}
          {profile && profile.rating > 0 && (
            <div className="text-center shrink-0">
              <div className="text-2xl font-medium">{profile.rating.toFixed(1)}</div>
              <div className="text-zinc-500 text-xs">рейтинг</div>
              {profile.totalRatings > 0 && (
                <div className="text-zinc-600 text-xs">{profile.totalRatings} оценок</div>
              )}
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Матчей"  value={profile?.matchesPlayed ?? 0} />
          <StatCard label="Голов"   value={profile?.goalsScored   ?? 0} />
          <StatCard label="Передач" value={profile?.assistsMade   ?? 0} />
          <StatCard label="Рейтинг" value={profile?.rating ? profile.rating.toFixed(1) : "—"} />
        </div>

        {/* История матчей */}
        {recentMatches.length > 0 && (
          <Section title="Последние матчи">
            <div className="divide-y divide-zinc-800">
              {recentMatches.map((reg, i) => {
                const m = reg.match;
                const date = new Intl.DateTimeFormat("ru-RU", {
                  day: "numeric", month: "short",
                }).format(new Date(m.date));
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/matches/${m.id}`}
                        className="text-sm font-medium hover:text-zinc-300 transition-colors truncate block">
                        {m.title}
                      </Link>
                      <div className="text-zinc-500 text-xs mt-0.5">{date}</div>
                    </div>
                    {m.status === "COMPLETED" && m.teamAScore !== null && (
                      <span className="text-zinc-400 text-xs shrink-0">
                        {m.teamAScore} — {m.teamBScore}
                      </span>
                    )}
                    <span className={[
                      "text-xs px-2 py-0.5 rounded-full shrink-0",
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
          </Section>
        )}

        {/* Форма редактирования профиля */}
        <Section title="Редактировать профиль">
          <div className="p-5">
            <ProfileEditForm
              defaultValues={{
                firstName:       profile?.firstName       ?? "",
                lastName:        profile?.lastName        ?? "",
                age:             String(profile?.age      ?? ""),
                heightCm:        String(profile?.heightCm ?? ""),
                weightKg:        String(profile?.weightKg ?? ""),
                mainPosition:    profile?.mainPosition    ?? "CM",
                altPosition:     profile?.altPosition     ?? "",
                dominantFoot:    profile?.dominantFoot    ?? "RIGHT",
                experienceLevel: profile?.experienceLevel ?? "AMATEUR",
                experienceYears: String(profile?.experienceYears ?? "0"),
                phone:           user?.phone              ?? "",
              }}
            />
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
