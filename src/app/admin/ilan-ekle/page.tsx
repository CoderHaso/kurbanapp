"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Video, FileText, CheckCircle2, ChevronDown, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Özel animasyonlu Dropdown
const CustomSelect = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-[var(--accent-main)] transition-colors shadow-sm">
        <span>{value}</span>
        <ChevronDown size={16} className={`text-[var(--text-secondary)] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 w-full mt-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl">
            {options.map((opt) => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-3 font-bold transition-colors hover:bg-[var(--bg-secondary)] ${value === opt ? "text-[var(--accent-main)] bg-[var(--accent-main)]/5" : "text-[var(--text-primary)]"}`}>
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function IlanEklePage() {
  const router = useRouter();
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [fotoler, setFotoler] = useState<File[]>([]);
  const [fotoOnizleme, setFotoOnizleme] = useState<string[]>([]);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const [form, setForm] = useState({
    tip: "Büyükbaş", kategori: "Dana", cins: "Simental",
    kilo: "", fiyat: "", hisseSayisi: 7, kupe: "TR-2026-",
    yas: "", cinsiyet: "Erkek", aciklama: "", whatsapp: "",
    yayinUrl: "", karkas: "", auto_onay: false,
    kesim_tarihi: "", paketleme_tarihi: "", kargo_tarihi: "", teslim_tarihi: ""
  });

  const isBüyükbaş = form.tip === "Büyükbaş";

  const handleFotoSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFotoler(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setFotoOnizleme(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleFotoSil = (idx: number) => {
    setFotoler(prev => prev.filter((_, i) => i !== idx));
    setFotoOnizleme(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);
    setKaydediliyor(true);

    try {
      // 1. Fotoğrafları yükle
      const fotoUrls: string[] = [];
      for (const foto of fotoler) {
        const ext = foto.name.split(".").pop();
        const path = `hayvanlar/${form.kupe}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("photos").upload(path, foto, { upsert: true });
        if (!uploadError) {
          const { data } = supabase.storage.from("photos").getPublicUrl(path);
          fotoUrls.push(data.publicUrl);
        }
      }

      // 2. Hayvanı DB'ye ekle
      const { error } = await supabase.from("hayvanlar").insert({
        tip: form.tip,
        tur: form.kategori,
        cins: form.cins,
        kilo: parseFloat(form.kilo) || 0,
        fiyat: parseFloat(form.fiyat) || 0,
        hisse_sayisi: isBüyükbaş ? form.hisseSayisi : 1,
        dolu_hisse: 0,
        canli_yayin: form.yayinUrl.trim() !== "",
        helal: true,
        konum: "Türkiye",
        kupe: form.kupe,
        yas: form.yas,
        cinsiyet: form.cinsiyet,
        aciklama: form.aciklama,
        whatsapp: form.whatsapp,
        yayin_url: form.yayinUrl,
        karkas: parseFloat(form.karkas) || 0,
        auto_onay: form.auto_onay,
        kesim_tarihi: form.kesim_tarihi || null,
        paketleme_tarihi: form.paketleme_tarihi || null,
        kargo_tarihi: form.kargo_tarihi || null,
        teslim_tarihi: form.teslim_tarihi || null,
        foto_urls: fotoUrls,
        aktif: true,
      });

      if (error) throw error;
      router.push("/admin/dashboard");
    } catch (err: any) {
      setHata(err.message || "Bir hata oluştu.");
    } finally {
      setKaydediliyor(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-24 px-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-2 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wider">YENİ İLAN EKLE</h1>
        <div className="w-10" />
      </div>

      {hata && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl p-3 mb-4 text-sm">
          <X size={16} /> {hata}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TEMEL BİLGİLER */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-2 border-b border-[var(--border-color)]">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect label="Hayvan Tipi" value={form.tip} options={["Büyükbaş", "Küçükbaş"]}
              onChange={(val) => setForm({...form, tip: val, kategori: val === "Büyükbaş" ? "Dana" : "Koç"})} />
            <CustomSelect label="Kategori (Tür)" value={form.kategori}
              options={isBüyükbaş ? ["Dana", "Düve", "İnek"] : ["Koç", "Koyun", "Kuzu", "Keçi"]}
              onChange={(val) => setForm({...form, kategori: val})} />
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">Cins</label>
              <input type="text" value={form.cins} onChange={e => setForm({...form, cins: e.target.value})} placeholder="Simental, Kıvırcık..." required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-[var(--accent-main)] shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">Küpe No</label>
              <input type="text" value={form.kupe} onChange={e => setForm({...form, kupe: e.target.value})} required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-[var(--accent-main)] shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">Yaş</label>
              <input type="text" value={form.yas} onChange={e => setForm({...form, yas: e.target.value})} placeholder="2.5 Yaş"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-[var(--accent-main)] shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">WhatsApp</label>
              <input type="text" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="905551234567"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-[var(--accent-main)] shadow-sm" />
            </div>
          </div>
        </div>

        {/* FİYAT & HİSSE */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-2 border-b border-[var(--border-color)]">Fiyat & Kapasite</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">Kilo (kg)</label>
              <input type="number" value={form.kilo} onChange={e => setForm({...form, kilo: e.target.value})} placeholder="650" required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-[var(--accent-main)] shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">Karkas (kg)</label>
              <input type="number" value={form.karkas} onChange={e => setForm({...form, karkas: e.target.value})} placeholder="350"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-[var(--accent-main)] shadow-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">Satış Fiyatı (₺)</label>
            <input type="number" value={form.fiyat} onChange={e => setForm({...form, fiyat: e.target.value})} placeholder="120000" required
              className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl py-3 px-4 font-black focus:outline-none focus:border-emerald-500 shadow-sm" />
          </div>
          {isBüyükbaş && (
            <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)]">
              <div className="flex justify-between mb-3">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Hisse Kapasitesi</label>
                <span className="bg-[var(--accent-main)] text-white text-[10px] font-bold px-2 py-1 rounded-md">1/{form.hisseSayisi} Hisse</span>
              </div>
              <input type="range" min="1" max="7" value={form.hisseSayisi}
                onChange={e => setForm({...form, hisseSayisi: parseInt(e.target.value)})}
                className="w-full accent-[var(--accent-main)]" />
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)] mt-2 font-bold">
                {[1,2,3,4,5,6,7].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* SİPARİŞ ONAY AYARI */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-2 border-b border-[var(--border-color)]">Sipariş Onay Yöntemi</h2>
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.auto_onay ? "bg-blue-500/10 border-blue-500" : "bg-[var(--bg-primary)] border-[var(--border-color)]"}`}>
            <div className="relative w-5 h-5 shrink-0">
              <input type="checkbox" checked={form.auto_onay} onChange={e => setForm({...form, auto_onay: e.target.checked})}
                className="peer appearance-none w-5 h-5 rounded-md border-2 border-[var(--text-secondary)] checked:bg-blue-500 checked:border-blue-500 cursor-pointer" />
              <CheckCircle2 size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
            </div>
            <div>
              <p className="font-bold text-sm">Otomatik Onay Aktif</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Açık ise satın alma sonrası onay gerekmez, sipariş direkt aktive olur. Kapalı ise admin onayı beklenir.</p>
            </div>
          </label>
        </div>

        {/* KESİM TAKVİMİ */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-2 border-b border-[var(--border-color)]">Kesim & Teslimat Takvimi</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "kesim_tarihi", label: "Kesim Tarihi" },
              { key: "paketleme_tarihi", label: "Paketleme Tarihi" },
              { key: "kargo_tarihi", label: "Kargoya Verilme" },
              { key: "teslim_tarihi", label: "Tahmini Teslim" },
            ].map(({key, label}) => (
              <div key={key}>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">{label}</label>
                <input type="date" value={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 font-bold focus:outline-none focus:border-[var(--accent-main)] shadow-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* FOTOĞRAF YÜKLEME */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-2 border-b border-[var(--border-color)]">Medya & Belgeler</h2>

          <input ref={fotoInputRef} type="file" multiple accept="image/*" onChange={handleFotoSec} className="hidden" />

          {fotoOnizleme.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {fotoOnizleme.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleFotoSil(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={() => fotoInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] rounded-2xl h-20 flex flex-col justify-center items-center text-[var(--text-secondary)] hover:text-[var(--accent-main)] hover:border-[var(--accent-main)]/50 transition-all">
            <Camera size={24} className="mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Fotoğraf Seç ({fotoler.length} seçildi)</span>
          </button>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">Canlı Yayın / Video Linki</label>
            <div className="relative">
              <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input type="url" value={form.yayinUrl} onChange={e => setForm({...form, yayinUrl: e.target.value})}
                placeholder="https://youtube.com/live/..."
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-[var(--accent-main)] shadow-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 ml-1">Açıklama</label>
            <textarea value={form.aciklama} onChange={e => setForm({...form, aciklama: e.target.value})}
              rows={3} placeholder="Hayvan hakkında detaylı bilgi..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 focus:outline-none focus:border-[var(--accent-main)] shadow-sm resize-none" />
          </div>
        </div>

        <button type="submit" disabled={kaydediliyor}
          className="w-full py-4 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:bg-black hover:scale-[1.02] shadow-xl disabled:opacity-60">
          {kaydediliyor ? <><Loader2 size={20} className="animate-spin" /> Kaydediliyor...</> : <><CheckCircle2 size={20} /> İlanı Yayınla</>}
        </button>
      </form>
    </div>
  );
}
