"use client";

import { motion } from "framer-motion";
import { User, ChevronRight, LogOut, Settings, CreditCard, Shield, HelpCircle, Bell, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ProfilPage() {
  const router = useRouter();
  const { user, profil, yukleniyor, cikisYap } = useAuth();

  const handleCikis = async () => {
    await cikisYap();
    router.push("/giris");
  };

  const menuListesi = [
    { title: "Hesap Bilgileri", icon: User, path: "/profil/duzenle", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Kurbanlarım", icon: CreditCard, path: "/kurbanlarim", color: "text-[var(--accent-main)]", bg: "bg-[var(--accent-main)]/10" },
    { title: "Adreslerim", icon: MapPin, path: "/profil/adresler", color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Bildirim Ayarları", icon: Bell, path: "/profil/bildirimler", color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Güvenlik ve Şifre", icon: Shield, path: "/profil/guvenlik", color: "text-slate-500", bg: "bg-slate-500/10" },
    { title: "Yardım ve Destek", icon: HelpCircle, path: "/yardim", color: "text-green-500", bg: "bg-green-500/10" },
  ];

  // Yükleniyor
  if (yukleniyor) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-[var(--accent-main)]" />
    </div>
  );

  // Giriş yapılmamış
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={36} className="text-[var(--text-secondary)]" />
        </div>
        <h2 className="text-xl font-bold mb-2">Üye Girişi Gerekli</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Profilinizi görmek için giriş yapın.</p>
        <button onClick={() => router.push("/giris")} className="w-full py-3 rounded-2xl bg-[var(--accent-main)] text-white font-bold mb-3">
          Giriş Yap
        </button>
        <button onClick={() => router.push("/kayit")} className="w-full py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] font-bold text-sm">
          Hesap Oluştur
        </button>
      </div>
    </div>
  );

  const adSoyad = profil?.ad_soyad || user.email?.split("@")[0] || "Kullanıcı";
  const basTelefon = profil?.telefon || "-";
  const kayitTarihi = new Date(user.created_at).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen pb-24 pt-16 px-4 max-w-2xl mx-auto">

      {/* AVATAR & AD */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-4 mb-6 flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-main)] to-emerald-800 p-0.5 shadow-lg shadow-[var(--accent-main)]/20">
            <div className="w-full h-full bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
              {profil?.avatar_url ? (
                <img src={profil.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-[var(--accent-main)]">
                  {adSoyad.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <Link href="/profil/duzenle" className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-slate-800 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center shadow-sm">
            <Settings size={12} className="text-slate-500" />
          </Link>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">{adSoyad}</h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">{basTelefon}</p>
          <p className="text-xs text-[var(--text-secondary)]/60 mt-1">{kayitTarihi}&apos;den beri üye</p>
        </div>
      </motion.div>

      {/* QUICK INFO */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm text-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1 block">E-Posta</span>
          <span className="text-xs font-semibold truncate block">{user.email}</span>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm text-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1 block">Hesap Durumu</span>
          <span className="text-xs font-semibold text-[var(--accent-main)]">✓ Aktif Üye</span>
        </div>
      </motion.div>

      {/* MENÜ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm divide-y divide-[var(--border-color)] mb-4">
        {menuListesi.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={i} href={item.path} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-primary)] transition-colors group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <Icon size={20} className={item.color} />
              </div>
              <span className="flex-1 font-semibold text-sm">{item.title}</span>
              <ChevronRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </Link>
          );
        })}
      </motion.div>

      {/* ÇIKIŞ BUTONU */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <button onClick={handleCikis}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold transition-colors">
          <LogOut size={18} /> Çıkış Yap
        </button>
        <p className="text-center text-[10px] text-[var(--text-secondary)] opacity-50 mt-4">KurbanApp v1.0 · Tüm hakları saklıdır.</p>
      </motion.div>
    </div>
  );
}
