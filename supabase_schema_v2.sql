-- =============================================
-- KURBANAPP — SUPABASE ŞEMA GÜNCELLEMESİ v2
-- Bu SQL'i Supabase Dashboard → SQL Editor'da çalıştır
-- =============================================

-- 1. HAYVANLAR tablosuna yeni sütunlar ekle
ALTER TABLE public.hayvanlar
  ADD COLUMN IF NOT EXISTS auto_onay BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kesim_tarihi DATE,
  ADD COLUMN IF NOT EXISTS paketleme_tarihi DATE,
  ADD COLUMN IF NOT EXISTS kargo_tarihi DATE,
  ADD COLUMN IF NOT EXISTS teslim_tarihi DATE,
  ADD COLUMN IF NOT EXISTS kargo_takip_no TEXT,
  ADD COLUMN IF NOT EXISTS kargo_firma TEXT,
  ADD COLUMN IF NOT EXISTS foto_urls TEXT[] DEFAULT '{}';

-- 2. SİPARİŞLER tablosuna yeni sütunlar ekle
ALTER TABLE public.siparisler
  ADD COLUMN IF NOT EXISTS ad_soyad TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS adres TEXT,
  ADD COLUMN IF NOT EXISTS sakatat_tercihi JSONB DEFAULT '{"kelle":"bagis","paca":"bagis","ciger":"bagis","iskembe":"bagis","bagirsak":"bagis"}',
  ADD COLUMN IF NOT EXISTS odeme_yontemi TEXT DEFAULT 'havale',
  ADD COLUMN IF NOT EXISTS bagis_yapildi BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bagis_detay TEXT,
  ADD COLUMN IF NOT EXISTS hisse_no INT;

-- 3. PROFİLLER tablosu — Supabase Auth kullanıcılarıyla 1:1 eşleşir
CREATE TABLE IF NOT EXISTS public.profiller (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ad_soyad TEXT,
  telefon TEXT,
  adres TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profil tablosu Row Level Security
ALTER TABLE public.profiller ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kendi profilini gör" ON public.profiller
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Kendi profilini güncelle" ON public.profiller
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profil oluştur" ON public.profiller
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Yeni kullanıcı kaydında otomatik profil oluştur (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiller (id, ad_soyad, telefon)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'ad_soyad',
    NEW.raw_user_meta_data->>'telefon'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Siparişlerde hisse_no otomatik atama fonksiyonu
CREATE OR REPLACE FUNCTION assign_hisse_no()
RETURNS TRIGGER AS $$
DECLARE
  max_hisse INT;
BEGIN
  SELECT COALESCE(MAX(hisse_no), 0) INTO max_hisse
  FROM public.siparisler
  WHERE hayvan_id = NEW.hayvan_id;

  NEW.hisse_no := max_hisse + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_hisse ON public.siparisler;
CREATE TRIGGER trg_assign_hisse
  BEFORE INSERT ON public.siparisler
  FOR EACH ROW EXECUTE FUNCTION assign_hisse_no();

-- 6. Sipariş onaylanınca hayvanın dolu_hisse sayısını artır
CREATE OR REPLACE FUNCTION increment_dolu_hisse()
RETURNS TRIGGER AS $$
BEGIN
  -- Yeni sipariş eklenince veya durum aktif/onaylandı olunca hisse sayısını artır
  IF TG_OP = 'INSERT' THEN
    UPDATE public.hayvanlar
    SET dolu_hisse = dolu_hisse + 1
    WHERE id = NEW.hayvan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_hisse ON public.siparisler;
CREATE TRIGGER trg_increment_hisse
  AFTER INSERT ON public.siparisler
  FOR EACH ROW EXECUTE FUNCTION increment_dolu_hisse();

-- 7. Siparişler RLS — kullanıcı kendi siparişini görsün, admin hepsini
DROP POLICY IF EXISTS "Kendi siparişini gör" ON public.siparisler;
DROP POLICY IF EXISTS "Sipariş oluştur" ON public.siparisler;

CREATE POLICY "Kendi siparişini gör" ON public.siparisler
  FOR SELECT USING (auth.uid() = kullanici_id OR auth.role() = 'service_role');
CREATE POLICY "Sipariş oluştur" ON public.siparisler
  FOR INSERT WITH CHECK (auth.uid() = kullanici_id);
CREATE POLICY "Admin güncelle" ON public.siparisler
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = kullanici_id);

-- 8. Hayvanlar — kimlik doğrulamalı kullanıcı ekleyebilsin
DROP POLICY IF EXISTS "Hayvan ekleme servis rolü" ON public.hayvanlar;
CREATE POLICY "Hayvan ekleme authenticated" ON public.hayvanlar
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Hayvan güncelleme authenticated" ON public.hayvanlar
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 9. Photos bucket RLS — kimliği doğrulanmış kullanıcılar yükleyebilsin
-- (Supabase Dashboard > Storage > photos > Policies'den de yapılabilir)
-- Bucket'ı public yap: Dashboard > Storage > photos > Make Public

-- 10. Mevcut test verisini güncelle (auto_onay, tarih bilgileri ekle)
-- 11. Admin sipariş reddedince dolu_hisse'yi geri al
CREATE OR REPLACE FUNCTION public.decrement_dolu_hisse(hayvan_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.hayvanlar
  SET dolu_hisse = GREATEST(dolu_hisse - 1, 0)
  WHERE id = hayvan_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

