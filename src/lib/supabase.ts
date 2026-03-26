import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── TİP TANIMLARI ────────────────────────────────────────
export type Hayvan = {
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
  yas: string;
  cinsiyet: string;
  irk: string;
  aciklama: string;
  whatsapp: string;
  yayin_url: string;
  karkas: number;
  vucut_puani: number;
  aktif: boolean;
  auto_onay: boolean;
  kesim_tarihi: string | null;
  paketleme_tarihi: string | null;
  kargo_tarihi: string | null;
  teslim_tarihi: string | null;
  kargo_takip_no: string | null;
  kargo_firma: string | null;
  foto_urls: string[];
  created_at?: string;
};

export type Siparis = {
  id: string;
  kullanici_id: string;
  hayvan_id: number;
  hisse_no: number | null;
  durum: "onay_bekliyor" | "odeme_bekleniyor" | "aktif" | "kesiliyor" | "hazir" | "teslim_edildi";
  fiyat: number;
  ad_soyad: string | null;
  telefon: string | null;
  adres: string | null;
  sakatat_tercihi: Record<string, string>;
  odeme_yontemi: string;
  bagis_yapildi: boolean;
  bagis_detay: string | null;
  created_at: string;
};

export type Profil = {
  id: string;
  ad_soyad: string | null;
  telefon: string | null;
  adres: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
};
