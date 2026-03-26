"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, LogOut, CheckCircle2, TrendingUp, AlertCircle, ShoppingCart,
  Plus, ChevronRight, Activity, Loader2, RefreshCw, X, Package, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Siparis = {
  id: string; durum: string; fiyat: number; created_at: string;
  hisse_no: number | null; ad_soyad: string | null; telefon: string | null;
  odeme_yontemi: string; hayvan_id: number; red_sebebi?: string | null;
  hayvanlar: { kupe: string; tur: string; cins: string } | null;
};

const DURUM_ETIKETLERI: Record<string, { label: string; renk: string }> = {
  onay_bekliyor: { label: "Onay Bekliyor", renk: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  odeme_bekleniyor: { label: "Ödeme Bekleniyor", renk: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  aktif: { label: "Aktif", renk: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  reddedildi: { label: "Reddedildi", renk: "bg-red-500/10 text-red-500 border-red-500/20" },
  kesiliyor: { label: "Kesim Günü 🔪", renk: "bg-red-500/10 text-red-500 border-red-500/20" },
  hazir: { label: "Paketleniyor", renk: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  teslim_edildi: { label: "Teslim Edildi ✅", renk: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [istatistikler, setIstatistikler] = useState({ aktifIlan: 0, bekleyenSiparis: 0, toplamSiparis: 0, bugunCiro: 0 });
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtre, setFiltre] = useState("onay_bekliyor");
  const [redModal, setRedModal] = useState<{ sipId: string; hayvanId: number } | null>(null);
  const [redSebebi, setRedSebebi] = useState("");
  const [redGonderiliyor, setRedGonderiliyor] = useState(false);

  async function fetchData() {
    setYukleniyor(true);
    const [sipRes, ilanRes] = await Promise.all([
      supabase.from("siparisler").select("id, durum, fiyat, created_at, hisse_no, ad_soyad, telefon, odeme_yontemi, hayvan_id, red_sebebi, hayvanlar(kupe, tur, cins)").order("created_at", { ascending: false }),
      supabase.from("hayvanlar").select("id, aktif").eq("aktif", true),
    ]);
    const sips = (sipRes.data || []) as unknown as Siparis[];
    setSiparisler(sips);
    const bugun = new Date().toISOString().slice(0, 10);
    const bugunSips = sips.filter(s => s.created_at?.slice(0, 10) === bugun);
    setIstatistikler({
      aktifIlan: ilanRes.data?.length || 0,
      bekleyenSiparis: sips.filter(s => s.durum === "onay_bekliyor").length,
      toplamSiparis: sips.length,
      bugunCiro: bugunSips.reduce((acc, s) => acc + (s.fiyat || 0), 0),
    });
    setYukleniyor(false);
  }

  useEffect(() => { fetchData(); }, []);

  const handleOnayla = async (sipId: string) => {
    await supabase.from("siparisler").update({ durum: "aktif" }).eq("id", sipId);
    fetchData();
  };

  const handleReddetSubmit = async () => {
    if (!redModal || !redSebebi.trim()) return;
    setRedGonderiliyor(true);
    await supabase.from("siparisler").update({ durum: "reddedildi", red_sebebi: redSebebi }).eq("id", redModal.sipId);
    await supabase.rpc("decrement_dolu_hisse", { hayvan_id_param: redModal.hayvanId });
    setRedModal(null);
    setRedSebebi("");
    setRedGonderiliyor(false);
    fetchData();
  };

  const filtreliSiparisler = siparisler.filter(s => filtre === "hepsi" || s.durum === filtre);

  return (
    <div className="min-h-screen pb-24 pt-24 px-4 max-w-4xl mx-auto">

      {/* RED MODAL */}
      <AnimatePresence>
        {redModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-[var(--bg-secondary)] rounded-2xl p-6 w-full max-w-md border border-red-500/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Sipariş Reddet</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Red sebebini girin, kullanıcıya iletilecek.</p>
                </div>
                <button onClick={() => setRedModal(null)} className="ml-auto text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <X size={20} />
                </button>
              </div>
              <textarea
                value={redSebebi}
                onChange={e => setRedSebebi(e.target.value)}
                placeholder="Red sebebi (örn. Ödeme doğrulanamadı, stok tükendi...)"
                rows={3}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setRedModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-bold">İptal</button>
                <button onClick={handleReddetSubmit} disabled={!redSebebi.trim() || redGonderiliyor}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {redGonderiliyor ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reddet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">A</div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider">Yönetici Paneli</h1>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Admin: Sistem Yöneticisi</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => { supabase.auth.signOut(); router.push("/admin/login"); }}
            className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* İSTATİSTİKLER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { baslik: "Aktif İlan", deger: istatistikler.aktifIlan, icon: Activity, renk: "text-blue-500 bg-blue-500/10" },
            { baslik: "Onay Bekleyen", deger: istatistikler.bekleyenSiparis, icon: ShoppingCart, renk: "text-amber-500 bg-amber-500/10" },
            { baslik: "Toplam Sipariş", deger: istatistikler.toplamSiparis, icon: Users, renk: "text-purple-500 bg-purple-500/10" },
            { baslik: "Bugünkü Ciro", deger: istatistikler.bugunCiro > 0 ? `${Math.round(istatistikler.bugunCiro / 1000)}K ₺` : "0 ₺", icon: TrendingUp, renk: "text-emerald-500 bg-emerald-500/10" },
          ].map((ist, i) => {
            const Icon = ist.icon;
            return (
              <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{ist.baslik}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${ist.renk}`}><Icon size={14} /></div>
                </div>
                <p className="text-2xl font-black">{ist.deger}</p>
              </div>
            );
          })}
        </div>

        {/* HIZLI EYLEMLER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => router.push("/admin/ilan-ekle")}
            className="flex flex-col gap-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-4 shadow-lg transition-colors">
            <Plus size={18} />
            <span className="font-bold text-sm">Yeni İlan</span>
            <p className="text-[9px] text-emerald-100 uppercase tracking-widest">Ekle</p>
          </button>
          <button onClick={() => router.push("/admin/ilanlar")}
            className="flex flex-col gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 shadow-lg transition-colors">
            <Package size={18} />
            <span className="font-bold text-sm">İlanlar</span>
            <p className="text-[9px] text-blue-200 uppercase tracking-widest">Yönetim</p>
          </button>
          <button onClick={() => router.push("/admin/yayin-yonetimi")}
            className="flex flex-col gap-1 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl p-4 shadow-lg transition-colors">
            <Activity size={18} />
            <span className="font-bold text-sm">Yayınlar 📡</span>
            <p className="text-[9px] text-purple-200 uppercase tracking-widest">Canlı · Arşiv</p>
          </button>
          <button onClick={() => router.push("/admin/kesim")}
            className="flex flex-col gap-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl p-4 shadow-lg transition-colors">
            <Activity size={18} />
            <span className="font-bold text-sm">Kesim 🔪</span>
            <p className="text-[9px] text-red-200 uppercase tracking-widest">Yönetim</p>
          </button>
        </div>

        {/* SİPARİŞLER */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[var(--border-color)] flex flex-wrap justify-between items-center gap-3 bg-[var(--bg-primary)]">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" /> Siparişler
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {["onay_bekliyor", "aktif", "reddedildi", "kesiliyor", "teslim_edildi", "hepsi"].map(d => (
                <button key={d} onClick={() => setFiltre(d)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors ${filtre === d ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)]" : "border-[var(--border-color)] text-[var(--text-secondary)]"}`}>
                  {d === "hepsi" ? "Tümü" : DURUM_ETIKETLERI[d]?.label || d}
                </button>
              ))}
            </div>
          </div>

          {yukleniyor ? (
            <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-[var(--accent-main)]" /></div>
          ) : filtreliSiparisler.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">Bu kategoride sipariş yok 🎉</div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {filtreliSiparisler.map((sip) => (
                <div key={sip.id} className="p-4 hover:bg-[var(--bg-primary)] transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-lg shrink-0">
                        {sip.hayvanlar?.tur?.includes("Dan") || sip.hayvanlar?.tur?.includes("nek") || sip.hayvanlar?.tur?.includes("ve") ? "🐄" : "🐑"}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider">
                          {sip.hayvanlar?.cins} {sip.hayvanlar?.tur}
                          <span className="text-[10px] font-black text-[var(--accent-main)] ml-1">[Hisse #{sip.hisse_no || "?"}]</span>
                        </h3>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {sip.hayvanlar?.kupe} · {sip.ad_soyad || "Misafir"} {sip.telefon ? `· ${sip.telefon}` : ""} · {sip.fiyat?.toLocaleString("tr-TR")} ₺
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {sip.odeme_yontemi === "kredi_karti" ? "💳 Kredi Kartı" : "🏦 Havale/EFT"} ·{" "}
                          {new Date(sip.created_at).toLocaleDateString("tr-TR")}
                        </p>
                        <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 ${DURUM_ETIKETLERI[sip.durum]?.renk || ""}`}>
                          {DURUM_ETIKETLERI[sip.durum]?.label || sip.durum}
                        </span>
                        {sip.red_sebebi && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-xs">❌ {sip.red_sebebi}</p>
                        )}
                      </div>
                    </div>
                    {sip.durum === "onay_bekliyor" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleOnayla(sip.id)}
                          className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Onayla
                        </button>
                        <button onClick={() => { setRedModal({ sipId: sip.id, hayvanId: sip.hayvan_id }); setRedSebebi(""); }}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold flex items-center gap-1">
                          <X size={12} /> Reddet
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
