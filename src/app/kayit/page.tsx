"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Lock, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function KayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({ adSoyad: "", email: "", telefon: "", sifre: "" });
  const [hata, setHata] = useState<string | null>(null);
  const [basarili, setBasarili] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);
    if (form.sifre.length < 6) { setHata("Şifre en az 6 karakter olmalıdır."); return; }
    setYukleniyor(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.sifre,
      options: {
        data: {
          ad_soyad: form.adSoyad,
          telefon: form.telefon,
        }
      }
    });

    if (error) {
      setHata(error.message === "User already registered" ? "Bu e-posta adresi zaten kayıtlı." : error.message);
    } else if (data.user) {
      // Profili de kaydet
      await supabase.from("profiller").upsert({
        id: data.user.id,
        ad_soyad: form.adSoyad,
        telefon: form.telefon,
      });
      setBasarili(true);
      setTimeout(() => router.push("/profil"), 2000);
    }
    setYukleniyor(false);
  };

  if (basarili) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Hesabınız Oluşturuldu!</h2>
          <p className="text-white/50 text-sm">Profil sayfasına yönlendiriliyorsunuz...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[var(--accent-main)]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo-600/20 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10 my-10"
      >
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 border border-white/10">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-main)] flex items-center justify-center text-white font-bold text-sm">K</div>
          <div className="w-10" />
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-white mb-2">Aramıza Katılın 🤝</h1>
            <p className="text-sm text-white/50">Hesabınızı oluşturun, hisse alımınızı garantileyin.</p>
          </div>

          {hata && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {hata}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5 ml-1">Ad Soyad</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="text" placeholder="Efe Han" required value={form.adSoyad} onChange={e => setForm({...form, adSoyad: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-all placeholder:text-white/20" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5 ml-1">E-posta</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="email" placeholder="ornek@email.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-all placeholder:text-white/20" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5 ml-1">Telefon</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="tel" placeholder="5XX XXX XX XX" required value={form.telefon} onChange={e => setForm({...form, telefon: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-all placeholder:text-white/20" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5 ml-1">Şifre</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="password" placeholder="En az 6 karakter" required value={form.sifre} onChange={e => setForm({...form, sifre: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-all placeholder:text-white/20" />
              </div>
            </div>

            <button type="submit" disabled={yukleniyor}
              className="w-full mt-6 py-4 rounded-2xl bg-[var(--accent-main)] hover:bg-emerald-600 text-white font-bold transition-all flex justify-center items-center gap-2 group disabled:opacity-70">
              {yukleniyor ? "Hesap oluşturuluyor..." : <>Hesap Oluştur <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="text-white font-bold hover:text-[var(--accent-main)] underline underline-offset-4">Giriş Yap</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
