-- ============================================================
-- KURBANAPP SQL — BÖLÜM 1: TABLOLAR
-- Supabase SQL Editor → Bu bölümü çalıştır → SUCCESS bekle
-- ============================================================

-- HAYVANLAR tablosu
CREATE TABLE IF NOT EXISTS public.hayvanlar (
  id            BIGSERIAL PRIMARY KEY,
  tip           TEXT NOT NULL DEFAULT 'Büyükbaş',
  cins          TEXT NOT NULL DEFAULT '',
  tur           TEXT NOT NULL DEFAULT '',
  kilo          NUMERIC(6,1) NOT NULL DEFAULT 0,
  fiyat         NUMERIC(12,2) NOT NULL DEFAULT 0,
  hisse_sayisi  INT NOT NULL DEFAULT 1,
  dolu_hisse    INT NOT NULL DEFAULT 0,
  canli_yayin   BOOLEAN NOT NULL DEFAULT FALSE,
  helal         BOOLEAN NOT NULL DEFAULT TRUE,
  konum         TEXT NOT NULL DEFAULT '',
  kupe          TEXT UNIQUE NOT NULL DEFAULT '',
  yas           TEXT,
  cinsiyet      TEXT,
  irk           TEXT,
  aciklama      TEXT,
  whatsapp      TEXT,
  yayin_url     TEXT,
  karkas        NUMERIC(6,1) DEFAULT 0,
  vucut_puani   INT,
  aktif         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  auto_onay     BOOLEAN NOT NULL DEFAULT FALSE,
  kesim_tarihi  DATE,
  paketleme_tarihi DATE,
  kargo_tarihi  DATE,
  teslim_tarihi DATE,
  kargo_takip_no TEXT,
  kargo_firma   TEXT,
  foto_urls     TEXT[] DEFAULT '{}'
);

-- Eksik kolon varsa ekle (tablo önceden oluşturulduysa)
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS auto_onay        BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS kesim_tarihi     DATE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS paketleme_tarihi DATE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS kargo_tarihi     DATE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS teslim_tarihi    DATE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS kargo_takip_no   TEXT;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS kargo_firma      TEXT;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS foto_urls        TEXT[] DEFAULT '{}';

-- SİPARİŞLER tablosu
CREATE TABLE IF NOT EXISTS public.siparisler (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kullanici_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hayvan_id     BIGINT REFERENCES public.hayvanlar(id) ON DELETE RESTRICT,
  hisse_no      INT,
  durum         TEXT NOT NULL DEFAULT 'onay_bekliyor'
                CHECK (durum IN ('onay_bekliyor','odeme_bekleniyor','aktif','kesiliyor','hazir','teslim_edildi')),
  fiyat         NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  ad_soyad      TEXT,
  telefon       TEXT,
  adres         TEXT,
  odeme_yontemi TEXT DEFAULT 'havale',
  bagis_yapildi BOOLEAN DEFAULT FALSE,
  bagis_detay   TEXT,
  sakatat_tercihi JSONB DEFAULT '{"kelle":"bagis","paca":"bagis","ciger":"bagis","iskembe":"bagis","bagirsak":"bagis"}'
);

ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS ad_soyad       TEXT;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS telefon         TEXT;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS adres           TEXT;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS odeme_yontemi   TEXT DEFAULT 'havale';
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS bagis_yapildi   BOOLEAN DEFAULT FALSE;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS bagis_detay     TEXT;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS sakatat_tercihi JSONB DEFAULT '{"kelle":"bagis","paca":"bagis","ciger":"bagis","iskembe":"bagis","bagirsak":"bagis"}';

-- PROFİLLER tablosu
CREATE TABLE IF NOT EXISTS public.profiller (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ad_soyad   TEXT,
  telefon    TEXT,
  adres      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
