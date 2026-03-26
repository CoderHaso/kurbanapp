"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Radio, Archive, ExternalLink, Play, ChevronRight, Loader2, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type IlanYayin = {
  id: number; cins: string; tur: string; kupe: string;
  konum: string; yayin_url: string; dolu_hisse: number; hisse_sayisi: number;
};

type GenelYayin = {
  id: number; baslik: string; aciklama: string | null; yayin_url: string; created_at: string;
};

type ArsivYayin = {
  id: number; baslik: string; aciklama: string | null; video_url: string; created_at: string;
  hayvan_id: number | null;
};

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const liveMatch = u.pathname.match(/\/live\/([^/?]+)/);
    if (liveMatch) return liveMatch[1];
  } catch {}
  return null;
}

function getThumbnail(url: string, quality = "mqdefault") {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
}

export default function YayinlarPage() {
  const router = useRouter();
  const [aktifTab, setAktifTab] = useState<"ilan" | "genel" | "arsiv">("ilan");
  const [ilanYayinlar, setIlanYayinlar] = useState<IlanYayin[]>([]);
  const [genelYayinlar, setGenelYayinlar] = useState<GenelYayin[]>([]);
  const [arsivYayinlar, setArsivYayinlar] = useState<ArsivYayin[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setYukleniyor(true);
      const [ilanRes, genelRes, arsivRes] = await Promise.all([
        supabase.from("hayvanlar")
          .select("id, cins, tur, kupe, konum, yayin_url, dolu_hisse, hisse_sayisi")
          .eq("canli_yayin", true)
          .eq("yayin_goster", true)
          .eq("aktif", true),
        supabase.from("genel_yayinlar")
          .select("id, baslik, aciklama, yayin_url, created_at")
          .eq("aktif", true)
          .order("created_at", { ascending: false }),
        supabase.from("arsiv_yayinlar")
          .select("id, baslik, aciklama, video_url, created_at, hayvan_id")
          .order("created_at", { ascending: false }),
      ]);
      setIlanYayinlar((ilanRes.data || []) as IlanYayin[]);
      setGenelYayinlar((genelRes.data || []) as GenelYayin[]);
      setArsivYayinlar((arsivRes.data || []) as ArsivYayin[]);
      setYukleniyor(false);
    }
    fetchAll();
  }, []);

  const TABS = [
    { id: "ilan" as const, label: "İlana Özel", icon: Wifi, count: ilanYayinlar.length },
    { id: "genel" as const, label: "Genel Yayınlar", icon: Radio, count: genelYayinlar.length },
    { id: "arsiv" as const, label: "Arşiv", icon: Archive, count: arsivYayinlar.length },
  ];

  return (
    <div className="min-h-screen pb-28">
      <main className="max-w-2xl mx-auto px-4 pt-20">
        {/* BAŞLIK */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-2xl font-extrabold">Canlı Yayınlar 📡</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Kurban kesim süreçlerini canlı izleyin</p>
        </motion.div>

        {/* TABS */}
        <div className="flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-1.5 mb-6">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setAktifTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all ${aktifTab === tab.id ? "bg-[var(--accent-main)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                <Icon size={13} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${aktifTab === tab.id ? "bg-white/20" : "bg-[var(--bg-primary)]"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {yukleniyor ? (
          <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-[var(--accent-main)]" /></div>
        ) : (
          <AnimatePresence mode="wait">
            {/* İLANA ÖZEL YAYINLAR */}
            {aktifTab === "ilan" && (
              <motion.div key="ilan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {ilanYayinlar.length === 0 ? (
                  <EmptyState icon="📡" text="Şu an aktif canlı yayın yok." />
                ) : (
                  ilanYayinlar.map(h => {
                    const thumb = getThumbnail(h.yayin_url);
                    const ytId = getYoutubeId(h.yayin_url);
                    return (
                      <div key={h.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        {/* Thumbnail */}
                        <div className="relative w-full aspect-video bg-black cursor-pointer" onClick={() => router.push(`/ilan/${h.id}`)}>
                          {thumb ? (
                            <img src={thumb} alt={`${h.cins} ${h.tur}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                              <Wifi size={40} className="text-red-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> CANLI
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <p className="text-white font-extrabold text-base drop-shadow">{h.cins} {h.tur}</p>
                            <p className="text-white/70 text-xs">{h.konum} · {h.kupe}</p>
                          </div>
                          <div className="absolute bottom-3 right-3 flex gap-2">
                            {ytId && (
                              <button
                                onClick={e => { e.stopPropagation(); window.open(h.yayin_url, "_blank"); }}
                                className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/10 hover:bg-red-600 transition-colors">
                                <ExternalLink size={11} /> YouTube
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Alt bilgi */}
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-[var(--text-secondary)]">Hisse: {h.dolu_hisse}/{h.hisse_sayisi}</p>
                          </div>
                          <button onClick={() => router.push(`/ilan/${h.id}`)}
                            className="flex items-center gap-1 text-xs font-bold text-[var(--accent-main)]">
                            İlana Git <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* GENEL YAYINLAR */}
            {aktifTab === "genel" && (
              <motion.div key="genel" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {genelYayinlar.length === 0 ? (
                  <EmptyState icon="📻" text="Henüz genel yayın eklenmemiş." />
                ) : (
                  genelYayinlar.map(y => {
                    const thumb = getThumbnail(y.yayin_url);
                    return (
                      <div key={y.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                        <div className="relative w-full aspect-video bg-black cursor-pointer"
                          onClick={() => window.open(y.yayin_url, "_blank")}>
                          {thumb ? (
                            <img src={thumb} alt={y.baslik} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                              <Radio size={40} className="text-[var(--accent-main)]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> CANLI
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <p className="text-white font-extrabold text-sm drop-shadow">{y.baslik}</p>
                            {y.aciklama && <p className="text-white/70 text-xs">{y.aciklama}</p>}
                          </div>
                          <div className="absolute bottom-3 right-3">
                            <button onClick={e => { e.stopPropagation(); window.open(y.yayin_url, "_blank"); }}
                              className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/10 hover:bg-red-600 transition-colors">
                              <ExternalLink size={11} /> İzle
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* ARŞİV */}
            {aktifTab === "arsiv" && (
              <motion.div key="arsiv" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {arsivYayinlar.length === 0 ? (
                  <EmptyState icon="📼" text="Henüz arşiv kaydı eklenmemiş." />
                ) : (
                  arsivYayinlar.map(a => {
                    const thumb = getThumbnail(a.video_url);
                    return (
                      <div key={a.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                        <div className="relative w-full aspect-video bg-black cursor-pointer"
                          onClick={() => window.open(a.video_url, "_blank")}>
                          {thumb ? (
                            <img src={thumb} alt={a.baslik} className="w-full h-full object-cover opacity-80" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                              <Archive size={40} className="text-slate-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all">
                              <Play size={24} className="text-white ml-1" fill="white" />
                            </div>
                          </div>
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-700/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <Archive size={9} /> ARŞİV
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <p className="text-white font-extrabold text-sm drop-shadow">{a.baslik}</p>
                            {a.aciklama && <p className="text-white/70 text-xs">{a.aciklama}</p>}
                          </div>
                          <div className="absolute bottom-3 right-3 text-white/60 text-[10px] flex items-center gap-1">
                            <Calendar size={9} /> {new Date(a.created_at).toLocaleDateString("tr-TR")}
                          </div>
                        </div>
                        <div className="px-4 py-3 flex justify-end">
                          <button onClick={() => window.open(a.video_url, "_blank")}
                            className="flex items-center gap-1 text-xs font-bold text-[var(--accent-main)]">
                            YouTube'da İzle <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--text-secondary)]">
      <p className="text-5xl mb-4">{icon}</p>
      <p className="font-medium text-sm">{text}</p>
    </div>
  );
}
