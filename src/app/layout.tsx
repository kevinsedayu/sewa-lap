import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gelora Bumi Mintarsih - Booking Lapangan Sepakbola",
  description: "Sistem penyewaan lapangan sepakbola online.",
  keywords: ["sewa lapangan", "booking lapangan", "sepakbola", "futsal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
