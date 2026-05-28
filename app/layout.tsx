import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SFL — Street Football League",
  description: "Организованные любительские футбольные матчи",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
