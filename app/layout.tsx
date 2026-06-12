import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight:   "400",
  subsets:  ["latin"],
  variable: "--font-bebas",
});

const inter = Inter({
  subsets:  ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title:       "SFL — Street Leagues of Football",
  description: "The future of street football. Compete. Rise. Become a Champion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${bebas.variable} ${inter.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
