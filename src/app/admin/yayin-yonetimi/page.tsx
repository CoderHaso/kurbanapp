"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Wifi, Radio, Archive, Plus, Trash2, RefreshCw,
  Loader2, Eye, EyeOff, Save, X, ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type IlanYayin = {
  id: number; cins: string; tur: string; kupe: string; konum: string;
  yayin_url: string | null; canli_yayin: boolean; yayin_goster: boolean;
};

type GenelYayin = {
  id: number; baslik: string; aciklama: string | null; yayin_url: string; aktif: boolean; created_at: string;
};

type ArsivYayin = {
  id: number; baslik: string; aciklama: string | null; video_url: string; hayvan_id: number | null; created_at: string;
};

type HayvanOption = { id: number; cins: string; tur: string; kupe: string };

function getYoutubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/live\/([^/?]+)/);
    if (m) return m[1];
  } catch {}
  return null;
}

export default function AdminYayinYonetimiPage() {
  const router = useRouter();
  const [aktifTab, setAktifTab] = useState<"ilan" | "genel" | "arsiv">("ilan");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [ilanYayinlar, setIlanYayinlar] = useState<IlanYayin[]>([]);
  const [genelYayinlar, setGenelYayinlar] = useState<GenelYayin[]>([]);
  const [arsivYayinlar, setArsivYayinlar] = useState<ArsivYayin[]>([]);
  const [hayvanlar, setHayvanlar] = useState<HayvanOption[]>([]);

  // Modal states
  const [genelModal, setGenelModal] = useState(false);
  const [arsivModal, setArsivModal] = useState(false);
  const [genelForm, setGenelForm] = useState({ baslik: "", aciklama: "", yayin_url: "" });
  const [arsivForm, setArsivForm] = useState({ baslik: "", aciklama: "", video_url: "", hayvan_id: "" });
  const [kaydediliyor, setKaydediliyor] = useState(false);

  async function fetchAll() {
    setYukleniyor(true);
    const [ilanRes, genelRes, arsivRes, hayvanRes] = await Promise.all([
      supabase.from("hayvanlar").select("id, cins, tur, kupe, konum, yayin_url, canli_yayin, yayin_goster").order("created_at", { ascending: false }),
      supabase.from("genel_yayinlar").select("*").order("created_at", { ascending: false }),
      supabase.from("arsiv_yayinlar").select("*").order("created_at", { ascending: false }),
      supabase.from("hayvanlar").select("id, cins, tur, kupe"),
    ]);
    setIlanYayinlar((ilanRes.data || []) as IlanYayin[]);
    setGenelYayinlar((genelRes.data || []) as GenelYayin[]);
    setArsivYayinlar((arsivRes.data || []) as ArsivYayin[]);
    setHayvanlar((hayvanRes.data || []) as HayvanOption[]);
    setYukleniyor(false);
  }

  useEffect(() => { fetchAll(); }, []);

  const toggleYayinGoster = async (id: number, current: boolean) => {
    await supabase.from("hayvanlar").update({ yayin_goster: !current }).eq("id", id);
    setIlanYayinlar(prev => prev.map(h => h.id === id ? { ...h, yayin_goster: !current } : h));
  };

  const toggleGenelAktif = async (id: number, current: boolean) => {
    await supabase.from("genel_yayinlar").update({ aktif: !current }).eq("id", id);
    setGenelYayinlar(prev => prev.map(y => y.id === id ? { ...y, aktif: !current } : y));
  };

  const handleGenelKaydet = async () => {
    if (!genelForm.baslik.trim() || !genelForm.yayin_url.trim()) return;
    setKaydediliyor(true);
    await supabase.from("genel_yayinlar").insert({ ...genelForm, aktif: true });
    setGenelModal(false);
    setGenelForm({ baslik: "", aciklama: "", yayin_url: "" });
    setKaydediliyor(false);
    fetchAll();
  };

  const handleArsivKaydet = async () => {
    if (!arsivForm.baslik.trim() || !arsivForm.video_url.trim()) return;
    setKaydediliyor(true);
    await supabase.from("arsiv_yayinlar").insert({
      baslik: arsivForm.baslik,
      aciklama: arsivForm.aciklama || null,
      video_url: arsivForm.video_url,
      hayvan_id: arsivForm.hayvan_id ? parseInt(arsivForm.hayvan_id) : null,
    });
    setArsivModal(false);
    setArsivForm({ baslik: "", aciklama: "", video_url: "", hayvan_id: "" });
    setKaydediliyor(false);
    fetchAll();
  };

  const handleGenelSil = async (id: number) => {
    await supabase.from("genel_yayinlar").delete().eq("id", id);
    fetchAll();
  };

  const handleArsivSil = async (id: number) => {
    await supabase.from("arsiv_yayinlar").delete().eq("id", id);
    fetchAll();
  };

  const TABS = [
    { id: "ilan" as const, label: "İlana Özel", icon: Wifi, count: ilanYayinlar.filter(h => h.canli_yayin).length },
    { id: "genel" as const, label: "Genel Yayınlar", icon: Radio, count: genelYayinlar.length },
    { id: "arsiv" as const, label: "Arşiv", icon: Archive, count: arsivYayinlar.length },
  ];

  return (
    <div className="min-h-screen pb-24 pt-24 px-4 max-w-4xl mx-auto">
      {/* MODAL — Genel Yayın Ekle */}
      <AnimatePresence>
        {genelModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-[var(--bg-secondary)] rounded-2xl p-6 w-full max-w-md border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><Radio size={16} className="text-red-500" /> Genel Yayın Ekle</h3>
                <button onClick={() => setGenelModal(false)}><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">Başlık *</label>
                  <input value={genelForm.baslik} onChange={e => setGenelForm(p => ({ ...p, baslik: e.target.value }))}
                    placeholder="2026 Kurban Bayramı Canlı Yayını"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-main)]" />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">Açıklama</label>
                  <input value={genelForm.aciklama} onChange={e => setGenelForm(p => ({ ...p, aciklama: e.target.value }))}
                    placeholder="Opsiyonel açıklama"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-main)]" />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">YouTube Yayın URL *</label>
                  <input value={genelForm.yayin_url} onChange={e => setGenelForm(p => ({ ...p, yayin_url: e.target.value }))}
                    placeholder="https://youtube.com/live/..."
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-main)] font-mono text-xs" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setGenelModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] font-bold text-sm">İptal</button>
                <button onClick={handleGenelKaydet} disabled={kaydediliyor || !genelForm.baslik || !genelForm.yayin_url}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-main)] text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {kaydediliyor ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Kaydet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL — Arşiv Ekle */}
      <AnimatePresence>
        {arsivModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-[var(--bg-secondary)] rounded-2xl p-6 w-full max-w-md border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><Archive size={16} className="text-slate-400" /> Arşiv Yayın Ekle</h3>
                <button onClick={() => setArsivModal(false)}><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">Başlık *</label>
                  <input value={arsivForm.baslik} onChange={e => setArsivForm(p => ({ ...p, baslik: e.target.value }))}
                    placeholder="Simental Dana Kesim Kaydı"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-main)]" />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">Açıklama</label>
                  <input value={arsivForm.aciklama} onChange={e => setArsivForm(p => ({ ...p, aciklama: e.target.value }))}
                    placeholder="Opsiyonel açıklama"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-main)]" />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">YouTube Video URL * (canlı yayın/kaydedilmiş)</label>
                  <input value={arsivForm.video_url} onChange={e => setArsivForm(p => ({ ...p, video_url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-main)] font-mono text-xs" />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)] mb-1 block">İlgili İlan (opsiyonel)</label>
                  <select value={arsivForm.hayvan_id} onChange={e => setArsivForm(p => ({ ...p, hayvan_id: e.target.value }))}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-main)]">
                    <option value="">— İlan seçme —</option>
                    {hayvanlar.map(h => (
                      <option key={h.id} value={h.id}>{h.cins} {h.tur} ({h.kupe})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setArsivModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] font-bold text-sm">İptal</button>
                <button onClick={handleArsivKaydet} disabled={kaydediliyor || !arsivForm.baslik || !arsivForm.video_url}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-main)] text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {kaydediliyor ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Ekle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BAŞLIK */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider">Yayın Yönetimi 📡</h1>
            <p className="text-[10px] text-[var(--text-secondary)]">Canlı yayın, genel yayın ve arşiv yönetimi</p>
          </div>
        </div>
        <button onClick={fetchAll} className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-1.5 mb-6">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setAktifTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all ${aktifTab === tab.id ? "bg-[var(--accent-main)] text-white" : "text-[var(--text-secondary)]"}`}>
              <Icon size={13} /> {tab.label}
              {tab.count > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${aktifTab === tab.id ? "bg-white/20" : "bg-[var(--bg-primary)]"}`}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {yukleniyor ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[var(--accent-main)]" /></div>
      ) : (
        <>
          {/* İLANA ÖZEL YAYINLAR */}
          {aktifTab === "ilan" && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Yayın URL'si olan ilanlar. Göz ikonu ile kullanıcı tarafındaki Canlı Yayınlar sayfasında göster/gizle.
              </p>
              {ilanYayinlar.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-secondary)]">
                  <Wifi size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Yayın URL'si olan ilan yok. İlan yönetiminden ekleyin.</p>
                </div>
              ) : (
                ilanYayinlar.map(h => {
                  const ytId = h.yayin_url ? getYoutubeId(h.yayin_url) : null;
                  return (
                    <div key={h.id} className={`flex items-center gap-3 p-3 rounded-xl border ${h.yayin_goster ? "bg-[var(--bg-secondary)] border-[var(--border-color)]" : "bg-[var(--bg-primary)] border-[var(--border-color)] opacity-50"}`}>
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        {ytId ? (
                          <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500"><Wifi size={16} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs">{h.cins} {h.tur}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] truncate">{h.konum} · {h.kupe}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {h.canli_yayin ? (
                            <span className="text-[9px] font-bold text-red-500 flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" /> Canlı URL Var</span>
                          ) : (
                            <span className="text-[9px] text-[var(--text-secondary)]">URL Yok</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {h.yayin_url && (
                          <button onClick={() => window.open(h.yayin_url!, "_blank")} className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)]">
                            <ExternalLink size={12} />
                          </button>
                        )}
                        <button onClick={() => toggleYayinGoster(h.id, h.yayin_goster)}
                          className={`p-1.5 rounded-lg border transition-all ${h.yayin_goster ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "border-[var(--border-color)] text-[var(--text-secondary)]"}`}
                          title={h.yayin_goster ? "Gizle" : "Göster"}>
                          {h.yayin_goster ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* GENEL YAYINLAR */}
          {aktifTab === "genel" && (
            <div className="space-y-3">
              <button onClick={() => setGenelModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--accent-main)]/40 text-[var(--accent-main)] font-bold text-sm hover:bg-[var(--accent-main)]/5 transition-colors">
                <Plus size={16} /> Genel Yayın Ekle
              </button>
              {genelYayinlar.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-secondary)] text-sm">Henüz genel yayın yok.</div>
              ) : (
                genelYayinlar.map(y => {
                  const ytId = getYoutubeId(y.yayin_url);
                  return (
                    <div key={y.id} className={`flex items-center gap-3 p-3 rounded-xl border ${y.aktif ? "bg-[var(--bg-secondary)] border-[var(--border-color)]" : "bg-[var(--bg-primary)] border-[var(--border-color)] opacity-50"}`}>
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        {ytId ? <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} className="w-full h-full object-cover" /> : <Radio size={16} className="m-auto mt-2.5 text-slate-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs">{y.baslik}</p>
                        {y.aciklama && <p className="text-[10px] text-[var(--text-secondary)]">{y.aciklama}</p>}
                        <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">{new Date(y.created_at).toLocaleDateString("tr-TR")}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => window.open(y.yayin_url, "_blank")} className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)]">
                          <ExternalLink size={12} />
                        </button>
                        <button onClick={() => toggleGenelAktif(y.id, y.aktif)}
                          className={`p-1.5 rounded-lg border transition-all ${y.aktif ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "border-[var(--border-color)] text-[var(--text-secondary)]"}`}>
                          {y.aktif ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => handleGenelSil(y.id)} className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ARŞİV */}
          {aktifTab === "arsiv" && (
            <div className="space-y-3">
              <button onClick={() => setArsivModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--accent-main)]/40 text-[var(--accent-main)] font-bold text-sm hover:bg-[var(--accent-main)]/5 transition-colors">
                <Plus size={16} /> Arşiv Kaydı Ekle
              </button>
              {arsivYayinlar.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-secondary)] text-sm">Henüz arşiv kaydı yok.</div>
              ) : (
                arsivYayinlar.map(a => {
                  const ytId = getYoutubeId(a.video_url);
                  const ilgiliHayvan = hayvanlar.find(h => h.id === a.hayvan_id);
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-color)]">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        {ytId ? <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} className="w-full h-full object-cover opacity-70" /> : <Archive size={16} className="m-auto mt-2.5 text-slate-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs">{a.baslik}</p>
                        {a.aciklama && <p className="text-[10px] text-[var(--text-secondary)]">{a.aciklama}</p>}
                        <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">
                          {ilgiliHayvan ? `${ilgiliHayvan.cins} ${ilgiliHayvan.tur} · ` : ""}
                          {new Date(a.created_at).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => window.open(a.video_url, "_blank")} className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)]">
                          <ExternalLink size={12} />
                        </button>
                        <button onClick={() => handleArsivSil(a.id)} className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
