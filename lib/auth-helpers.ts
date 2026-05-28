// =============================================================
// SFL — Street Football League
// lib/auth-helpers.ts
//
// Серверные хелперы для получения сессии и защиты Server Actions.
// Импортируй в Server Components, Route Handlers, Server Actions.
// =============================================================

import { auth }    from "@/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

// ---------------------------------------------------------------
// Возвращает текущую сессию или null
// ---------------------------------------------------------------
export async function getSession() {
  return auth();
}

// ---------------------------------------------------------------
// Возвращает сессию — или редиректит на /login
// Используй в защищённых Server Components
// ---------------------------------------------------------------
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

// ---------------------------------------------------------------
// Проверяет, что текущий пользователь — ADMIN
// Иначе редиректит на /dashboard
// ---------------------------------------------------------------
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user)             redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

// ---------------------------------------------------------------
// Проверяет роль без редиректа (для условного рендера)
// ---------------------------------------------------------------
export async function hasRole(role: Role): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === role;
}

// ---------------------------------------------------------------
// Возвращает ID текущего пользователя или null
// ---------------------------------------------------------------
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
