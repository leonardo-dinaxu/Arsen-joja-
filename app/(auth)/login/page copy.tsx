// =============================================================
// SFL — Street Football League
// app/(auth)/login/page.tsx
// =============================================================

import type { Metadata } from "next";
import LoginForm         from "./_components/LoginForm";

export const metadata: Metadata = {
  title:       "Вход — SFL",
  description: "Войдите в свой аккаунт SFL",
};

export default function LoginPage() {
  return <LoginForm />;
}
