import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Gelora Bumi Mintarsih - Booking Lapangan Sepakbola",
  description: "Sistem penyewaan lapangan sepakbola online.",
  keywords: ["sewa lapangan", "booking lapangan", "sepakbola", "futsal"],
  // SEO enhancements
  openGraph: {
    title: "Gelora Bumi Mintarsih - Booking Lapangan Sepakbola",
    description: "Sistem penyewaan lapangan sepakbola online. Booking mudah, pembayaran aman.",
    url: "https://bumimintarsih.my.id", // replace with actual domain
    siteName: "Gelora Bumi Mintarsih",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gelora Bumi Mintarsih - Booking Lapangan Sepakbola",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gelora Bumi Mintarsih - Booking Lapangan Sepakbola",
    description: "Sistem penyewaan lapangan sepakbola online. Booking mudah, pembayaran aman.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/ico.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://bumimintarsih.my.id",
  },
};

import NextTopLoader from 'nextjs-toploader';
import Footer from '@/components/shared/Footer';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="antialiased">
        <NextTopLoader
          color="#16a34a"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #16a34a,0 0 5px #16a34a"
        />
        {children}
        <Footer />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: { fontFamily: 'var(--font-inter)' }
          }}
        />
      </body>
    </html>
  );
}
