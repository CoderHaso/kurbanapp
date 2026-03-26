"use client";

import { motion } from "framer-motion";
import { ShieldAlert, KeyRound, Save, Lock } from "lucide-react";
import { useState } from "react";

export default function GuvenlikPage() {
  const [sifre, setSifre] = useState({ mevcut: "", yeni: "", tekrar: "" });

  const handleSifreChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Şifre Değiştirme Başarılı!");
  };

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 max-w-2xl mx-auto">
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Güvenlik ve Şifre 🔒</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Hesap güvenliğinizi sağlayın ve giriş şifrenizi güncelleyin.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm mb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-1">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">Hesabınız Güvende</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Şifreniz en son 2 ay önce değiştirildi. Daha fazla güvenlik için şifrenizi düzenli aralıklarla değiştirmenizi tavsiye ederiz.</p>
          </div>
        </div>

        <form onSubmit={handleSifreChange} className="space-y-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">
                Mevcut Şifre
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="password"
                  value={sifre.mevcut}
                  onChange={(e) => setSifre({...sifre, mevcut: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-4 mt-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">
                Yeni Şifre
              </label>
              <div className="relative mb-3">
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-main)]" />
                <input
                  type="password"
                  value={sifre.yeni}
                  onChange={(e) => setSifre({...sifre, yeni: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-colors"
                />
              </div>

              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-main)]" />
                <input
                  type="password"
                  value={sifre.tekrar}
                  onChange={(e) => setSifre({...sifre, tekrar: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] transition-colors"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-[var(--accent-main)] hover:bg-emerald-600 text-white font-bold transition-all shadow-md flex justify-center items-center gap-2"
          >
            <Save size={18} /> Şifreyi Güncelle
          </button>
        </form>

      </motion.div>
    </div>
  );
}
