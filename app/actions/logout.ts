"use server";

// =============================================================
// SFL — Street Football League
// app/actions/logout.ts
// =============================================================

import { signOut } from "@/auth";

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
