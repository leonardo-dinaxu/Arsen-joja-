"use client";

// =============================================================
// SFL — Street Leagues of Football
// app/page.tsx — Premium landing page
// =============================================================

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link  from "next/link";

const ROTATING_LINES = [
  "Организованные матчи каждую неделю",
  "Профессиональные поля и манишки",
  "Видеозапись каждой игры",
  "Рейтинги, статистика, прогресс",
];

const STATS = [
  { value: 47,  suffix: "+", label: "Игроков в лиге" },
  { value: 10,  suffix: "+", label: "Сыгранных матчей" },
  { value: 14,   suffix: "",  label: "Игроков в формате" },
  { value: 0,  suffix: "%", label: "Матчей на видео" },
];

const TOP_PLAYERS = [
  { rank: 1, name: "Шукурхужа Акбархужаев",    pos: "Вратарь",        rating: 9.0, matches: 5 },
  { rank: 2, name: "Азиз Турсунов",   pos: "Центральный ПЗ", rating: 8.4, matches: 4 },
  { rank: 3, name: "Нодир Рашидов",   pos: "Нападающий",     rating: 7.9, matches: 2},
  { rank: 4, name: "Фирдавс Хасанов", pos: "Защитник",       rating: 7.4, matches: 2 },
  { rank: 5, name: "Бекзод Алимов",   pos: "Атакующий ПЗ",   rating: 7.1, matches: 1 },
];

const FEATURED = [
  { name: "Шукурхужа Акбархужаев",  pos: "GK", rating: 9.0, badge: "MVP",       initials: "ША" },
  { name: "Азиз Турсунов", pos: "CM", rating: 8.4, badge: "Капитан",   initials: "АТ" },
  { name: "Нодир Рашидов", pos: "ST", rating: 7.9, badge: "Бомбардир", initials: "НР" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [wordIdx,  setWordIdx]  = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setWordIdx((i) => (i + 1) % ROTATING_LINES.length),
      3200
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ════════════════════ NAVBAR ════════════════════ */}
      <header
        className={[
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled || menuOpen
            ? "bg-black/70 backdrop-blur-xl border-b border-white/[0.08]"
            : "bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 select-none">
            <Image src="/logo.png" alt="SFL" width={40} height={40}
              className="rounded-full" priority />
            <span className="font-display text-xl tracking-[0.3em] hidden sm:block">SFL</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[13px] text-zinc-400">
            <a href="#about"    className="hover:text-white transition-colors">О лиге</a>
            <a href="#rankings" className="hover:text-white transition-colors">Рейтинги</a>
            <a href="#players"  className="hover:text-white transition-colors">Игроки</a>
            <a href="#media"    className="hover:text-white transition-colors">Медиа</a>
            <Link href="/matches" className="hover:text-white transition-colors">Матчи</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login"
              className="hidden sm:block text-[13px] text-zinc-400 hover:text-white transition-colors">
              Войти
            </Link>
            <Link href="/register"
              className="bg-white text-black text-[12px] sm:text-[13px] font-medium
                         px-3.5 sm:px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Join League
            </Link>
            <button
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 -mr-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Меню"
            >
              <span className={["block w-5 h-px bg-white transition-transform", menuOpen ? "rotate-45 translate-y-[3.5px]" : ""].join(" ")} />
              <span className={["block w-5 h-px bg-white transition-transform", menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""].join(" ")} />
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-black/95 backdrop-blur-xl">
            <div className="px-6 py-4 flex flex-col">
              {[
                { href: "#about",    label: "О лиге" },
                { href: "#rankings", label: "Рейтинги" },
                { href: "#players",  label: "Игроки" },
                { href: "#media",    label: "Медиа" },
              ].map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm text-zinc-400 border-b border-white/[0.05]">
                  {l.label}
                </a>
              ))}
              <Link href="/matches" onClick={() => setMenuOpen(false)}
                className="py-3 text-sm text-zinc-400 border-b border-white/[0.05]">
                Матчи
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="py-3 text-sm text-white">
                Войти
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-14">

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <svg className="spin-slow w-[160vmin] sm:w-[140vmin] h-[160vmin] sm:h-[140vmin] opacity-[0.05]"
               viewBox="0 0 400 400" fill="none" stroke="white" strokeWidth="0.6">
            <circle cx="200" cy="200" r="190" />
            <circle cx="200" cy="200" r="130" />
            <polygon points="200,80 305,155 265,280 135,280 95,155" />
            <polygon points="200,120 270,170 243,255 157,255 130,170" />
            <line x1="200" y1="80"  x2="200" y2="10" />
            <line x1="305" y1="155" x2="372" y2="133" />
            <line x1="265" y1="280" x2="307" y2="337" />
            <line x1="135" y1="280" x2="93"  y2="337" />
            <line x1="95"  y1="155" x2="28"  y2="133" />
          </svg>
        </div>

        <div className="absolute pointer-events-none"
          style={{
            width: "min(700px, 90vw)", height: "min(700px, 90vw)", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)",
          }} />

        <div className="relative z-10 text-center max-w-4xl">

          <div className="hero-fade hero-fade-1 mb-8 sm:mb-10 flex justify-center">
            <Image
              src="/logo.png"
              alt="SFL — Street Leagues of Football"
              width={260}
              height={260}
              className="w-44 h-44 sm:w-60 sm:h-60 rounded-full
                         shadow-[0_0_120px_rgba(255,255,255,0.12)]"
              priority
            />
          </div>

          <h1 className="hero-fade hero-fade-2 font-display leading-[0.95]
                         text-5xl sm:text-8xl lg:text-[110px] tracking-wide">
            THE FUTURE OF<br />STREET FOOTBALL
          </h1>

          <p className="hero-fade hero-fade-3 mt-6 sm:mt-8 font-display
                        text-base sm:text-2xl tracking-[0.25em] sm:tracking-[0.35em] text-zinc-400">
            COMPETE&nbsp;·&nbsp;RISE&nbsp;·&nbsp;BECOME A CHAMPION
          </p>

          <div className="hero-fade hero-fade-3 h-7 mt-5 relative">
            {ROTATING_LINES.map((line, i) => (
              <p key={i}
                className="absolute inset-x-0 text-xs sm:text-sm text-zinc-500 transition-all duration-500"
                style={{
                  opacity:   wordIdx === i ? 1 : 0,
                  transform: wordIdx === i ? "translateY(0)" : "translateY(8px)",
                }}>
                {line}
              </p>
            ))}
          </div>

          <div className="hero-fade hero-fade-4 mt-8 sm:mt-10 flex flex-col sm:flex-row
                          items-center justify-center gap-3 sm:gap-4 px-4">
            <Link href="/register"
              className="w-full sm:w-auto bg-white text-black font-medium px-10 py-4 rounded-xl
                         text-sm hover:opacity-90 hover:scale-[1.02] transition-all text-center">
              Join League
            </Link>
            <a href="#rankings"
              className="w-full sm:w-auto border border-white/20 text-white px-10 py-4 rounded-xl
                         text-sm hover:border-white/50 hover:bg-white/5 transition-all text-center">
              View Rankings
            </a>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-600 text-[10px]
                        tracking-[0.3em] uppercase animate-bounce">
          Scroll
        </div>
      </section>

      {/* ════════════════════ ABOUT ════════════════════ */}
      <section id="about" className="relative border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28
                        grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <div className="reveal">
            <p className="text-xs tracking-[0.4em] text-zinc-500 uppercase mb-5">О лиге</p>
            <h2 className="font-display text-4xl sm:text-7xl leading-[0.95] mb-6 sm:mb-8">
              ИГРАЙ КАК<br />ПРОФЕССИОНАЛ
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-5 max-w-md text-sm sm:text-base">
              SFL — это организованная лига любительского футбола.
              Мы берём на себя всё: профессиональное поле, манишки, воду,
              видеозапись каждого матча. Тебе остаётся одно — играть.
            </p>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-8 max-w-md">
              Записывайся на матчи в пару кликов, отслеживай свой рейтинг,
              смотри свои голы в записи и расти как игрок.
            </p>
            <Link href="/register"
              className="inline-block border border-white/20 px-8 py-3.5 rounded-xl text-sm
                         hover:border-white/50 hover:bg-white/5 transition-all">
              Стать частью лиги →
            </Link>
          </div>

          <div className="reveal">
            <div className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-3xl
                            aspect-[4/3] flex items-center justify-center overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-[0.07]"
                   viewBox="0 0 400 300" fill="none" stroke="white" strokeWidth="1">
                <rect x="20" y="20" width="360" height="260" rx="4" />
                <line x1="200" y1="20" x2="200" y2="280" />
                <circle cx="200" cy="150" r="46" />
                <rect x="20" y="85" width="55" height="130" />
                <rect x="325" y="85" width="55" height="130" />
              </svg>
              <Image src="/logo.png" alt="" width={220} height={220}
                className="opacity-20 w-40 sm:w-56 h-auto" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {STATS.map((s, i) => <StatCounter key={i} {...s} />)}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════ RANKINGS ════════════════════ */}
      <section id="rankings" className="border-t border-white/[0.08] bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">

          <div className="reveal text-center mb-10 sm:mb-14">
            <p className="text-xs tracking-[0.4em] text-zinc-500 uppercase mb-4">Лидерборд</p>
            <h2 className="font-display text-4xl sm:text-7xl">ТОП ИГРОКИ ЛИГИ</h2>
          </div>

          <div className="reveal bg-[#111111] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-[64px_1fr_140px_100px_100px]
                            gap-4 px-6 py-4 text-[11px] tracking-[0.2em] uppercase text-zinc-600
                            border-b border-white/[0.08]">
              <span>#</span><span>Игрок</span><span>Позиция</span>
              <span className="text-right">Матчи</span><span className="text-right">Рейтинг</span>
            </div>

            {TOP_PLAYERS.map((p) => (
              <div key={p.rank}
                className="grid grid-cols-[40px_1fr_64px] sm:grid-cols-[64px_1fr_140px_100px_100px]
                           gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 items-center
                           border-b border-white/[0.05] last:border-0
                           hover:bg-white/[0.03] transition-colors">
                <span className={["font-display text-xl sm:text-2xl",
                  p.rank === 1 ? "text-white" : "text-zinc-600"].join(" ")}>
                  {String(p.rank).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="min-w-0">
                    <span className="font-medium text-sm block truncate">{p.name}</span>
                    <span className="sm:hidden text-zinc-600 text-xs">{p.pos} · {p.matches} матчей</span>
                  </div>
                  {p.rank === 1 && (
                    <span className="text-[9px] sm:text-[10px] tracking-widest bg-white text-black
                                     px-2 py-0.5 rounded-full font-medium shrink-0">MVP</span>
                  )}
                </div>
                <span className="hidden sm:block text-zinc-500 text-sm">{p.pos}</span>
                <span className="hidden sm:block text-right text-zinc-400 text-sm">{p.matches}</span>
                <span className="text-right font-display text-xl sm:text-2xl">{p.rating.toFixed(1)}</span>
              </div>
            ))}
          </div>

          <div className="reveal text-center mt-8">
            <Link href="/register" className="text-zinc-500 text-sm hover:text-white transition-colors">
              Зарегистрируйся, чтобы попасть в рейтинг →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURED PLAYERS ════════════════════ */}
      <section id="players" className="border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">

          <div className="reveal text-center mb-10 sm:mb-14">
            <p className="text-xs tracking-[0.4em] text-zinc-500 uppercase mb-4">Featured</p>
            <h2 className="font-display text-4xl sm:text-7xl">ЗВЁЗДЫ СЕЗОНА</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            {FEATURED.map((p, i) => (
              <div key={i}
                className="reveal group bg-[#111111] border border-white/[0.08] rounded-3xl
                           p-6 sm:p-8 hover:border-white/25 hover:-translate-y-1
                           transition-all duration-300">
                <div className="relative mb-6 sm:mb-8 inline-block">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0A0A0A]
                                  border border-white/[0.08] flex items-center justify-center
                                  font-display text-3xl sm:text-4xl
                                  group-hover:border-white/25 transition-colors">
                    {p.initials}
                  </div>
                  <span className="absolute -top-2 -right-10 text-[10px] tracking-widest
                                   bg-white text-black px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                    {p.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl mb-1">{p.name}</h3>
                <p className="text-zinc-500 text-sm mb-6 sm:mb-8">{p.pos}</p>

                <div className="flex items-end justify-between border-t border-white/[0.08] pt-5 sm:pt-6">
                  <div>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-600 mb-1">Рейтинг</p>
                    <p className="font-display text-4xl sm:text-5xl leading-none">{p.rating.toFixed(1)}</p>
                  </div>
                  <span className="text-zinc-600 text-xs group-hover:text-zinc-400 transition-colors">
                    из 10.0
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ MEDIA ════════════════════ */}
      <section id="media" className="border-t border-white/[0.08] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">

          <div className="reveal text-center mb-10 sm:mb-14">
            <p className="text-xs tracking-[0.4em] text-zinc-500 uppercase mb-4">Медиа</p>
            <h2 className="font-display text-4xl sm:text-7xl">КАЖДЫЙ МАТЧ НА ПЛЁНКЕ</h2>
          </div>

          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4
                          auto-rows-[120px] sm:auto-rows-[180px]">
            {[
              { span: "col-span-2 row-span-2", label: "Highlights · Матч #17", icon: "▶" },
              { span: "",           label: "Лучший гол недели", icon: "▶" },
              { span: "",           label: "Сейв тура",         icon: "▶" },
              { span: "row-span-2", label: "Интервью MVP",      icon: "▶" },
              { span: "",           label: "Атмосфера матчдня", icon: ""  },
              { span: "",           label: "Топ-5 моментов",    icon: "▶" },
            ].map((m, i) => (
              <div key={i}
                className={[
                  "group relative bg-[#111111] border border-white/[0.08] rounded-2xl",
                  "overflow-hidden cursor-pointer hover:border-white/25 transition-all duration-300",
                  m.span,
                ].join(" ")}>
                <svg className="absolute inset-0 w-full h-full opacity-[0.05]
                                group-hover:opacity-[0.1] group-hover:scale-105 transition-all duration-500"
                     viewBox="0 0 200 200" fill="none" stroke="white" strokeWidth="1">
                  <circle cx="100" cy="100" r="60" />
                  <line x1="0" y1="100" x2="200" y2="100" />
                  <circle cx="100" cy="100" r="4" fill="white" />
                </svg>
                {m.icon && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30
                                     flex items-center justify-center text-sm
                                     group-hover:bg-white group-hover:text-black transition-all duration-300">
                      {m.icon}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4
                                 text-[11px] sm:text-xs text-zinc-400 group-hover:text-white transition-colors">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA ════════════════════ */}
      <section className="relative border-t border-white/[0.08] overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: "min(900px, 100vw)", height: "min(900px, 100vw)", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)",
          }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-36 text-center">
          <h2 className="reveal font-display leading-[0.9] text-5xl sm:text-9xl lg:text-[140px]">
            FUTBOL NEMA<br />DEYOPTIII
          </h2>
          <p className="reveal text-zinc-500 mt-6 sm:mt-8 mb-10 sm:mb-12 text-xs sm:text-sm
                        tracking-[0.25em] uppercase">
            Хватит смотреть — пора играть
          </p>
          <div className="reveal">
            <Link href="/register"
              className="inline-block bg-white text-black font-medium px-10 sm:px-14 py-4 sm:py-5
                         rounded-2xl text-sm sm:text-base hover:opacity-90 hover:scale-[1.03] transition-all">
              JOIN SFL NOW
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════ PARTNERS ════════════════════ */}
      <section className="border-t border-white/[0.08] py-12 sm:py-16 overflow-hidden">
        <p className="reveal text-center text-[11px] tracking-[0.4em] uppercase text-zinc-600 mb-8 sm:mb-10">
          Нам доверяют
        </p>
        <div className="relative">
          <div className="marquee flex gap-14 sm:gap-20 w-max">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex gap-14 sm:gap-20 items-center shrink-0">
                {[ "PAYME", "CLICK", "UZCARD",].map((name) => (
                  <span key={name}
                    className="font-display text-xl sm:text-2xl text-zinc-700 tracking-[0.2em]
                               hover:text-zinc-400 transition-colors whitespace-nowrap">
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer className="border-t border-white/[0.08] bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10 items-start">

            <div>
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="SFL" width={48} height={48} className="rounded-full" />
                <span className="font-display text-2xl tracking-[0.3em]">SFL</span>
              </div>
              <p className="text-zinc-600 text-xs mt-3 leading-relaxed max-w-[240px]">
                Street Leagues of Football — организованный любительский футбол в Ташкенте.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <a href="#about"    className="text-zinc-500 hover:text-white transition-colors">О лиге</a>
              <Link href="/matches"  className="text-zinc-500 hover:text-white transition-colors">Матчи</Link>
              <a href="#rankings" className="text-zinc-500 hover:text-white transition-colors">Рейтинги</a>
              <Link href="/login"    className="text-zinc-500 hover:text-white transition-colors">Войти</Link>
              <a href="#players"  className="text-zinc-500 hover:text-white transition-colors">Игроки</a>
              <Link href="/register" className="text-zinc-500 hover:text-white transition-colors">Регистрация</Link>
            </div>

            <div className="flex sm:justify-end gap-3">
              {["TG", "IG", "YT"].map((s) => (
                <span key={s}
                  className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center
                             justify-center text-xs text-zinc-500 hover:text-white
                             hover:border-white/30 transition-all cursor-pointer">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.05] mt-10 sm:mt-12 pt-6 sm:pt-8
                          flex flex-wrap gap-4 items-center justify-between text-xs text-zinc-700">
            <span>© 2026 SFL — Street Leagues of Football</span>
            <span className="font-display tracking-[0.3em]">COMPETE · RISE · CHAMPION</span>
          </div>
        </div>
      </footer>

    </main>
  );
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="bg-[#111111] border border-white/[0.08] rounded-2xl p-3 sm:p-4 text-center">
      <div className="font-display text-2xl sm:text-3xl">{display}{suffix}</div>
      <div className="text-zinc-600 text-[10px] sm:text-[11px] mt-1 leading-tight">{label}</div>
    </div>
  );
}
