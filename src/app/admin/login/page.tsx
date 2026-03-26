"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, ChevronRight, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ kadi: "", sifre: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.kadi === "admin" && formData.sifre === "admin123") {
      router.push("/admin/dashboard");
    } else {
      alert("Hatalı Giriş!");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-900 pb-20 px-4 overflow-hidden">
      
      {/* Premium Arkaplan Efektleri */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-slate-800/50 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-2">
              <ShieldAlert size={32} />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-widest">ADMIN PANELİ</h1>
            <p className="text-xs text-slate-400 mt-2 font-medium">Sisteme giriş yapmak için yetkili bilgilerinizi giriniz.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Yönetici Kullanıcı Adı"
                value={formData.kadi}
                onChange={(e) => setFormData({ ...formData, kadi: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500 focus:bg-slate-900 transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Yönetici Şifresi"
                value={formData.sifre}
                onChange={(e) => setFormData({ ...formData, sifre: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500 focus:bg-slate-900 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 group bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
            >
              Yetkili Girişi <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <p className="text-center text-[10px] text-slate-500 mt-6 font-medium">
            KurbanApp Yönetim Ekosistemi v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
