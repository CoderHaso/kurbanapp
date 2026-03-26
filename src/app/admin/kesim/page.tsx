"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wifi, Video, CheckCheck, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Hayvan = {
  id: number;
  kupe: string;
  tur: string;
  cins: string;
  konum: string;
  aktif: boolean;
  canli_yayin: boolean;
  yayin_url: string;
  dolu_hisse: number;
  hisse_sayisi: number;
};

const DURUM_ADIMLAR = [
  { id: "onay_bekliyor", label: "Onay Bekliyor" },
  { id: "odeme_bekleniyor", label: "Ödeme Bekleniyor" },
  { id: "aktif", label: "Aktif / Bekleniyor" },
  { id: "kesiliyor", label: "Kesim Günü 🔪" },
  { id: "hazir", label: "Hazırlanıyor / Paketleniyor" },
  { id: "teslim_edildi", label: "Teslim Edildi ✅" },
];

export default function KesimYonetimPage() {
  const router = useRouter();
  const [hayvanlar, setHayvanlar] = useState<Hayvan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliHayvan, setSeciliHayvan] = useState<Hayvan | null>(null);
  const [yayinUrl, setYayinUrl] = useState("");
  const [toastMesaj, setToastMesaj] = useState<string | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [basarili, setBasarili] = useState(false);

  const showToast = (msg: string) => {
    setToastMesaj(msg);
    setTimeout(() => setToastMesaj(null), 3000);
  };

  async function fetchHayvanlar() {
    setYukleniyor(true);
    const { data } = await supabase
      .from("hayvanlar")
      .select("id, kupe, tur, cins, konum, aktif, canli_yayin, yayin_url, dolu_hisse, hisse_sayisi")
      .order("id", { ascending: true });
    setHayvanlar(data || []);
    setYukleniyor(false);
  }

  useEffect(() => { fetchHayvanlar(); }, []);

  const handleHayvanSec = (h: Hayvan) => {
    setSeciliHayvan(h);
    setYayinUrl(h.yayin_url || "");
    setBasarili(false);
  };

  const handleKaydet = async () => {
    if (!seciliHayvan) return;
    setKaydediliyor(true);
    const { error } = await supabase
      .from("hayvanlar")
      .update({
        yayin_url: yayinUrl,
        canli_yayin: yayinUrl.trim() !== "",
      })
      .eq("id", seciliHayvan.id);

    if (!error) {
      setBasarili(true);
      // Listeyi güncelle
      setHayvanlar((prev) =>
        prev.map((h) =>
          h.id === seciliHayvan.id
            ? { ...h, yayin_url: yayinUrl, canli_yayin: yayinUrl.trim() !== "" }
            : h
        )
      );
      setSeciliHayvan((prev) => prev ? { ...prev, yayin_url: yayinUrl, canli_yayin: yayinUrl.trim() !== "" } : prev);
    }
    setKaydediliyor(false);
  };

  const handleSiparisDurumGuncelle = async (hayvanId: number, yeniDurum: string) => {
    // Hayvanın tüm siparişlerini yeni duruma güncelle
    const { error } = await supabase
      .from("siparisler")
      .update({ durum: yeniDurum })
      .eq("hayvan_id", hayvanId);
    if (!error) {
      showToast(`✅ "${DURUM_ADIMLAR.find(d => d.id === yeniDurum)?.label}" olarak güncellendi!`);
    } else {
      showToast("❌ Güncelleme hatası: " + error.message);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-24 px-4 max-w-4xl mx-auto">
      {/* TOAST */}
      {toastMesaj && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
          {toastMesaj}
        </div>
      )}
      {/* ÜST BAR */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="p-2 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wider">Kesim Yönetimi 🔪</h1>
          <p className="text-[10px] text-[var(--text-secondary)] font-medium">Canlı yayın linki güncelle · Sipariş durumu değiştir</p>
        </div>
        <button onClick={fetchHayvanlar} className="p-2 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOL: HAYVAN LİSTESİ */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">Sistemdeki Hayvanlar</h2>
          {yukleniyor ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[var(--accent-main)]" />
            </div>
          ) : hayvanlar.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <p className="text-4xl mb-2">🐄</p>
              <p className="text-sm font-medium">Sistemde kayıtlı hayvan yok.</p>
              <p className="text-xs mt-1">Önce ilan ekle bölümünden hayvan ekleyin.</p>
            </div>
          ) : (
            hayvanlar.map((h) => (
              <button
                key={h.id}
                onClick={() => handleHayvanSec(h)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  seciliHayvan?.id === h.id
                    ? "border-[var(--accent-main)] bg-[var(--accent-main)]/5 shadow-sm"
                    : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-main)]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg mr-2">{h.tur === "Dana" || h.tur === "İnek" || h.tur === "Düve" ? "🐄" : "🐑"}</span>
                    <span className="font-bold text-sm text-[var(--text-primary)]">{h.cins} {h.tur}</span>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 ml-7">Küpe: {h.kupe} · {h.konum}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] ml-7">
                      Hisse: {h.dolu_hisse}/{h.hisse_sayisi}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {h.canli_yayin && (
                      <span className="text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> CANLI
                      </span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${h.aktif ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"}`}>
                      {h.aktif ? "Aktif" : "Kapandı"}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* SAĞ: DÜZENLEME PANELİ */}
        <div>
          <AnimatePresence mode="wait">
            {!seciliHayvan ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl"
              >
                <Video size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">Sol taraftan bir hayvan seçin</p>
                <p className="text-xs mt-1 opacity-60">Canlı yayın ve kesim güncellemesi yapabilirsiniz</p>
              </motion.div>
            ) : (
              <motion.div
                key={seciliHayvan.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Seçili Hayvan Başlığı */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Seçili Hayvan</p>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                    {seciliHayvan.cins} {seciliHayvan.tur}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">{seciliHayvan.kupe} · {seciliHayvan.konum}</p>
                </div>

                {/* CANLI YAYIN LİNKİ GÜNCELLEME */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-2 border-b border-[var(--border-color)] flex items-center gap-2">
                    <Wifi size={14} className="text-red-500" /> Canlı Yayın Linki
                  </h2>
                  <div className="relative">
                    <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="url"
                      value={yayinUrl}
                      onChange={(e) => { setYayinUrl(e.target.value); setBasarili(false); }}
                      placeholder="https://youtube.com/live/... veya boş bırak"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    Boş bırakırsan "Canlı Yayın" rozeti kaldırılır. Dolu ise otomatik aktif görünür.
                  </p>
                  <button
                    onClick={handleKaydet}
                    disabled={kaydediliyor || basarili}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      basarili
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                        : "bg-[var(--accent-main)] hover:bg-emerald-600 text-white"
                    }`}
                  >
                    {kaydediliyor ? <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</> :
                     basarili ? <><CheckCheck size={16} /> Kaydedildi!</> :
                     "Yayın Linkini Güncelle"}
                  </button>
                </div>

                {/* Toplu güncelleme İlan Yönetimi sayfasına taşındı */}
                <div className="bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] rounded-2xl p-4 text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Sipariş durum güncellemeleri için</p>
                  <button onClick={() => router.push('/admin/ilanlar')} className="mt-2 text-xs font-bold text-[var(--accent-main)]">
                    → İlan Yönetimi sayfasını kullan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
