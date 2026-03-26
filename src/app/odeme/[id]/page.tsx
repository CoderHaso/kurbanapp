"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Banknote, ChevronRight, Info, Loader2, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

type Hayvan = {
  id: number; tur: string; cins: string; kupe: string;
  fiyat: number; hisse_sayisi: number; dolu_hisse: number;
  tip: string; auto_onay: boolean;
};

export default function OdemePage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, profil } = useAuth();

  const [hayvan, setHayvan] = useState<Hayvan | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [odemeYontemi, setOdemeYontemi] = useState<"kredi_karti" | "havale">("kredi_karti");
  const [sozlesmeOnay, setSozlesmeOnay] = useState(false);
  const [vekaletOnay, setVekaletOnay] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("hayvanlar").select("id, tur, cins, kupe, fiyat, hisse_sayisi, dolu_hisse, tip, auto_onay")
      .eq("id", id).single().then(({ data }) => {
        setHayvan(data);
        setYukleniyor(false);
      });
  }, [id]);

  const isFormValid = sozlesmeOnay && vekaletOnay;
  const hisseBasi = hayvan ? Math.round(hayvan.fiyat / hayvan.hisse_sayisi) : 0;

  const handleOdeme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !hayvan || !user) return;
    setGonderiliyor(true);
    setHata(null);

    try {
      // Sipariş oluştur
      const yeniDurum = hayvan.auto_onay ? "aktif" : "onay_bekliyor";
      const { error: sipError } = await supabase.from("siparisler").insert({
        kullanici_id: user.id,
        hayvan_id: hayvan.id,
        durum: yeniDurum,
        fiyat: hayvan.tip === "Büyükbaş" ? hisseBasi : hayvan.fiyat,
        odeme_yontemi: odemeYontemi,
        ad_soyad: profil?.ad_soyad || "",
        telefon: profil?.telefon || "",
        adres: profil?.adres || "",
      });

      if (sipError) throw sipError;
      router.push("/kurbanlarim");
    } catch (err: any) {
      setHata(err.message || "Sipariş oluşturulurken hata oluştu.");
    } finally {
      setGonderiliyor(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 max-w-sm">
          <p className="text-2xl mb-4">🔒</p>
          <h2 className="font-bold mb-2">Giriş Yapmanız Gerekiyor</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Sipariş oluşturmak için önce giriş yapın.</p>
          <button onClick={() => router.push("/giris")} className="w-full py-3 rounded-xl bg-[var(--accent-main)] text-white font-bold">Giriş Yap</button>
        </div>
      </div>
    );
  }

  if (yukleniyor) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-[var(--accent-main)]" size={32} /></div>;
  if (!hayvan) return <div className="text-center pt-32 text-[var(--text-secondary)]">İlan bulunamadı.</div>;

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button onClick={() => router.back()} className="flex items-center text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
          <ArrowLeft size={16} className="mr-1" /> Geri Dön
        </button>
        <h1 className="text-2xl font-extrabold">Güvenli Ödeme 🔒</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Sözleşmeleri onaylayıp ödemenizi tamamlayın.</p>
      </motion.div>

      {hata && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl p-3 mb-4 text-sm">
          <AlertCircle size={16} /> {hata}
        </div>
      )}

      <form onSubmit={handleOdeme} className="space-y-6">
        {/* SİPARİŞ ÖZETİ */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-4 pb-2 border-b border-[var(--border-color)]">Sipariş Özeti</h2>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base">{hayvan.tur} <span className="text-[var(--text-secondary)] font-medium">· {hayvan.cins}</span></h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{hayvan.kupe}</p>
              {hayvan.tip === "Büyükbaş" && (
                <span className="inline-block mt-2 text-[10px] uppercase tracking-widest bg-[var(--accent-main)]/10 text-[var(--accent-main)] font-bold px-2 py-0.5 rounded-md">
                  1/{hayvan.hisse_sayisi} Hisse
                </span>
              )}
              {hayvan.auto_onay ? (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500 font-bold">
                  <CheckCircle2 size={12} /> Siparişiniz otomatik onaylanacak
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-500 font-bold">
                  <Info size={12} /> Siparişiniz yönetici onayı bekleyecek
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-1">Toplam Tutar</p>
              <p className="text-2xl font-black text-[var(--accent-main)]">
                {(hayvan.tip === "Büyükbaş" ? hisseBasi : hayvan.fiyat).toLocaleString("tr-TR")} ₺
              </p>
            </div>
          </div>
        </div>

        {/* VEKALET & SÖZLEŞME */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2 pb-2 border-b border-[var(--border-color)] flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-green-500" /> Kanuni Onaylar
          </h2>
          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${vekaletOnay ? "bg-green-500/10 border-green-500" : "bg-[var(--bg-primary)] border-[var(--border-color)]"}`}>
            <div className="mt-0.5 relative w-5 h-5 shrink-0">
              <input type="checkbox" checked={vekaletOnay} onChange={e => setVekaletOnay(e.target.checked)}
                className="peer appearance-none w-5 h-5 rounded-md border-2 border-[var(--text-secondary)] checked:bg-green-500 checked:border-green-500 cursor-pointer" />
              <CheckCircle2 size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
            </div>
            <div>
              <p className={`text-sm font-bold ${vekaletOnay ? "text-green-600 dark:text-green-400" : ""}`}>Kurban vekaletimi veriyorum.</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">Kurbanlığın benim adıma İslami usullere göre kesilmesine KurbanApp'i vekil tayin ediyorum.</p>
            </div>
          </label>
          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${sozlesmeOnay ? "bg-blue-500/10 border-blue-500" : "bg-[var(--bg-primary)] border-[var(--border-color)]"}`}>
            <div className="mt-0.5 relative w-5 h-5 shrink-0">
              <input type="checkbox" checked={sozlesmeOnay} onChange={e => setSozlesmeOnay(e.target.checked)}
                className="peer appearance-none w-5 h-5 rounded-md border-2 border-[var(--text-secondary)] checked:bg-blue-500 checked:border-blue-500 cursor-pointer" />
              <CheckCircle2 size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
            </div>
            <div>
              <p className={`text-sm font-bold ${sozlesmeOnay ? "text-blue-600 dark:text-blue-400" : ""}`}>Hissedar Sözleşmesi'ni okudum, onaylıyorum.</p>
            </div>
          </label>
        </div>

        {/* ÖDEME YÖNTEMİ */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2 pb-2 border-b border-[var(--border-color)]">Ödeme Yöntemi</h2>
          <div className="flex gap-3">
            <button type="button" onClick={() => setOdemeYontemi("kredi_karti")}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${odemeYontemi === "kredi_karti" ? "border-[var(--accent-main)] bg-[var(--accent-main)]/5" : "border-[var(--border-color)] bg-[var(--bg-primary)] grayscale"}`}>
              <CreditCard size={28} className={odemeYontemi === "kredi_karti" ? "text-[var(--accent-main)]" : "text-[var(--text-secondary)]"} />
              <span className={`text-xs font-bold ${odemeYontemi === "kredi_karti" ? "text-[var(--accent-main)]" : "text-[var(--text-secondary)]"}`}>Kredi Kartı</span>
            </button>
            <button type="button" onClick={() => setOdemeYontemi("havale")}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${odemeYontemi === "havale" ? "border-[var(--accent-main)] bg-[var(--accent-main)]/5" : "border-[var(--border-color)] bg-[var(--bg-primary)] grayscale"}`}>
              <Banknote size={28} className={odemeYontemi === "havale" ? "text-[var(--accent-main)]" : "text-[var(--text-secondary)]"} />
              <span className={`text-xs font-bold ${odemeYontemi === "havale" ? "text-[var(--accent-main)]" : "text-[var(--text-secondary)]"}`}>Havale / EFT</span>
            </button>
          </div>

          {odemeYontemi === "kredi_karti" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 space-y-3">
              <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-xl border border-blue-500/20">
                <Info size={16} className="shrink-0" />
                <p className="text-[10px]">Bonus kartlara <strong>Peşin Fiyatına 3 Taksit</strong> imkanı bulunmaktadır.</p>
              </div>
              <input type="text" placeholder="Kart Üzerindeki İsim" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-main)]" />
              <input type="text" placeholder="Kart Numarası" maxLength={19} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-main)] font-mono tracking-widest" />
              <div className="flex gap-3">
                <input type="text" placeholder="AA / YY" maxLength={5} className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-center rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-main)]" />
                <input type="password" placeholder="CVV" maxLength={3} className="w-24 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-center rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-main)]" />
              </div>
            </motion.div>
          )}

          {odemeYontemi === "havale" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[var(--bg-primary)] p-4 rounded-xl border border-dashed border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)] mb-3">Sipariş tutarını 30 dakika içinde aşağıdaki IBAN'a gönderin. Onayınız dekont ulaşınca SMS ile bildirilecektir.</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">TR KUVEYT TÜRK BANKASI</p>
              <p className="font-mono text-sm font-bold mb-2">TR90 0020 5000 0000 1234 5678 01</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-secondary)] mb-1">ALICI ADI</p>
              <p className="font-bold text-sm">KURBANAPP TARIM HAYVANCILIK A.Ş.</p>
            </motion.div>
          )}
        </div>

        <button type="submit" disabled={!isFormValid || gonderiliyor}
          className={`w-full py-4 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 shadow-xl ${isFormValid ? "bg-[var(--accent-main)] hover:bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}>
          {gonderiliyor ? <><Loader2 size={18} className="animate-spin" /> İşleniyor...</> : <>Siparişi Tamamla <ChevronRight size={18} /></>}
        </button>

        <div className="text-center flex items-center justify-center gap-1.5 opacity-60 mt-2">
          <ShieldCheck size={14} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">256-Bit SSL Şifreleme</span>
        </div>
      </form>
    </div>
  );
}
