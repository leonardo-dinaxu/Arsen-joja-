"use client";

// =============================================================
// SFL — общий навбар для внутренних страниц
// Адаптивный: на мобильных — бургер-меню
// =============================================================

import { useState }     from "react";
import Link             from "next/link";
import Logo             from "@/components/Logo";
import { logoutAction } from "@/app/actions/logout";

interface NavLink {
  href:  string;
  label: string;
}

export default function SiteNav({
  links,
  isLoggedIn,
  active,
}: {
  links:      NavLink[];
  isLoggedIn: boolean;
  active?:    string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/[0.08]">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Logo size={36} />

        {/* Десктоп-ссылки */}
        <div className="hidden md:flex items-center gap-7 text-[13px]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "transition-colors",
                active === l.href ? "text-white" : "text-zinc-500 hover:text-white",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <form action={logoutAction}>
              <button type="submit" className="text-zinc-600 hover:text-white transition-colors">
                Выйти
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="bg-white text-black font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Войти
            </Link>
          )}
        </div>

        {/* Бургер */}
        <button
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          <span className={["block w-5 h-px bg-white transition-transform", open ? "rotate-45 translate-y-[3.5px]" : ""].join(" ")} />
          <span className={["block w-5 h-px bg-white transition-transform", open ? "-rotate-45 -translate-y-[3.5px]" : ""].join(" ")} />
        </button>
      </nav>

      {/* Мобильное меню */}
      {open && (
        <div className="md:hidden border-t border-white/[0.08] bg-black/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={[
                  "py-3 text-sm border-b border-white/[0.05] transition-colors",
                  active === l.href ? "text-white" : "text-zinc-400",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <form action={logoutAction} className="py-3">
                <button type="submit" className="text-zinc-500 text-sm">Выйти</button>
              </form>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="py-3 text-sm text-white">
                Войти
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
