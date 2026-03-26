-- ============================================================
-- KURBANAPP — MASTER SETUP SQL (İDEMPOTENT)
-- Bu dosyayı Supabase SQL Editor'da tamamen çalıştırın.
-- Varsa geçer, yoksa ekler, hata vermez.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. HAYVANLAR TABLOSU
-- ─────────────────────────────────────────────────────────────
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
  vucut_puani   INT CHECK (vucut_puani BETWEEN 1 AND 5),
  aktif         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Eksik kolonları ekle (varsa hata vermez)
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS auto_onay        BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS kesim_tarihi     DATE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS paketleme_tarihi DATE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS kargo_tarihi     DATE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS teslim_tarihi    DATE;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS kargo_takip_no   TEXT;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS kargo_firma      TEXT;
ALTER TABLE public.hayvanlar ADD COLUMN IF NOT EXISTS foto_urls        TEXT[] DEFAULT '{}';

-- ─────────────────────────────────────────────────────────────
-- 2. SİPARİŞLER TABLOSU
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.siparisler (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kullanici_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hayvan_id    BIGINT REFERENCES public.hayvanlar(id) ON DELETE RESTRICT,
  hisse_no     INT,
  durum        TEXT NOT NULL DEFAULT 'onay_bekliyor'
               CHECK (durum IN ('onay_bekliyor','odeme_bekleniyor','aktif','kesiliyor','hazir','teslim_edildi')),
  fiyat        NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Eksik kolonları ekle
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS ad_soyad      TEXT;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS telefon        TEXT;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS adres          TEXT;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS odeme_yontemi  TEXT DEFAULT 'havale';
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS bagis_yapildi  BOOLEAN DEFAULT FALSE;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS bagis_detay    TEXT;
ALTER TABLE public.siparisler ADD COLUMN IF NOT EXISTS sakatat_tercihi JSONB DEFAULT '{"kelle":"bagis","paca":"bagis","ciger":"bagis","iskembe":"bagis","bagirsak":"bagis"}';

-- ─────────────────────────────────────────────────────────────
-- 3. PROFİLLER TABLOSU
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiller (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ad_soyad   TEXT,
  telefon    TEXT,
  adres      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- HAYVANLAR
ALTER TABLE public.hayvanlar ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='hayvanlar' AND policyname='Hayvanlar herkese açık'
  ) THEN
    CREATE POLICY "Hayvanlar herkese açık" ON public.hayvanlar FOR SELECT USING (TRUE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='hayvanlar' AND policyname='Hayvan ekleme authenticated'
  ) THEN
    CREATE POLICY "Hayvan ekleme authenticated" ON public.hayvanlar FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='hayvanlar' AND policyname='Hayvan güncelleme authenticated'
  ) THEN
    CREATE POLICY "Hayvan güncelleme authenticated" ON public.hayvanlar FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- SİPARİŞLER
ALTER TABLE public.siparisler ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='siparisler' AND policyname='Kendi siparişini gör'
  ) THEN
    CREATE POLICY "Kendi siparişini gör" ON public.siparisler
      FOR SELECT USING (auth.uid() = kullanici_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='siparisler' AND policyname='Sipariş oluştur'
  ) THEN
    CREATE POLICY "Sipariş oluştur" ON public.siparisler
      FOR INSERT WITH CHECK (auth.uid() = kullanici_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='siparisler' AND policyname='Sipariş güncelle kendi'
  ) THEN
    CREATE POLICY "Sipariş güncelle kendi" ON public.siparisler
      FOR UPDATE USING (auth.uid() = kullanici_id);
  END IF;
END $$;

-- PROFİLLER
ALTER TABLE public.profiller ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiller' AND policyname='Kendi profilini gör'
  ) THEN
    CREATE POLICY "Kendi profilini gör" ON public.profiller FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiller' AND policyname='Kendi profilini güncelle'
  ) THEN
    CREATE POLICY "Kendi profilini güncelle" ON public.profiller FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiller' AND policyname='Profil oluştur'
  ) THEN
    CREATE POLICY "Profil oluştur" ON public.profiller FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 5. FONKSİYONLAR VE TRIGGER'LAR
-- ─────────────────────────────────────────────────────────────

-- 5A. Hisse dolulukta aktif bayrağı güncelle
CREATE OR REPLACE FUNCTION public.check_hisse_doluluk()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dolu_hisse >= NEW.hisse_sayisi THEN
    NEW.aktif := FALSE;
  ELSE
    NEW.aktif := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_hisse ON public.hayvanlar;
CREATE TRIGGER trg_check_hisse
  BEFORE INSERT OR UPDATE ON public.hayvanlar
  FOR EACH ROW EXECUTE FUNCTION public.check_hisse_doluluk();

-- 5B. Yeni kayıtta otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiller (id, ad_soyad, telefon)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'ad_soyad',
    NEW.raw_user_meta_data->>'telefon'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5C. Sipariş eklenince dolu_hisse artır
CREATE OR REPLACE FUNCTION public.increment_dolu_hisse()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.hayvanlar
  SET dolu_hisse = dolu_hisse + 1
  WHERE id = NEW.hayvan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_hisse ON public.siparisler;
CREATE TRIGGER trg_increment_hisse
  AFTER INSERT ON public.siparisler
  FOR EACH ROW EXECUTE FUNCTION public.increment_dolu_hisse();

-- 5D. Hisse numarası otomatik ata
CREATE OR REPLACE FUNCTION public.assign_hisse_no()
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
  FOR EACH ROW EXECUTE FUNCTION public.assign_hisse_no();

-- 5E. Admin sipariş reddedince dolu_hisse geri al
CREATE OR REPLACE FUNCTION public.decrement_dolu_hisse(hayvan_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.hayvanlar
  SET dolu_hisse = GREATEST(dolu_hisse - 1, 0)
  WHERE id = hayvan_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 6. ÖRNEK VERİ — Sadece hayvanlar tablosu boşsa ekle
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.hayvanlar LIMIT 1) THEN
    INSERT INTO public.hayvanlar
      (tip, cins, tur, kilo, fiyat, hisse_sayisi, dolu_hisse, canli_yayin, helal, konum, kupe,
       yas, cinsiyet, irk, aciklama, whatsapp, yayin_url, karkas, vucut_puani, aktif,
       kesim_tarihi, teslim_tarihi)
    VALUES
      ('Büyükbaş','Simental','Dana',640,128000,7,4,TRUE,TRUE,'Konya','TR-2026-0145',
       '2.5 Yaş','Erkek','Simental x Holstein','Doğal ortamda büyütülmüş. Helal kesim belgeli.',
       '905551234567','https://www.youtube.com/watch?v=Odt0ixuucfc',350,4,TRUE,
       '2026-06-06','2026-06-10'),

      ('Büyükbaş','Montofon','İnek',580,116000,7,7,FALSE,TRUE,'Ankara','TR-2026-0201',
       '4 Yaş','Dişi','Montofon','Tam dolu, hisse alımı kapalı.',
       '905559876543',NULL,310,3,FALSE,
       '2026-06-06','2026-06-10'),

      ('Küçükbaş','Kıvırcık','Koç',68,19500,1,0,TRUE,TRUE,'Bursa','TR-2026-0310',
       '3 Yaş','Erkek','Kıvırcık','Organik besili, doğal otlakta yetiştirilmiş.',
       '905553334455','https://www.youtube.com/watch?v=Odt0ixuucfc',38,4,TRUE,
       '2026-06-06','2026-06-10'),

      ('Küçükbaş','Merinos','Koyun',54,15000,1,0,FALSE,TRUE,'İzmir','TR-2026-0402',
       '2 Yaş','Dişi','Merinos','İzmir köy meralarında yetiştirilmiştir.',
       '905557778899',NULL,28,3,TRUE,
       '2026-06-07','2026-06-11'),

      ('Büyükbaş','Angus','Düve',510,102000,5,2,TRUE,TRUE,'Konya','TR-2026-0521',
       '2 Yaş','Dişi','Angus','Premium Angus cinsi, yüksek et verimi.',
       '905552223344','https://www.youtube.com/watch?v=Odt0ixuucfc',280,4,TRUE,
       '2026-06-06','2026-06-10'),

      ('Küçükbaş','İvesi','Keçi',42,11200,1,0,FALSE,TRUE,'Gaziantep','TR-2026-0687',
       '1.5 Yaş','Erkek','İvesi','Güneydoğunun meşhur İvesi keçisi.',
       '905556667788',NULL,22,3,TRUE,
       '2026-06-07','2026-06-11'),

      ('Büyükbaş','Holstein','Dana',480,96000,6,1,FALSE,TRUE,'Antalya','TR-2026-0733',
       '2 Yaş','Erkek','Holstein','Sağlıklı, verimli bir Holstein danası.',
       '905551112233',NULL,260,3,TRUE,
       '2026-06-06','2026-06-10'),

      ('Küçükbaş','Kangal','Koç',75,22000,1,0,TRUE,TRUE,'Sivas','TR-2026-0811',
       '3 Yaş','Erkek','Kangal Akkaraman','Sivas yaylalarında yetiştirilmiştir.',
       '905554445566','https://www.youtube.com/watch?v=Odt0ixuucfc',42,4,TRUE,
       '2026-06-07','2026-06-11');

    RAISE NOTICE 'Örnek hayvan verileri eklendi.';
  ELSE
    RAISE NOTICE 'Hayvanlar tablosunda zaten veri var, örnek veri eklenmedi.';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 7. DOĞRULAMA — Kurulumun başarılı olduğunu kontrol et
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  hayvan_say INT;
  trigger_say INT;
BEGIN
  SELECT COUNT(*) INTO hayvan_say FROM public.hayvanlar;
  SELECT COUNT(*) INTO trigger_say FROM information_schema.triggers
    WHERE trigger_schema = 'public' OR event_object_schema = 'public';

  RAISE NOTICE '──────────────────────────────────────';
  RAISE NOTICE 'KURBANAPP KURULUM KONTROLÜ';
  RAISE NOTICE '──────────────────────────────────────';
  RAISE NOTICE 'hayvanlar tablosu: % kayıt', hayvan_say;
  RAISE NOTICE 'siparisler tablosu: OK';
  RAISE NOTICE 'profiller tablosu: OK';
  RAISE NOTICE 'Toplam trigger sayısı: %', trigger_say;
  RAISE NOTICE '──────────────────────────────────────';
  RAISE NOTICE '✅ Kurulum tamamlandı!';
  RAISE NOTICE '';
  RAISE NOTICE 'Yapılacak manuel adımlar:';
  RAISE NOTICE '1. Supabase → Authentication → Settings → "Confirm email" = KAPALI';
  RAISE NOTICE '2. Supabase → Storage → photos bucket → Public = AÇIK';
  RAISE NOTICE '──────────────────────────────────────';
END $$;
