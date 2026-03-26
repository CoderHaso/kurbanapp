"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Phone, Mail, ChevronRight, Camera, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function ProfilDuzenlePage() {
  const router = useRouter();
  const { user, profil, profilGuncelle, yukleniyor } = useAuth();
  const fotoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ adSoyad: "", telefon: "", adres: "" });
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fotoYukleniyor, setFotoYukleniyor] = useState(false);

  useEffect(() => {
    if (profil) {
      setForm({
        adSoyad: profil.ad_soyad || "",
        telefon: profil.telefon || "",
        adres: profil.adres || "",
      });
      setAvatarUrl(profil.avatar_url || null);
    }
  }, [profil]);

  const handleFotoSec = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setFotoYukleniyor(true);

    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage.from("photos").upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("photos").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      await profilGuncelle({ avatar_url: data.publicUrl });
    }
    setFotoYukleniyor(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKaydediliyor(true);
    await profilGuncelle({
      ad_soyad: form.adSoyad,
      telefon: form.telefon,
      adres: form.adres,
    });
    setBasarili(true);
    setKaydediliyor(false);
    setTimeout(() => setBasarili(false), 3000);
  };

  useEffect(() => {
    if (!yukleniyor && !user) {
      router.push("/giris");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, yukleniyor]);

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button onClick={() => router.back()} className="flex items-center text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
          <ArrowLeft size={16} className="mr-1" /> Geri
        </button>
        <h1 className="text-2xl font-extrabold">Hesap Bilgileri ✏️</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Kişisel bilgilerinizi güncelleyin.</p>
      </motion.div>

      {/* AVATAR */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center">
        <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFotoSec} />
        <div className="relative group cursor-pointer" onClick={() => fotoRef.current?.click()}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent-main)] to-emerald-800 p-0.5 shadow-lg">
            <div className="w-full h-full bg-[var(--bg-secondary)] rounded-full overflow-hidden flex items-center justify-center">
              {fotoYukleniyor ? (
                <Loader2 size={24} className="animate-spin text-[var(--accent-main)]" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-extrabold text-[var(--accent-main)]">
                  {(form.adSoyad || user.email || "K").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={24} />
          </div>
        </div>
        <span className="text-xs text-[var(--accent-main)] font-semibold mt-3">Fotoğraf Değiştir</span>
        <p className="text-[10px] text-[var(--text-secondary)] mt-1">{user.email}</p>
      </motion.div>

      {/* FORM */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">Ad Soyad</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input type="text" value={form.adSoyad} onChange={e => setForm({...form, adSoyad: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">E-Posta</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input type="email" value={user.email || ""} disabled
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl py-3 pl-11 pr-4 opacity-60 cursor-not-allowed" />
              </div>
              <p className="text-[10px] text-amber-500 mt-1 ml-1">E-posta değişikliği için destek ile iletişime geçin.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">Telefon</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input type="tel" value={form.telefon} onChange={e => setForm({...form, telefon: e.target.value})} placeholder="5XX XXX XX XX"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">Teslimat Adresi</label>
              <textarea value={form.adres} onChange={e => setForm({...form, adres: e.target.value})}
                rows={2} placeholder="Mahalle, sokak, bina no..."
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-main)] resize-none transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={kaydediliyor}
            className={`w-full py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-md ${basarili ? "bg-emerald-500 text-white" : "bg-[var(--accent-main)] hover:bg-emerald-600 text-white"}`}>
            {kaydediliyor ? <><Loader2 size={18} className="animate-spin" /> Kaydediliyor...</>
            : basarili ? <><CheckCircle2 size={18} /> Kaydedildi!</>
            : <><ChevronRight size={18} /> Değişiklikleri Kaydet</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
