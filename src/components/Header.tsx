"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, MonitorPlay, Users, Search, ArrowLeft, Download } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [showInstallToast, setShowInstallToast] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Zaten yüklü mü? (standalone modda açıldıysa)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsPwaInstalled(true);
      return;
    }

    // Android/Chrome: yükleme promptunu yakala
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler as any);

    // Yükleme tamamlandığında gizle
    const onInstalled = () => {
      setIsPwaInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as any);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      // Android/Chrome: native prompt göster
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === "accepted") {
        setIsPwaInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      // iOS Safari: manuel talimat
      setShowInstallToast(true);
      setTimeout(() => setShowInstallToast(false), 6000);
    }
  };

  const isIlanDetay = pathname.startsWith("/ilan/");
  const isAuthPage = pathname === "/giris" || pathname === "/kayit" || pathname.startsWith("/admin");

  if (isAuthPage) return null;

  const isIOS = mounted && /iphone|ipad|ipod/i.test(navigator.userAgent);
  // Butonu göster: yüklü değilse VE (native prompt var VEYA iOS cihaz)
  const showInstallBtn = mounted && !isPwaInstalled && (installPrompt !== null || isIOS);

  const ThemeToggle = () =>
    mounted ? (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-full hover:bg-[var(--bg-primary)] transition-colors"
        aria-label="Tema Değiştir"
      >
        {theme === "dark" ? (
          <Sun size={20} className="text-[var(--accent-gold)]" />
        ) : (
          <Moon size={20} className="text-slate-500" />
        )}
      </button>
    ) : <div className="w-9 h-9" />;

  const Logo = () => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-[var(--accent-main)] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[var(--accent-main)]/30">
        K
      </div>
      <span className="text-base font-bold tracking-tight">KurbanApp</span>
    </div>
  );

  return (
    <header
      style={{ transform: "translateZ(0)", willChange: "transform" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shadow-sm"
    >
      {/* iOS yükleme talimatı */}
      {showInstallToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xs bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl border border-white/10 z-50 text-center">
          <p className="font-bold text-sm mb-1">📲 Ana Ekrana Ekle</p>
          <p className="text-white/80 leading-relaxed">
            Tarayıcı paylaşım menüsünden
            <strong className="text-white"> &quot;Ana Ekrana Ekle&quot;</strong>
            {" "}seçeneğine dokun.
          </p>
        </div>
      )}

      {/* ────────── MOBİL HEADER ────────── */}
      <div className="md:hidden h-14 px-3 flex items-center justify-between">
        {/* Sol: PWA butonu veya geri butonu */}
        <div className="w-10 flex-shrink-0 flex items-center">
          {isIlanDetay ? (
            <button
              onClick={() => router.back()}
              className="flex items-center text-[var(--text-primary)] hover:text-[var(--accent-main)] transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
          ) : showInstallBtn ? (
            <button
              onClick={handleInstall}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/30 text-[var(--accent-main)] hover:bg-[var(--accent-main)]/20 transition-all active:scale-95"
              aria-label="Uygulamayı Yükle"
              title="Telefona Yükle"
            >
              <Download size={17} />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--accent-main)] rounded-full border-2 border-[var(--bg-secondary)] animate-pulse" />
            </button>
          ) : null}
        </div>

        {/* Orta: Logo */}
        <Link href="/" className="flex-1 flex justify-center">
          <Logo />
        </Link>

        {/* Sağ: Tema */}
        <div className="w-10 flex justify-end flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>

      {/* ────────── MASAÜSTÜ HEADER ────────── */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-main)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--accent-main)]/30">
            K
          </div>
          <span className="text-lg font-bold tracking-tight">KurbanApp</span>
        </Link>

        {!isIlanDetay && (
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--accent-main)] flex items-center gap-1 font-medium transition-colors text-sm">
              <Search size={16} /> Keşfet
            </Link>
            <Link href="/yayinlar" className="text-[var(--text-secondary)] hover:text-[var(--accent-main)] flex items-center gap-1 font-medium transition-colors text-sm">
              <MonitorPlay size={16} /> Canlı Yayınlar
            </Link>
            <Link href="/kurbanlarim" className="text-[var(--text-secondary)] hover:text-[var(--accent-main)] flex items-center gap-1 font-medium transition-colors text-sm">
              <Users size={16} /> Kurbanlarım
            </Link>
          </nav>
        )}

        {isIlanDetay && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-main)] transition-colors text-sm"
          >
            <ArrowLeft size={18} /> Geri Dön
          </button>
        )}

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/profil"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-main)] to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all"
            title="Profilim"
          >
            E
          </Link>
        </div>
      </div>
    </header>
  );
}
