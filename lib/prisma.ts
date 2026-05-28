// =============================================================
// SFL — Street Football League
// lib/prisma.ts
//
// Singleton Prisma Client для Next.js 15 App Router + Prisma 5.
//
// Проблема: Next.js в dev-режиме пересобирает модули при каждом
// горячем обновлении (HMR), что без singleton приводит к созданию
// сотен открытых соединений с БД и ошибке:
//   "Too many connections" / "Max client connections reached"
//
// Решение: сохраняем единственный экземпляр PrismaClient
// в globalThis (он не сбрасывается при HMR), и переиспользуем
// его на протяжении всей dev-сессии.
// В production каждый серверный процесс создаёт ровно один клиент.
// =============================================================

import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Типизируем глобальное хранилище, чтобы TypeScript не ругался
// на нестандартное свойство globalThis.
// ---------------------------------------------------------------------------
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ---------------------------------------------------------------------------
// Опции логирования:
//   - в development: выводим все запросы, предупреждения и ошибки
//   - в production:  только ошибки (никаких SQL в логах)
// ---------------------------------------------------------------------------
function buildPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "development") {
    return new PrismaClient({
      log: [
        { emit: "stdout", level: "query" },   // SQL-запросы
        { emit: "stdout", level: "warn" },    // Предупреждения
        { emit: "stdout", level: "error" },   // Ошибки
      ],
      errorFormat: "pretty",
    });
  }

  return new PrismaClient({
    log: [{ emit: "stdout", level: "error" }],
    errorFormat: "minimal",
  });
}

// ---------------------------------------------------------------------------
// Singleton:
//   - dev:  берём существующий экземпляр из globalThis или создаём новый
//   - prod: всегда создаём свежий экземпляр (HMR не происходит)
// ---------------------------------------------------------------------------
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? buildPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
