"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, ChevronRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);
    setYukleniyor(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: sifre });
    if (error) {
      setHata("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
    } else {
      router.push("/profil");
    }
    setYukleniyor(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--accent-main)]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-emerald-600/20 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm z-10"
      >
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10 backdrop-blur-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-main)] flex items-center justify-center text-white font-bold text-sm">K</div>
          <div className="w-10" />
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-white mb-2">Hoş Geldiniz 👋</h1>
            <p className="text-sm text-white/50">Hisselerinizi takip etmek için giriş yapın.</p>
          </div>

          {hata && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {hata}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5 ml-1">E-posta</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Şifre</label>
                <Link href="#" className="text-xs text-[var(--accent-main)] font-semibold">Şifremi Unuttum</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={yukleniyor}
              className="w-full mt-6 py-4 rounded-2xl bg-[var(--accent-main)] hover:bg-emerald-600 text-white font-bold transition-all shadow-lg flex justify-center items-center gap-2 group disabled:opacity-70"
            >
              {yukleniyor ? "Giriş yapılıyor..." : <>Giriş Yap <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            Hesabınız yok mu?{" "}
            <Link href="/kayit" className="text-white font-bold hover:text-[var(--accent-main)] transition-colors underline underline-offset-4">
              Hemen Kayıt Ol
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
