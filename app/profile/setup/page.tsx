// =============================================================
// SFL — Street Football League
// app/profile/setup/page.tsx
// =============================================================

import { requireAuth }   from "@/lib/auth-helpers";
import { prisma }        from "@/lib/prisma";
import type { Metadata } from "next";
import SetupForm         from "./_components/SetupForm";

export const metadata: Metadata = { title: "Заполнить профиль — SFL" };

export default async function ProfileSetupPage() {
  const session = await requireAuth();

  // Передаём текущие данные профиля в форму (для pre-fill)
  const profile = await prisma.playerProfile.findUnique({
    where:  { userId: session.user.id },
    select: {
      firstName: true, lastName: true, age: true,
      heightCm: true, weightKg: true, mainPosition: true,
      altPosition: true, dominantFoot: true,
      experienceLevel: true, experienceYears: true,
    },
  });

  const phone = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { phone: true },
  });

  return (
    <SetupForm
      defaultValues={{
        firstName:       profile?.firstName ?? "",
        lastName:        profile?.lastName  ?? "",
        age:             profile?.age       ?? 0,
        heightCm:        profile?.heightCm  ?? 0,
        weightKg:        profile?.weightKg  ?? 0,
        mainPosition:    profile?.mainPosition  ?? "CM",
        altPosition:     profile?.altPosition   ?? "",
        dominantFoot:    profile?.dominantFoot  ?? "RIGHT",
        experienceLevel: profile?.experienceLevel ?? "AMATEUR",
        experienceYears: profile?.experienceYears ?? 0,
        phone:           phone?.phone ?? "",
      }}
    />
  );
}
