// =============================================================
// SFL — компонент логотипа (использует public/logo.png)
// =============================================================

import Image from "next/image";
import Link  from "next/link";

export default function Logo({
  size = 40,
  href = "/",
}: {
  size?: number;
  href?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 select-none shrink-0">
      <Image
        src="/logo.png"
        alt="SFL — Street Leagues of Football"
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority
      />
      <span className="font-display text-xl tracking-[0.3em] hidden sm:block">SFL</span>
    </Link>
  );
}
