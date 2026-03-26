import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./theme-provider";
import { PWASetup } from "./pwa-setup";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ viewport artık ayrı export - Next.js 14+ uyumlu
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#080c13" },
  ],
};

export const metadata: Metadata = {
  title: "KurbanApp | Güvenilir ve Modern Kurban Platformu",
  description: "Canlı yayınla takip edilebilen, hissedar yönetimi olan modern kurbanlık platformu. Büyükbaş ve küçükbaş kurban satın alımı, helal kesim ve hisse takibi.",
  keywords: ["kurban", "kurbanlık", "kurban al", "hisse kurban", "helal kesim", "büyükbaş", "küçükbaş"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KurbanApp",
  },
  openGraph: {
    title: "KurbanApp | Güvenilir ve Modern Kurban Platformu",
    description: "Canlı yayınla takip edilebilen, hissedar yönetimi olan modern kurbanlık platformu.",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Header />
            {children}
            <BottomNav />
            <PWASetup />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
