"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MonitorPlay, Activity, ShoppingBag, CheckCircle2, Utensils, Loader2, ExternalLink, Package, Gift } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

type SiparisDetay = {
  id: string;
  durum: string;
  fiyat: number;
  created_at: string;
  hisse_no: number | null;
  sakatat_tercihi: Record<string, string>;
  odeme_yontemi: string;
  hayvan_id: number;
  hayvanlar: {
    tip: string; tur: string; cins: string; kupe: string;
    kesim_tarihi: string | null; paketleme_tarihi: string | null;
    kargo_tarihi: string | null; teslim_tarihi: string | null;
    kargo_takip_no: string | null; kargo_firma: string | null;
    yayin_url: string | null; konum: string;
    foto_urls: string[];
  } | null;
};

const ADIMLAR = [
  { label: "Sipariş Oluşturuldu", durum: ["onay_bekliyor","odeme_bekleniyor","aktif","kesiliyor","hazir","teslim_edildi"], icon: CheckCircle2 },
  { label: "Onaylandı / Aktif", durum: ["aktif","kesiliyor","hazir","teslim_edildi"], icon: CheckCircle2 },
  { label: "Kesim Günü 🔪", durum: ["kesiliyor","hazir","teslim_edildi"], icon: MonitorPlay },
  { label: "Paketleniyor", durum: ["hazir","teslim_edildi"], icon: Package },
  { label: "Kargoya Verildi", durum: ["teslim_edildi"], icon: Activity },
  { label: "Teslim Edildi ✅", durum: ["teslim_edildi"], icon: ShoppingBag },
];

const SAKATAT_ADLARI: Record<string, string> = {
  kelle: "Kelle", paca: "Paça", ciger: "Ciğer & Dalak", iskembe: "İşkembe", bagirsak: "Bağırsaklar"
};

export default function SiparisDetayPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [siparis, setSiparis] = useState<SiparisDetay | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [sakatat, setSakatat] = useState<Record<string, string>>({
    kelle: "bagis", paca: "bagis", ciger: "bagis", iskembe: "bagis", bagirsak: "bagis"
  });
  const [sakatatKaydediliyor, setSakatatKaydediliyor] = useState(false);
  const [sakatatKaydedildi, setSakatatKaydedildi] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("siparisler")
      .select("id, durum, fiyat, created_at, hisse_no, sakatat_tercihi, odeme_yontemi, hayvan_id, hayvanlar(tip, tur, cins, kupe, kesim_tarihi, paketleme_tarihi, kargo_tarihi, teslim_tarihi, kargo_takip_no, kargo_firma, yayin_url, konum, foto_urls)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          // Supabase join tipini düzelt
          const d = data as unknown as SiparisDetay;
          setSiparis(d);
          if (d.sakatat_tercihi) setSakatat(d.sakatat_tercihi as Record<string, string>);
        }
        setYukleniyor(false);
      });
  }, [id]);

  const handleSakatatKaydet = async () => {
    if (!siparis) return;
    setSakatatKaydediliyor(true);
    await supabase.from("siparisler").update({ sakatat_tercihi: sakatat }).eq("id", siparis.id);
    setSakatatKaydedildi(true);
    setSakatatKaydediliyor(false);
    setTimeout(() => setSakatatKaydedildi(false), 3000);
  };

  const formatTarih = (tarih: string | null) => tarih ? new Date(tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "";

  if (yukleniyor) return <div className="flex justify-center pt-32"><Loader2 size={32} className="animate-spin text-[var(--accent-main)]" /></div>;
  if (!siparis) return <div className="text-center pt-32 text-[var(--text-secondary)]">Sipariş bulunamadı.</div>;

  const h = siparis.hayvanlar;
  const kesimGeldi = ["kesiliyor", "hazir", "teslim_edildi"].includes(siparis.durum);

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button onClick={() => router.back()} className="flex items-center text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
          <ArrowLeft size={16} className="mr-1" /> Kurbanlarıma Dön
        </button>
        <h1 className="text-2xl font-extrabold">Sipariş Detayı</h1>
        <p className="text-sm font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 mt-2">
          #{siparis.id.slice(0, 8).toUpperCase()}
          {siparis.hisse_no && <span className="text-amber-400"> · Hisse #{siparis.hisse_no}</span>}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">

        {/* HAYVAN KARTI */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-3xl shrink-0">
              {h?.tip === "Büyükbaş" ? "🐄" : "🐑"}
            </div>
            <div>
              <h3 className="font-extrabold text-xl">{h?.tur}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{h?.cins} · {h?.kupe}</p>
              <p className="text-sm font-bold text-[var(--accent-main)] mt-1">{siparis.fiyat?.toLocaleString("tr-TR")} ₺</p>
            </div>
          </div>

          {/* Tarih bilgileri */}
          {(h?.kesim_tarihi || h?.teslim_tarihi) && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {h.kesim_tarihi && (
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1">Kesim</p>
                  <p className="font-bold text-sm text-red-500">{formatTarih(h.kesim_tarihi)}</p>
                </div>
              )}
              {h.teslim_tarihi && (
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1">Teslim</p>
                  <p className="font-bold text-sm text-emerald-500">{formatTarih(h.teslim_tarihi)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CANLI YAYIN BUTONU */}
        {h?.yayin_url && (
          <a href={h.yayin_url} target="_blank" rel="noopener noreferrer"
            className="w-full relative overflow-hidden bg-red-600 hover:bg-red-700 text-white rounded-2xl p-5 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all flex items-center justify-between group border border-red-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MonitorPlay size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">CANLI YAYIN'A BAĞLAN</h3>
                <p className="text-[10px] text-white/80 uppercase">Kesim anını canlı izleyin</p>
              </div>
            </div>
            <ExternalLink size={20} className="opacity-60" />
          </a>
        )}

        {/* KARGO BİLGİSİ */}
        {h?.kargo_takip_no && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-500">Kargo Takibi</h2>
            </div>
            <p className="text-sm font-bold">{h.kargo_firma}</p>
            <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">{h.kargo_takip_no}</p>
            {h.kargo_tarihi && <p className="text-[10px] text-[var(--text-secondary)] mt-1">Kargoya verildi: {formatTarih(h.kargo_tarihi)}</p>}
          </div>
        )}

        {/* BAĞIŞ BÜTÜNLEŞİK GÖSTER */}
        {siparis.durum === "teslim_edildi" && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={16} className="text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">Bağış Bilgileri</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Bağışkaldığınız sakatat kısımları ihtiyaç sahiplerine dağıtılmıştır. Hayırlı olsun! 🤲
            </p>
          </div>
        )}

        {/* DURUM ZEKİ TİMELINE */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-5">Sipariş Süreci</h2>
          <div className="pl-2 border-l-2 border-[var(--bg-primary)] space-y-5 ml-3">
            {ADIMLAR.map((adim, i) => {
              const tamam = adim.durum.includes(siparis.durum);
              const aktif = i > 0 && ADIMLAR[i - 1].durum.includes(siparis.durum) && !adim.durum.includes(siparis.durum);
              const Icon = adim.icon;
              return (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full z-10 flex items-center justify-center ${tamam ? "bg-[var(--accent-main)]" : aktif ? "bg-blue-500 animate-pulse ring-4 ring-blue-500/20" : "bg-[var(--border-color)]"}`}>
                    {tamam && <Icon size={10} className="text-white" />}
                  </div>
                  <p className={`text-sm font-bold ${tamam ? "text-[var(--text-primary)]" : aktif ? "text-blue-500" : "text-[var(--text-secondary)]"}`}>{adim.label}</p>
                  {adim.durum[0] === "kesiliyor" && h?.kesim_tarihi && (
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{formatTarih(h.kesim_tarihi)}</p>
                  )}
                  {adim.durum[0] === "hazir" && h?.paketleme_tarihi && (
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{formatTarih(h.paketleme_tarihi)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SAKATAT TERCİHLERİ */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
            <Utensils className="text-amber-500" size={16} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Sakatat Tercihleri</h2>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">
            Sakatatların durumunu belirleyin. <strong className="text-amber-500">Kesim başlayınca değiştirilemez.</strong>
          </p>
          <div className="space-y-2">
            {Object.entries(SAKATAT_ADLARI).map(([key, ad]) => (
              <div key={key} className="flex justify-between items-center bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)]">
                <span className="font-semibold text-xs">{ad}</span>
                <div className="flex bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] overflow-hidden text-[10px] font-bold">
                  <button onClick={() => setSakatat({...sakatat, [key]: "bagis"})} disabled={kesimGeldi}
                    className={`px-3 py-1.5 border-r border-[var(--border-color)] transition-colors ${sakatat[key] === "bagis" ? "bg-amber-500 text-white" : "text-[var(--text-secondary)]"}`}>
                    Bağışla
                  </button>
                  <button onClick={() => setSakatat({...sakatat, [key]: "istiyorum"})} disabled={kesimGeldi}
                    className={`px-3 py-1.5 transition-colors ${sakatat[key] === "istiyorum" ? "bg-green-500 text-white" : "text-[var(--text-secondary)]"}`}>
                    İstiyorum
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!kesimGeldi && (
            <button onClick={handleSakatatKaydet} disabled={sakatatKaydediliyor}
              className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 ${sakatatKaydedildi ? "bg-emerald-500" : "bg-slate-800 dark:bg-slate-700 hover:bg-black"}`}>
              {sakatatKaydediliyor ? <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</>
              : sakatatKaydedildi ? <><CheckCircle2 size={16} /> Kaydedildi!</>
              : "Tercihleri Kaydet"}
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
