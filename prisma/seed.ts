// =============================================================
// SFL — Street Football League
// prisma/seed.ts — тестовые данные
// Запуск: npm run db:seed
// =============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt           from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // Очищаем в правильном порядке
  await prisma.matchRegistration.deleteMany();
  await prisma.match.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Админ
  const adminHash = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email:        "admin@sfl.uz",
      passwordHash: adminHash,
      role:         "ADMIN",
      profile: {
        create: {
          firstName:       "Админ",
          lastName:        "SFL",
          age:             30,
          heightCm:        180,
          weightKg:        80,
          mainPosition:    "CM",
          dominantFoot:    "RIGHT",
          experienceLevel: "PROFESSIONAL",
          experienceYears: 15,
        },
      },
    },
  });

  // Тестовый игрок
  const playerHash = await bcrypt.hash("player123", 12);
  await prisma.user.create({
    data: {
      email:        "player@sfl.uz",
      passwordHash: playerHash,
      role:         "USER",
      profile: {
        create: {
          firstName:       "Азиз",
          lastName:        "Турсунов",
          age:             26,
          heightCm:        178,
          weightKg:        74,
          mainPosition:    "CM",
          altPosition:     "CAM",
          dominantFoot:    "RIGHT",
          experienceLevel: "EXPERIENCED",
          experienceYears: 7,
          rating:          8.4,
          matchesPlayed:   23,
          goalsScored:     11,
        },
      },
    },
  });

  // Матчи
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await prisma.match.createMany({
    data: [
      {
        title:      "Матч #15 · Суббота вечер",
        date:       new Date(now.getTime() + 3 * day),
        address:    "ул. Амира Темура 1, Ташкент",
        venueName:  "Стадион Пахтакор, поле А",
        priceSom:   150000,
        maxPlayers: 14,
        status:     "OPEN",
      },
      {
        title:      "Матч #16 · Воскресенье",
        date:       new Date(now.getTime() + 5 * day),
        address:    "ул. Амира Темура 1, Ташкент",
        venueName:  "Стадион Пахтакор, поле Б",
        priceSom:   150000,
        maxPlayers: 14,
        status:     "HOT",
      },
      {
        title:      "Матч #17 · Среда",
        date:       new Date(now.getTime() + 8 * day),
        address:    "ул. Амира Темура 1, Ташкент",
        venueName:  "Стадион Пахтакор, поле А",
        priceSom:   150000,
        maxPlayers: 14,
        status:     "OPEN",
      },
      {
        title:      "Матч #14 · Прошлая суббота",
        date:       new Date(now.getTime() - 4 * day),
        address:    "ул. Амира Темура 1, Ташкент",
        venueName:  "Стадион Пахтакор, поле А",
        priceSom:   150000,
        maxPlayers: 14,
        status:     "COMPLETED",
        teamAScore: 5,
        teamBScore: 3,
      },
    ],
  });

  console.log("✅ Done!");
  console.log("   admin@sfl.uz   / admin123");
  console.log("   player@sfl.uz  / player123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
