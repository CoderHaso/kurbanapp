"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Filter, ChevronDown, ChevronUp, RefreshCw,
  Loader2, Users, CheckCircle2, X, Package, Wifi, MapPin, Phone,
  CreditCard, Banknote, Utensils, AlertTriangle, Edit2, Save
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SiparisWithDetay = {
  id: string; durum: string; fiyat: number; created_at: string;
  hisse_no: number | null; ad_soyad: string | null; telefon: string | null;
  adres: string | null; odeme_yontemi: string; kullanici_id: string;
  red_sebebi: string | null; sakatat_tercihi: Record<string, string> | null;
};

type Hayvan = {
  id: number; tip: string; cins: string; tur: string; kilo: number;
  fiyat: number; hisse_sayisi: number; dolu_hisse: number;
  canli_yayin: boolean; helal: boolean; konum: string; kupe: string;
  aktif: boolean; kesim_tarihi: string | null; teslim_tarihi: string | null;
  yayin_url: string | null; auto_onay: boolean; created_at: string;
  siparisler?: SiparisWithDetay[];
};

const DURUM_ETIKETLERI: Record<string, { label: string; renk: string }> = {
  onay_bekliyor: { label: "Onay Bekliyor", renk: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  odeme_bekleniyor: { label: "Ödeme Bekliyor", renk: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  aktif: { label: "Aktif", renk: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  reddedildi: { label: "Reddedildi", renk: "bg-red-500/10 text-red-500 border-red-500/20" },
  kesiliyor: { label: "Kesim Günü 🔪", renk: "bg-red-500/10 text-red-600 border-red-500/20" },
  hazir: { label: "Paketleniyor", renk: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  teslim_edildi: { label: "Teslim Edildi ✅", renk: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
};

const SAKATAT_ISIMLER: Record<string, string> = {
  kelle: "Kelle", paca: "Paça", ciger: "Ciğer", iskembe: "İşkembe", bagirsak: "Bağırsak"
};

export default function AdminIlanlarPage() {
  const router = useRouter();
  const [hayvanlar, setHayvanlar] = useState<Hayvan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [acikIlanId, setAcikIlanId] = useState<number | null>(null);
  const [arama, setArama] = useState("");
  const [filtre, setFiltre] = useState<"hepsi" | "aktif" | "kapali">("hepsi");
  const [durumGuncelleniyor, setDurumGuncelleniyor] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editIlanData, setEditIlanData] = useState<Partial<Hayvan>>({});

  async function fetchData() {
    setYukleniyor(true);
    const { data: ilanlar } = await supabase
      .from("hayvanlar")
      .select("id, tip, cins, tur, kilo, fiyat, hisse_sayisi, dolu_hisse, canli_yayin, helal, konum, kupe, aktif, kesim_tarihi, teslim_tarihi, yayin_url, auto_onay, created_at")
      .order("created_at", { ascending: false });

    const { data: sipData } = await supabase
      .from("siparisler")
      .select("id, durum, fiyat, created_at, hisse_no, ad_soyad, telefon, adres, odeme_yontemi, kullanici_id, red_sebebi, sakatat_tercihi, hayvan_id")
      .order("hisse_no", { ascending: true });

    const ilanlarWithSip = (ilanlar || []).map(ilan => ({
      ...ilan,
      siparisler: (sipData || []).filter((s: any) => s.hayvan_id === ilan.id) as SiparisWithDetay[]
    }));

    setHayvanlar(ilanlarWithSip as Hayvan[]);
    setYukleniyor(false);
  }

  useEffect(() => { fetchData(); }, []);

  const filtreliIlanlar = hayvanlar.filter(h => {
    const aramaUygun = arama === "" ||
      h.kupe.toLowerCase().includes(arama.toLowerCase()) ||
      h.cins.toLowerCase().includes(arama.toLowerCase()) ||
      h.tur.toLowerCase().includes(arama.toLowerCase()) ||
      h.konum.toLowerCase().includes(arama.toLowerCase());
    const filtreUygun = filtre === "hepsi" || (filtre === "aktif" ? h.aktif : !h.aktif);
    return aramaUygun && filtreUygun;
  });

  const handleSiparisDurumGuncelle = async (sipId: string, yeniDurum: string) => {
    setDurumGuncelleniyor(sipId);
    await supabase.from("siparisler").update({ durum: yeniDurum }).eq("id", sipId);
    await fetchData();
    setDurumGuncelleniyor(null);
  };

  const handleIlanGuncelle = async (hayvanId: number) => {
    await supabase.from("hayvanlar").update(editIlanData).eq("id", hayvanId);
    setEditMode(null);
    fetchData();
  };

  return (
    <div className="min-h-screen pb-24 pt-24 px-4 max-w-5xl mx-auto">
      {/* BAŞLIK */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider">İlan Yönetimi 📋</h1>
            <p className="text-[10px] text-[var(--text-secondary)]">Tüm ilanlar, siparişler ve sakatat tercihleri</p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ARAMA & FİLTRE */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input value={arama} onChange={e => setArama(e.target.value)}
            placeholder="Küpe no, cins, şehir ara..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--accent-main)]" />
        </div>
        <div className="flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1">
          {(["hepsi", "aktif", "kapali"] as const).map(f => (
            <button key={f} onClick={() => setFiltre(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filtre === f ? "bg-[var(--accent-main)] text-white" : "text-[var(--text-secondary)]"}`}>
              {f === "hepsi" ? "Tümü" : f === "aktif" ? "Aktif" : "Kapandı"}
            </button>
          ))}
        </div>
      </div>

      {/* ÖZET */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">Toplam İlan</p>
          <p className="text-xl font-black">{hayvanlar.length}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">Toplam Sipariş</p>
          <p className="text-xl font-black">{hayvanlar.reduce((a, h) => a + (h.siparisler?.length || 0), 0)}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">Toplam Ciro</p>
          <p className="text-xl font-black">
            {Math.round(hayvanlar.reduce((a, h) => a + (h.siparisler?.filter(s => s.durum !== "reddedildi").reduce((acc, s) => acc + s.fiyat, 0) || 0), 0) / 1000)}K ₺
          </p>
        </div>
      </div>

      {yukleniyor ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-[var(--accent-main)]" /></div>
      ) : filtreliIlanlar.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-secondary)]">
          <Package size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold">İlan bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtreliIlanlar.map(h => {
            const acik = acikIlanId === h.id;
            const dolulukYuzde = Math.round((h.dolu_hisse / h.hisse_sayisi) * 100);
            const aktifSiparisler = h.siparisler?.filter(s => s.durum !== "reddedildi") || [];

            return (
              <motion.div key={h.id} layout className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                {/* İLAN BAŞLIĞI */}
                <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-primary)] transition-colors"
                  onClick={() => setAcikIlanId(acik ? null : h.id)}>
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-2xl shrink-0">
                    {h.tip === "Büyükbaş" || h.tip === "Buyukbas" ? "🐄" : "🐑"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm">{h.cins} {h.tur}</h3>
                      {h.canli_yayin && (
                        <span className="text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Wifi size={8} /> CANLI
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${h.aktif ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                        {h.aktif ? "Satışta" : "Kapandı"}
                      </span>
                      {h.auto_onay && (
                        <span className="text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded">
                          Oto-Onay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        <MapPin size={9} className="inline mr-0.5" />{h.konum} · {h.kupe}
                      </p>
                    </div>
                    {/* Doluluk bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-main)] rounded-full transition-all" style={{ width: `${dolulukYuzde}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-[var(--text-secondary)]">{h.dolu_hisse}/{h.hisse_sayisi}</span>
                      <span className="text-[9px] font-bold text-[var(--text-secondary)]">{h.fiyat.toLocaleString("tr-TR")} ₺</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-1 rounded-lg">
                      {aktifSiparisler.length} sipariş
                    </span>
                    {acik ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* DETAY PANEL */}
                <AnimatePresence>
                  {acik && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[var(--border-color)] overflow-hidden">
                      <div className="p-4 space-y-4">

                        {/* İLAN BİLGİ GÜNCELLEME */}
                        <div className="bg-[var(--bg-primary)] rounded-xl p-3">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">İlan Detayları</p>
                            {editMode === h.id ? (
                              <div className="flex gap-2">
                                <button onClick={() => setEditMode(null)} className="text-[10px] font-bold text-[var(--text-secondary)] px-2 py-1 rounded border border-[var(--border-color)]">İptal</button>
                                <button onClick={() => handleIlanGuncelle(h.id)} className="text-[10px] font-bold text-white bg-[var(--accent-main)] px-2 py-1 rounded flex items-center gap-1">
                                  <Save size={10} /> Kaydet
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditMode(h.id); setEditIlanData({
                                cins: h.cins, tur: h.tur, kilo: h.kilo, fiyat: h.fiyat,
                                hisse_sayisi: h.hisse_sayisi, konum: h.konum, kupe: h.kupe,
                                kesim_tarihi: h.kesim_tarihi || "", teslim_tarihi: h.teslim_tarihi || "",
                                helal: h.helal, auto_onay: h.auto_onay,
                                yayin_url: h.yayin_url || "", canli_yayin: h.canli_yayin,
                              }); }}  className="text-[10px] font-bold text-[var(--accent-main)] flex items-center gap-1">
                                <Edit2 size={10} /> Düzenle
                              </button>
                            )}
                          </div>
                          {editMode === h.id ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Cins</label>
                                  <input value={editIlanData.cins || ""} onChange={e => setEditIlanData(p => ({ ...p, cins: e.target.value }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Tür</label>
                                  <input value={editIlanData.tur || ""} onChange={e => setEditIlanData(p => ({ ...p, tur: e.target.value }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Kilo (kg)</label>
                                  <input type="number" value={editIlanData.kilo || ""} onChange={e => setEditIlanData(p => ({ ...p, kilo: parseFloat(e.target.value) }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Toplam Fiyat (₺)</label>
                                  <input type="number" value={editIlanData.fiyat || ""} onChange={e => setEditIlanData(p => ({ ...p, fiyat: parseFloat(e.target.value) }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Hisse Sayısı</label>
                                  <input type="number" value={editIlanData.hisse_sayisi || ""} onChange={e => setEditIlanData(p => ({ ...p, hisse_sayisi: parseInt(e.target.value) }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Konum</label>
                                  <input value={editIlanData.konum || ""} onChange={e => setEditIlanData(p => ({ ...p, konum: e.target.value }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Küpe / ID</label>
                                  <input value={editIlanData.kupe || ""} onChange={e => setEditIlanData(p => ({ ...p, kupe: e.target.value }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                                <div></div>
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Kesim Tarihi</label>
                                  <input type="date" value={editIlanData.kesim_tarihi || ""} onChange={e => setEditIlanData(p => ({ ...p, kesim_tarihi: e.target.value }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Teslim Tarihi</label>
                                  <input type="date" value={editIlanData.teslim_tarihi || ""} onChange={e => setEditIlanData(p => ({ ...p, teslim_tarihi: e.target.value }))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                                </div>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">YouTube Yayın URL</label>
                                <input value={editIlanData.yayin_url || ""} onChange={e => setEditIlanData(p => ({ ...p, yayin_url: e.target.value, canli_yayin: e.target.value.trim() !== "" }))}
                                  placeholder="https://youtube.com/live/..."
                                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-main)]" />
                              </div>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={!!editIlanData.helal} onChange={e => setEditIlanData(p => ({ ...p, helal: e.target.checked }))} className="accent-emerald-500" />
                                  <span className="text-xs font-semibold">Helal Kesim</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={!!editIlanData.auto_onay} onChange={e => setEditIlanData(p => ({ ...p, auto_onay: e.target.checked }))} className="accent-blue-500" />
                                  <span className="text-xs font-semibold">Otomatik Onay</span>
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                              {[
                                { label: "Kilo", val: `${h.kilo} kg` },
                                { label: "Karkas", val: h.tip?.includes("kbas") ? `~${Math.round(h.kilo * 0.55)} kg` : `~${Math.round(h.kilo * 0.5)} kg` },
                                { label: "Helal", val: h.helal ? "✅ Evet" : "❌ Hayır" },
                                { label: "Kesim", val: h.kesim_tarihi ? new Date(h.kesim_tarihi).toLocaleDateString("tr-TR") : "-" },
                                { label: "Teslim", val: h.teslim_tarihi ? new Date(h.teslim_tarihi).toLocaleDateString("tr-TR") : "-" },
                                { label: "Oto-Onay", val: h.auto_onay ? "✅ Açık" : "❌ Kapalı" },
                              ].map(item => (
                                <div key={item.label} className="bg-[var(--bg-secondary)] rounded-lg p-2">
                                  <p className="text-[var(--text-secondary)] mb-0.5">{item.label}</p>
                                  <p className="font-bold">{item.val}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* SİPARİŞLER DETAY */}
                        {h.siparisler && h.siparisler.length > 0 ? (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                              Siparişler ({h.siparisler.length})
                            </p>
                            <div className="space-y-2">
                              {h.siparisler.map(sip => (
                                <div key={sip.id} className={`rounded-xl p-3 border ${sip.durum === "reddedildi" ? "bg-red-500/5 border-red-500/20 opacity-60" : "bg-[var(--bg-primary)] border-[var(--border-color)]"}`}>
                                  <div className="flex items-start justify-between gap-2 flex-wrap">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-extrabold">#{sip.hisse_no || "?"}</span>
                                        <span className="text-xs font-semibold">{sip.ad_soyad || "İsimsiz"}</span>
                                        {sip.telefon && (
                                          <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-0.5">
                                            <Phone size={9} /> {sip.telefon}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${DURUM_ETIKETLERI[sip.durum]?.renk || ""}`}>
                                          {DURUM_ETIKETLERI[sip.durum]?.label || sip.durum}
                                        </span>
                                        <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-0.5">
                                          {sip.odeme_yontemi === "kredi_karti" ? <><CreditCard size={9} /> Kart</> : <><Banknote size={9} /> Havale</>}
                                        </span>
                                        <span className="text-[10px] font-bold text-[var(--accent-main)]">{sip.fiyat?.toLocaleString("tr-TR")} ₺</span>
                                        <span className="text-[10px] text-[var(--text-secondary)]">{new Date(sip.created_at).toLocaleDateString("tr-TR")}</span>
                                      </div>
                                      {sip.red_sebebi && (
                                        <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                          <AlertTriangle size={9} /> {sip.red_sebebi}
                                        </p>
                                      )}
                                      {/* Sakatat Tercihleri */}
                                      {sip.sakatat_tercihi && Object.keys(sip.sakatat_tercihi).length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1 flex items-center gap-1">
                                            <Utensils size={8} /> Sakatat Tercihleri
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {Object.entries(sip.sakatat_tercihi).map(([key, val]) => (
                                              <span key={key} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${val === "bagis" ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)]" : "bg-[var(--accent-main)]/10 text-[var(--accent-main)]"}`}>
                                                {SAKATAT_ISIMLER[key] || key}: {val === "bagis" ? "Bağış" : "İstedi"}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {/* Sipariş Durum Güncelleme */}
                                    {sip.durum !== "reddedildi" && (
                                      <div className="shrink-0">
                                        <select
                                          value={sip.durum}
                                          disabled={durumGuncelleniyor === sip.id}
                                          onChange={e => handleSiparisDurumGuncelle(sip.id, e.target.value)}
                                          className="text-[10px] font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[var(--accent-main)] cursor-pointer"
                                        >
                                          {Object.entries(DURUM_ETIKETLERI).filter(([k]) => k !== "reddedildi").map(([k, v]) => (
                                            <option key={k} value={k}>{v.label}</option>
                                          ))}
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-[var(--text-secondary)]">
                            <Users size={24} className="mx-auto mb-2 opacity-20" />
                            <p className="text-xs">Bu ilana henüz sipariş yok.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
