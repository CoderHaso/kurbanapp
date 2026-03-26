"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, ShieldCheck, Users, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Hayvan = {
  id: number;
  tip: string;
  cins: string;
  tur: string;
  kilo: number;
  fiyat: number;
  hisse_sayisi: number;
  dolu_hisse: number;
  canli_yayin: boolean;
  helal: boolean;
  konum: string;
  kupe: string;
};

const KATEGORILER = ["Tümü", "Büyükbaş", "Küçükbaş", "Canlı Yayınlılar", "Hissesi Açık"];
const HAYVAN_TURLERI = ["Tümü", "Dana", "İnek", "Düve", "Koç", "Koyun", "Keçi", "Kuzu"];

export default function Kesfet() {
  const [aramaMetni, setAramaMetni] = useState("");
  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [aktifTür, setAktifTür] = useState("Tümü");
  const [filtrePanelAcik, setFiltrePanelAcik] = useState(false);
  const [maxFiyat, setMaxFiyat] = useState(200000);
  const [sadeceCanlı, setSadeceCanlı] = useState(false);
  const [sadeceHisseli, setSadeceHisseli] = useState(false);
  const [hayvanlar, setHayvanlar] = useState<Hayvan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHayvanlar() {
      setYukleniyor(true);
      const { data, error } = await supabase
        .from("hayvanlar")
        .select("id, tip, cins, tur, kilo, fiyat, hisse_sayisi, dolu_hisse, canli_yayin, helal, konum, kupe")
        .eq("aktif", true)
        .order("created_at", { ascending: false });
      if (error) {
        setHata(error.message);
      } else {
        setHayvanlar(data || []);
      }
      setYukleniyor(false);
    }
    fetchHayvanlar();
  }, []);

  const filtrelenmis = hayvanlar.filter((h) => {
    const aramaUyumu =
      aramaMetni === "" ||
      h.cins.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      h.tur.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      h.konum.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      h.kupe.toLowerCase().includes(aramaMetni.toLowerCase());

    const kategoriUyumu =
      aktifKategori === "Tümü" ||
      (aktifKategori === "Büyükbaş" && h.tip === "Büyükbaş") ||
      (aktifKategori === "Küçükbaş" && h.tip === "Küçükbaş") ||
      (aktifKategori === "Canlı Yayınlılar" && h.canli_yayin) ||
      (aktifKategori === "Hissesi Açık" && h.dolu_hisse < h.hisse_sayisi);

    const türUyumu = aktifTür === "Tümü" || h.tur === aktifTür;
    const fiyatUyumu = h.fiyat <= maxFiyat;
    const canliUyumu = !sadeceCanlı || h.canli_yayin;
    const hisseUyumu = !sadeceHisseli || h.dolu_hisse < h.hisse_sayisi;

    return aramaUyumu && kategoriUyumu && türUyumu && fiyatUyumu && canliUyumu && hisseUyumu;
  });

  const aktifFiltreSayisi = [
    aktifTür !== "Tümü",
    maxFiyat < 200000,
    sadeceCanlı,
    sadeceHisseli,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-7xl mx-auto px-4 pt-20">
        {/* 🔍 ARAMA ÇUBUĞU */}
        <div className="flex gap-2 mt-4 mb-4">
          <div className="flex-1 flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-4 gap-2 shadow-sm">
            <Search size={18} className="text-[var(--text-secondary)] flex-shrink-0" />
            <input
              type="text"
              placeholder="Küpe No, Cins, Şehir..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="flex-1 bg-transparent py-3.5 text-sm text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]"
            />
            {aramaMetni && (
              <button onClick={() => setAramaMetni("")}>
                <X size={16} className="text-[var(--text-secondary)]" />
              </button>
            )}
          </div>
          {/* Filtre Butonu */}
          <button
            onClick={() => setFiltrePanelAcik(true)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl border font-medium text-sm transition-all ${
              aktifFiltreSayisi > 0
                ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white"
                : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]"
            }`}
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Filtrele</span>
            {aktifFiltreSayisi > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {aktifFiltreSayisi}
              </span>
            )}
          </button>
        </div>

        {/* 🏷️ KATEGORİ SEKME ÇUBUĞU */}
        <section className="mb-5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2">
            {KATEGORILER.map((cat) => (
              <button
                key={cat}
                onClick={() => setAktifKategori(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  aktifKategori === cat
                    ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-main)]/25"
                    : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-main)]/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* 📊 SONUÇ ÖZETI */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">{filtrelenmis.length}</span> ilan bulundu
          </p>
          <select className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[var(--text-secondary)]">
            <option>En Yeni</option>
            <option>Fiyat (Düşük → Yüksek)</option>
            <option>Hisse Doluluk</option>
          </select>
        </div>

        {/* 🐄 İLAN KARTLARI */}
        {/* Yükleniyor skeletu */}
        {yukleniyor && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-start">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm animate-pulse">
                <div className="h-44 bg-slate-200 dark:bg-slate-700" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-7 w-full bg-slate-200 dark:bg-slate-700 rounded-md mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hata durumu */}
        {hata && (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <span className="text-4xl mb-4">⚠️</span>
            <p className="font-bold">Veri yüklenirken hata oluştu</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{hata}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-start">
          <AnimatePresence mode="sync">
            {!yukleniyor && filtrelenmis.map((hayvan, i) => (
              <motion.div
                key={hayvan.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="h-full"
              >
                <Link href={`/ilan/${hayvan.id}`} className="block h-full">
                  <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm hover:shadow-lg hover:border-[var(--accent-main)]/40 transition-all cursor-pointer group">
                    {/* HAYVAN GÖRSELİ */}
                    <div className="relative h-44 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-500 dark:from-slate-800 dark:to-slate-600 flex items-center justify-center overflow-hidden">
                      <span className="text-white/20 text-7xl font-black select-none">
                        {hayvan.tip === "Büyükbaş" ? "🐄" : "🐑"}
                      </span>
                      {/* Rozetler */}
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
                        {hayvan.canli_yayin && (
                          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow">
                            <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> Canlı
                          </span>
                        )}
                        {hayvan.dolu_hisse >= hayvan.hisse_sayisi && (
                          <span className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">Doldu</span>
                        )}
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-white text-[10px] font-medium">{hayvan.konum}</span>
                      </div>
                    </div>

                    {/* KART İÇERİĞİ */}
                    <div className="flex flex-col flex-grow p-3.5">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">{hayvan.cins}</p>
                          <h3 className="font-bold text-base leading-tight">{hayvan.tur}</h3>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--accent-main)] text-base">{hayvan.fiyat.toLocaleString("tr-TR")} ₺</p>
                          {hayvan.tip === "Büyükbaş" && (
                            <p className="text-[10px] text-[var(--text-secondary)]">{Math.round(hayvan.fiyat / hayvan.hisse_sayisi).toLocaleString("tr-TR")} ₺/Hisse</p>
                          )}
                          {hayvan.tip === "Küçükbaş" && (
                            <p className="text-[10px] text-[var(--text-secondary)]">Tek Hayvan</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs text-[var(--text-secondary)] mb-3 mt-1">
                        <span>🏋️ {hayvan.kilo} kg</span>
                        {hayvan.helal && <span className="flex items-center gap-0.5"><ShieldCheck size={11} className="text-green-500" /> Helal</span>}
                        {hayvan.tip === "Büyükbaş" && (
                          <span className="flex items-center gap-1">
                            <Users size={11} /> {hayvan.hisse_sayisi} kişilik
                          </span>
                        )}
                        {hayvan.tip === "Küçükbaş" && (
                          <span className="flex items-center gap-1">
                            <User size={11} /> Bireysel
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col justify-end flex-grow gap-2">
                        {hayvan.tip === "Büyükbaş" && (
                          <div className="flex gap-1 w-full">
                            {[...Array(hayvan.hisse_sayisi)].map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-7 flex-1 rounded-md flex items-center justify-center transition-colors ${
                                  idx < hayvan.dolu_hisse
                                    ? "bg-[var(--accent-main)] text-white shadow-sm shadow-[var(--accent-main)]/20"
                                    : "bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]/40"
                                }`}
                              >
                                <User size={12} strokeWidth={idx < hayvan.dolu_hisse ? 2.5 : 1.5} />
                              </div>
                            ))}
                          </div>
                        )}

                        {hayvan.tip === "Küçükbaş" && (
                          <div className="flex gap-1 w-full h-7">
                            <span className="flex-1 inline-flex items-center justify-center text-[9px] rounded-md bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 font-semibold whitespace-nowrap">
                              ✓ Helal
                            </span>
                            <span className="flex-1 inline-flex items-center justify-center text-[9px] rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-semibold whitespace-nowrap">
                              🩺 Vet.
                            </span>
                            {hayvan.canli_yayin ? (
                              <span className="flex-1 inline-flex items-center justify-center text-[9px] rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 font-semibold whitespace-nowrap">
                                📹 Canlı
                              </span>
                            ) : (
                              <span className="flex-1 inline-flex items-center justify-center text-[9px] rounded-md bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-semibold whitespace-nowrap">
                                📷 Foto
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
                          <span>Küpe: {hayvan.kupe}</span>
                          {hayvan.tip === "Büyükbaş" && hayvan.dolu_hisse < hayvan.hisse_sayisi && (
                            <span className="text-[var(--accent-gold)] font-semibold">
                              {hayvan.hisse_sayisi - hayvan.dolu_hisse} Hisse Boş
                            </span>
                          )}
                          {hayvan.tip === "Küçükbaş" && (
                            <span className="text-[var(--accent-main)] font-semibold">Müsait</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtrelenmis.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
              <span className="text-5xl mb-4">🔍</span>
              <p className="font-medium">Aramanıza uygun ilan bulunamadı.</p>
              <button onClick={() => { setAramaMetni(""); setAktifKategori("Tümü"); setAktifTür("Tümü"); setMaxFiyat(200000); setSadeceCanlı(false); setSadeceHisseli(false); }} className="mt-4 text-[var(--accent-main)] text-sm font-semibold">
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 🗂️ DETAYLI FİLTRE PANELİ (DRAWER) */}
      <AnimatePresence>
        {filtrePanelAcik && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setFiltrePanelAcik(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] rounded-t-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Detaylı Filtrele</h2>
                <button onClick={() => setFiltrePanelAcik(false)} className="p-2 rounded-full hover:bg-[var(--bg-primary)]">
                  <X size={20} />
                </button>
              </div>

              {/* Hayvan Türü */}
              <div className="mb-5">
                <p className="text-sm font-semibold mb-3 text-[var(--text-secondary)]">Hayvan Türü</p>
                <div className="flex flex-wrap gap-2">
                  {HAYVAN_TURLERI.map((tür) => (
                    <button
                      key={tür}
                      onClick={() => setAktifTür(tür)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        aktifTür === tür
                          ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)]"
                          : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {tür}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maks Fiyat */}
              <div className="mb-5">
                <div className="flex justify-between text-sm font-semibold mb-3">
                  <span className="text-[var(--text-secondary)]">Maksimum Fiyat</span>
                  <span className="text-[var(--accent-main)]">{maxFiyat.toLocaleString("tr-TR")} ₺</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={200000}
                  step={5000}
                  value={maxFiyat}
                  onChange={(e) => setMaxFiyat(Number(e.target.value))}
                  className="w-full accent-[var(--accent-main)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1">
                  <span>10.000 ₺</span>
                  <span>200.000 ₺</span>
                </div>
              </div>

              {/* Toggle Filtreler */}
              <div className="space-y-3 mb-6">
                {[
                  { label: "Sadece Canlı Yayınlılar", state: sadeceCanlı, action: setSadeceCanlı },
                  { label: "Sadece Hissesi Açık Olanlar", state: sadeceHisseli, action: setSadeceHisseli },
                ].map(({ label, state, action }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <button
                      onClick={() => action(!state)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${state ? "bg-[var(--accent-main)]" : "bg-[var(--border-color)]"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${state ? "left-5.5" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Uygula / Temizle */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setAktifTür("Tümü"); setMaxFiyat(200000); setSadeceCanlı(false); setSadeceHisseli(false); }}
                  className="flex-1 py-3 rounded-2xl border border-[var(--border-color)] text-sm font-semibold"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setFiltrePanelAcik(false)}
                  className="flex-1 py-3 rounded-2xl bg-[var(--accent-main)] text-white text-sm font-bold shadow-md shadow-[var(--accent-main)]/25"
                >
                  {filtrelenmis.length} İlanı Göster
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
