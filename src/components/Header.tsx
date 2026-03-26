"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, MonitorPlay, Users, Search, ArrowLeft } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isIlanDetay = pathname.startsWith("/ilan/");
  const isAuthPage = pathname === "/giris" || pathname === "/kayit" || pathname.startsWith("/admin");

  // Auth/Admin sayfalarında global header tamamen gizlenir, kendi özel yapıları var
  if (isAuthPage) return null;

  const ThemeToggle = () =>
    mounted ? (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-full hover:bg-[var(--bg-primary)] transition-colors"
        aria-label="Toggle Theme"
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
      {/* ────────── MOBİL HEADER (Tablet ve altı) ────────── */}
      <div className="md:hidden h-14 px-4 flex items-center justify-between">
        {/* Sol bölüm — eşit genişlik */}
        <div className="w-10 flex-shrink-0">
          {isIlanDetay && (
            <button
              onClick={() => router.back()}
              className="flex items-center text-[var(--text-primary)] hover:text-[var(--accent-main)] transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
          )}
        </div>

        {/* Orta bölüm — tam ortalı logo */}
        <Link href="/" className="flex-1 flex justify-center">
          <Logo />
        </Link>

        {/* Sağ bölüm — eşit genişlik */}
        <div className="w-10 flex justify-end flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>

      {/* ────────── MASAÜSTÜ HEADER ────────── */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 h-14 items-center justify-between">
        {/* Sol: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-main)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--accent-main)]/30">
            K
          </div>
          <span className="text-lg font-bold tracking-tight">KurbanApp</span>
        </Link>

        {/* Orta: Nav linkleri */}
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

        {/* Sağ: Tema + Avatar */}
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
