// =============================================================
// SFL — Street Football League
// app/api/auth/[...nextauth]/route.ts
//
// Auth.js v5 catch-all route handler.
// Обрабатывает: /api/auth/signin, /api/auth/signout,
//               /api/auth/session, /api/auth/csrf, etc.
// =============================================================

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
