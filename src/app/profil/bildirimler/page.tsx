"use client";

import { motion } from "framer-motion";
import { Bell, MessageSquare, Mail, Smartphone, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function BildirimlerPage() {
  const [ayarlar, setAyarlar] = useState({
    sms_kampanya: false,
    sms_siparis: true,
    eposta_bilgi: true,
    whatsapp_siparis: true,
    push_bildirim: true
  });

  const toggleAyar = (key: keyof typeof ayarlar) => {
    setAyarlar(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Switch = ({ isOn, onClick }: { isOn: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isOn ? 'bg-[var(--accent-main)]' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 max-w-2xl mx-auto">
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Bildirim Ayarları 🔔</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Sipariş süreci ve kampanyalarla ilgili iletişim tercihlerinizi belirleyin.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Sipariş Takip Bildirimleri */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <Smartphone size={14} /> Sipariş Bildirimleri
          </h2>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">WhatsApp Bildirimleri</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Kesim anı ve video linki WhatsApp üzerinden gelsin.</p>
              </div>
            </div>
            <Switch isOn={ayarlar.whatsapp_siparis} onClick={() => toggleAyar('whatsapp_siparis')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Smartphone size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">SMS Bildirimleri</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Sipariş süreciyle ilgili anlık SMS al.</p>
              </div>
            </div>
            <Switch isOn={ayarlar.sms_siparis} onClick={() => toggleAyar('sms_siparis')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Bell size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">Anlık Bildirim (Push)</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Uygulama üzerinden bildirim gönder.</p>
              </div>
            </div>
            <Switch isOn={ayarlar.push_bildirim} onClick={() => toggleAyar('push_bildirim')} />
          </div>
        </div>

        {/* Kampanya Bildirimleri */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-5 mt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <ShieldAlert size={14} /> Kampanyalar & Haberler
          </h2>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center shrink-0">
                <Smartphone size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">SMS İzni</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Kampanya ve indirimlerden SMS ile haberdar et.</p>
              </div>
            </div>
            <Switch isOn={ayarlar.sms_kampanya} onClick={() => toggleAyar('sms_kampanya')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">E-Posta Bülteni</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Bülten ve kampanya mailleri gönderilsin.</p>
              </div>
            </div>
            <Switch isOn={ayarlar.eposta_bilgi} onClick={() => toggleAyar('eposta_bilgi')} />
          </div>
        </div>

      </motion.div>
    </div>
  );
}
