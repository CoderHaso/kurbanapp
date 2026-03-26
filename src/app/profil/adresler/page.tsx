"use client";

import { motion } from "framer-motion";
import { Plus, MapPin, Edit2, Trash2, Home, Briefcase } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AdreslerPage() {
  const [adresler, setAdresler] = useState([
    {
      id: 1,
      baslik: "Ev Adresi",
      isim: "Efe Han",
      tel: "555 123 4567",
      adres: "Mevlana Mah. Selçuklu Cad. No: 42 D: 1",
      il_ilce: "Selçuklu / Konya",
      tip: "ev"
    },
    {
      id: 2,
      baslik: "İş Adresi",
      isim: "Efe Han",
      tel: "555 123 4567",
      adres: "Sanayi Bölgesi, Organize Sanayi Sok. No: 15",
      il_ilce: "Karatay / Konya",
      tip: "is"
    }
  ]);

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 max-w-2xl mx-auto">
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Adreslerim 📍</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kayıtlı teslimat ve fatura adresleriniz.</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Adres Listesi */}
        {adresler.map((adres) => (
          <div key={adres.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm relative group overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${adres.tip === 'ev' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {adres.tip === 'ev' ? <Home size={18} /> : <Briefcase size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">{adres.baslik}</h3>
                  <p className="text-[10px] text-[var(--text-secondary)]">{adres.isim} · {adres.tel}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-main)] hover:bg-[var(--bg-primary)] rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3">
              {adres.adres}
              <br />
              <span className="font-semibold text-[var(--text-primary)]">{adres.il_ilce}</span>
            </p>
            
            {/* Alt Şerit (Seçili Yap vb.) */}
            <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                <MapPin size={12} /> Teslimat için uygun
              </span>
            </div>
          </div>
        ))}

        {/* Yeni Adres Ekle */}
        <button className="w-full py-4 rounded-xl border-2 border-dashed border-[var(--border-color)] text-[var(--text-secondary)] font-bold text-sm hover:text-[var(--accent-main)] hover:border-[var(--accent-main)] hover:bg-[var(--accent-main)]/5 transition-colors flex items-center justify-center gap-2">
          <Plus size={18} /> Yeni Adres Ekle
        </button>
      </motion.div>
    </div>
  );
}
