"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  MonitorPlay, Users, User, ShieldCheck,
  MessageCircle, MapPin, Tag, Scale, Award,
  Share2, Heart, Maximize2, FileCheck, X, Loader2, ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

type Hayvan = {
  id: number; tip: string; cins: string; tur: string; kilo: number;
  fiyat: number; hisse_sayisi: number; dolu_hisse: number;
  canli_yayin: boolean; helal: boolean; konum: string;
  kupe: string; yas: string; cinsiyet: string;
  aciklama: string; whatsapp: string; yayin_url: string;
  karkas: number; vucut_puani: number; aktif: boolean;
  kesim_tarihi: string | null; teslim_tarihi: string | null;
  auto_onay: boolean; foto_urls: string[];
};

export default function IlanDetay() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id;

  const [h, setH] = useState<Hayvan | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [tamEkran, setTamEkran] = useState(false);
  const [aktifFoto, setAktifFoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase.from("hayvanlar").select("*").eq("id", id).single()
      .then(({ data }) => {
        setH(data as Hayvan);
        setYukleniyor(false);
      });
  }, [id]);

  if (yukleniyor) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 size={40} className="animate-spin text-[var(--accent-main)]" />
    </div>
  );

  if (!h) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <span className="text-5xl">🔍</span>
      <p className="font-bold text-lg">İlan bulunamadı.</p>
      <button onClick={() => router.push("/")} className="text-[var(--accent-main)] font-semibold">Anasayfaya Dön</button>
    </div>
  );

  const hisseBasi = Math.round(h.fiyat / h.hisse_sayisi);
  const dolulukYuzdesi = Math.round((h.dolu_hisse / h.hisse_sayisi) * 100);
  const bosHisse = h.hisse_sayisi - h.dolu_hisse;
  const satildi = !h.aktif || h.dolu_hisse >= h.hisse_sayisi;
  const whatsappMesaj = encodeURIComponent(`Merhaba, "${h.kupe}" küpe numaralı ${h.cins} ${h.tur} ilanınızla ilgili bilgi almak istiyorum.`);

  // YouTube embed ID çıkar
  const youtubeId = h.yayin_url?.includes("youtube.com") || h.yayin_url?.includes("youtu.be")
    ? h.yayin_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/))([^&?/]+)/)?.[1]
    : null;

  const handleSatinAl = () => {
    if (!user) { router.push("/giris"); return; }
    router.push(`/odeme/${h.id}`);
  };

  return (
    <div className="min-h-screen pb-36">

      {/* GÖRSEL / CANLI YAYIN */}
      <div className="relative bg-black mt-14 overflow-hidden">
        {h.canli_yayin && youtubeId ? (
          <div className="relative">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1`}
              className="w-full aspect-video"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
            <button onClick={() => setTamEkran(true)}
              className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
              <Maximize2 size={12} /> Tam Ekran
            </button>
          </div>
        ) : h.canli_yayin ? (
          <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <MonitorPlay size={56} className="text-white/30" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-black animate-pulse" />
            </div>
            <p className="text-white/80 font-bold text-sm">Canlı Yayın</p>
            {h.yayin_url && (
              <a href={h.yayin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors">
                <ExternalLink size={12} /> Yayını Aç
              </a>
            )}
          </div>
        ) : h.foto_urls && h.foto_urls.length > 0 ? (
          <div className="relative">
            <img src={h.foto_urls[aktifFoto]} alt={`${h.cins} ${h.tur}`} className="w-full aspect-video object-cover" />
            {h.foto_urls.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {h.foto_urls.map((_, i) => (
                  <button key={i} onClick={() => setAktifFoto(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === aktifFoto ? "bg-white scale-125" : "bg-white/50"}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-60 sm:h-72 bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
            <span className="text-white/10 text-[9rem] font-black select-none">
              {h.tip === "Büyükbaş" ? "🐄" : "🐑"}
            </span>
          </div>
        )}

        {/* Rozetler */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          {h.canli_yayin && (
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Canlı Yayın
            </span>
          )}
          {satildi && <span className="bg-slate-800 text-white text-xs px-2.5 py-1 rounded-lg font-bold">Doldu</span>}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1 z-10">
          <MapPin size={11} className="text-white" />
          <span className="text-white text-xs font-medium">{h.konum}</span>
        </div>
      </div>

      {/* DETAY İÇERİĞİ */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* BAŞLIK KARTI */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">{h.cins}</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">{h.tip}</span>
              <div className="flex items-center gap-1">
                <MapPin size={11} className="text-[var(--text-secondary)]" />
                <span className="text-xs text-[var(--text-secondary)]">{h.konum}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"><Heart size={18} /></button>
              <button className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors"><Share2 size={18} /></button>
            </div>
          </div>
          <div className="px-4 pb-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{h.tur}</h1>
            {h.helal && (
              <div className="flex items-center gap-1 mt-1">
                <ShieldCheck size={13} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Helal Kesim Belgeli</span>
              </div>
            )}
          </div>
          <div className={`grid ${h.tip === "Büyükbaş" ? "grid-cols-2" : "grid-cols-1"} divide-x divide-[var(--border-color)] border-t border-[var(--border-color)]`}>
            <div className="px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">Toplam Fiyat</p>
              <p className="text-2xl font-extrabold text-[var(--accent-main)]">{h.fiyat.toLocaleString("tr-TR")} ₺</p>
            </div>
            {h.tip === "Büyükbaş" && (
              <div className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">Hisse Başına</p>
                <p className="text-2xl font-extrabold">{hisseBasi.toLocaleString("tr-TR")} ₺</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* HAYVAN ÖZELLİKLERİ */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)] shadow-sm">
          <h2 className="text-xs font-bold mb-3 text-[var(--text-secondary)] uppercase tracking-wider">Hayvan Bilgileri</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Tag, label: "Küpe No", value: h.kupe },
              { icon: Scale, label: "Canlı Ağırlık", value: `${h.kilo} kg` },
              { icon: Award, label: "Tahmini Karkas", value: `~${h.karkas} kg` },
              { icon: Users, label: "Yaş", value: h.yas || "-" },
              { icon: User, label: "Cinsiyet", value: h.cinsiyet || "-" },
              { icon: ShieldCheck, label: "Vücut Puanı", value: h.vucut_puani ? `${h.vucut_puani} / 5 ★` : "-" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-[var(--bg-primary)] rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-main)]/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-[var(--accent-main)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--text-secondary)]">{label}</p>
                  <p className="text-sm font-semibold truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* HİSSE DOLULUK */}
        {h.tip === "Büyükbaş" && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-color)] shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Hisse Doluluk</h2>
              <span className="text-[10px] font-bold bg-[var(--accent-main)]/10 text-[var(--accent-main)] px-2 py-0.5 rounded-md">
                {h.dolu_hisse}/{h.hisse_sayisi} Hisse Dolu
              </span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: h.hisse_sayisi }).map((_, i) => (
                <div key={i} className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${i < h.dolu_hisse ? "bg-[var(--accent-main)] text-white" : "bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]"}`}>
                  {i < h.dolu_hisse ? "✓" : i + 1}
                </div>
              ))}
            </div>
            {bosHisse > 0 && <p className="text-[10px] text-[var(--text-secondary)] mt-2 text-center">{bosHisse} hisse kaldı</p>}
          </motion.div>
        )}

        {/* AÇIKLAMA */}
        {h.aciklama && (
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)] shadow-sm">
            <h2 className="text-xs font-bold mb-2 text-[var(--text-secondary)] uppercase tracking-wider">Hakkında</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{h.aciklama}</p>
          </div>
        )}

        {/* KESİM TARİHİ */}
        {h.kesim_tarihi && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-1">Planlanan Kesim</p>
            <p className="font-bold text-amber-600 dark:text-amber-400">
              {new Date(h.kesim_tarihi).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            {h.teslim_tarihi && (
              <p className="text-[10px] text-amber-400/70 mt-1">
                Tahmini teslim: {new Date(h.teslim_tarihi).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ALTTA SABİT BUTONLAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/90 to-transparent">
        <div className="max-w-2xl mx-auto flex gap-3">
          {h.whatsapp && (
            <a href={`https://wa.me/${h.whatsapp}?text=${whatsappMesaj}`} target="_blank" rel="noopener"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-5 rounded-2xl font-bold shadow-lg shadow-green-500/30 transition-colors">
              <MessageCircle size={20} />
            </a>
          )}
          <button
            onClick={handleSatinAl}
            disabled={satildi}
            className={`flex-1 py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
              satildi
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-[var(--accent-main)] hover:bg-emerald-600 text-white shadow-[var(--accent-main)]/30 hover:scale-[1.02]"
            }`}
          >
            {satildi ? "Stok Tükendi" :
              h.tip === "Büyükbaş" ? `Hisse Al — ${hisseBasi.toLocaleString("tr-TR")} ₺` :
              `Satın Al — ${h.fiyat.toLocaleString("tr-TR")} ₺`}
          </button>
        </div>
      </div>

      {/* TAM EKRAN YAYIN MODALI */}
      <AnimatePresence>
        {tamEkran && youtubeId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
            <button onClick={() => setTamEkran(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10">
              <X size={28} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
