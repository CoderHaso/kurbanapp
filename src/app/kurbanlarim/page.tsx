"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronRight, Clock, CheckCircle2, Truck, MonitorPlay, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

type Siparis = {
  id: string;
  durum: string;
  fiyat: number;
  created_at: string;
  hisse_no: number | null;
  hayvan_id: number;
  red_sebebi: string | null;
  hayvanlar: {
    tip: string; tur: string; cins: string; kupe: string;
    kesim_tarihi: string | null; teslim_tarihi: string | null;
    yayin_url: string | null;
  } | null;
};

const DURUM_MAP: Record<string, { metin: string; renk: string; ilerleme: number }> = {
  onay_bekliyor:    { metin: "Onay Bekliyor", renk: "text-amber-500 bg-amber-500/10", ilerleme: 10 },
  odeme_bekleniyor: { metin: "Ödeme Bekleniyor", renk: "text-orange-500 bg-orange-500/10", ilerleme: 20 },
  aktif:            { metin: "Sıra Bekleniyor", renk: "text-blue-500 bg-blue-500/10", ilerleme: 40 },
  kesiliyor:        { metin: "Kesim Günü 🔪", renk: "text-red-500 bg-red-500/10 animate-pulse", ilerleme: 65 },
  hazir:            { metin: "Teslimata Hazır", renk: "text-purple-500 bg-purple-500/10", ilerleme: 85 },
  teslim_edildi:    { metin: "Teslim Edildi ✅", renk: "text-slate-500 bg-slate-500/10", ilerleme: 100 },
  reddedildi:       { metin: "Reddedildi ❌", renk: "text-red-600 bg-red-500/10", ilerleme: 0 },
};

export default function KurbanlarimPage() {
  const router = useRouter();
  const { user, yukleniyor: authYukleniyor } = useAuth();
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");

  useEffect(() => {
    if (authYukleniyor) return;
    if (!user) { setYukleniyor(false); return; }

    supabase.from("siparisler")
      .select("id, durum, fiyat, created_at, hisse_no, hayvan_id, red_sebebi, hayvanlar(tip, tur, cins, kupe, kesim_tarihi, teslim_tarihi, yayin_url)")
      .eq("kullanici_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSiparisler((data as unknown as Siparis[]) || []);
        setYukleniyor(false);
      });
  }, [user, authYukleniyor]);

  if (!authYukleniyor && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">🐄</p>
          <h2 className="font-bold text-lg mb-2">Kurbanlarınızı Görmek İçin</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Giriş yaparak sipariş geçmişinizi görüntüleyin.</p>
          <button onClick={() => router.push("/giris")} className="w-full py-3 rounded-2xl bg-[var(--accent-main)] text-white font-bold">Giriş Yap</button>
        </div>
      </div>
    );
  }

  const filtreliSiparisler = siparisler.filter(s =>
    arama === "" ||
    s.hayvanlar?.tur?.toLowerCase().includes(arama.toLowerCase()) ||
    s.hayvanlar?.cins?.toLowerCase().includes(arama.toLowerCase()) ||
    s.hayvanlar?.kupe?.toLowerCase().includes(arama.toLowerCase()) ||
    s.id.toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mt-4 mb-6">
          <h1 className="text-2xl font-extrabold">Kurbanlarım 🐄</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Tüm hisse ve sipariş geçmişiniz</p>
        </div>

        {/* Arama */}
        <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-4 gap-2 mb-6 shadow-sm">
          <Search size={18} className="text-[var(--text-secondary)] shrink-0" />
          <input type="text" placeholder="Sipariş ara..." value={arama} onChange={e => setArama(e.target.value)}
            className="flex-1 bg-transparent py-3.5 text-sm focus:outline-none placeholder:text-[var(--text-secondary)]" />
        </div>

        {yukleniyor ? (
          <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-[var(--accent-main)]" /></div>
        ) : filtreliSiparisler.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-secondary)]">
            <span className="text-5xl mb-4">📦</span>
            <p className="font-medium">Henüz siparişiniz yok.</p>
            <button onClick={() => router.push("/")} className="mt-4 text-[var(--accent-main)] font-semibold text-sm">Kurban Listesine Git</button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtreliSiparisler.map((sip, i) => {
              const durumInfo = DURUM_MAP[sip.durum] || DURUM_MAP.aktif;
              return (
                <motion.div key={sip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/kurbanlarim/${sip.id}`}>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm hover:border-[var(--accent-main)]/40 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${sip.hayvanlar?.tip === "Büyükbaş" ? "bg-amber-500/10" : "bg-sky-500/10"}`}>
                            {sip.hayvanlar?.tip === "Büyükbaş" ? "🐄" : "🐑"}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">{sip.hayvanlar?.cins}</p>
                            <h3 className="font-extrabold text-base leading-tight">{sip.hayvanlar?.tur}</h3>
                            {sip.hisse_no && <p className="text-[10px] text-[var(--text-secondary)]">Hisse #{sip.hisse_no}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[var(--accent-main)]">{sip.fiyat?.toLocaleString("tr-TR")} ₺</p>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{sip.hayvanlar?.kupe}</p>
                        </div>
                      </div>

                      {/* Reddedildi özel görünümü */}
                      {sip.durum === "reddedildi" ? (
                        <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-[10px] font-bold text-red-500 mb-1">❌ Siparişiniz reddedildi</p>
                          {sip.red_sebebi && <p className="text-[10px] text-red-400">{sip.red_sebebi}</p>}
                        </div>
                      ) : (
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] font-bold mb-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] ${durumInfo.renk}`}>{durumInfo.metin}</span>
                            <span className="text-[var(--text-secondary)]">%{durumInfo.ilerleme}</span>
                          </div>
                          <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--accent-main)] rounded-full transition-all" style={{ width: `${durumInfo.ilerleme}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                        <span>{sip.hayvanlar?.kesim_tarihi ? `Kesim: ${new Date(sip.hayvanlar.kesim_tarihi).toLocaleDateString("tr-TR")}` : "Tarih belirtilmemiş"}</span>
                        <ChevronRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-main)] transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
