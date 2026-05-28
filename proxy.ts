import { auth }         from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES     = ["/", "/login", "/register"];
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/matches"];
const ADMIN_PREFIXES    = ["/admin"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Публичные — пропускаем сразу без обращения к сессии
  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  if (isPublic) return NextResponse.next();

  const isProtected  = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminRoute = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAdminRoute) return NextResponse.next();

  // Получаем сессию
  const session  = await auth();
  const isLoggedIn = !!session?.user;

  if (!isLoggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
