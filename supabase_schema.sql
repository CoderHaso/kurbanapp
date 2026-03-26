-- =============================================
-- KURBANAPP — SUPABASE VERİTABANI ŞEMASI
-- Bu SQL'i Supabase Dashboard → SQL Editor'da çalıştır
-- =============================================

-- 1. HAYVANLAR Tablosu (ilanlar)
CREATE TABLE IF NOT EXISTS public.hayvanlar (
  id BIGSERIAL PRIMARY KEY,
  tip TEXT NOT NULL CHECK (tip IN ('Büyükbaş', 'Küçükbaş')),
  cins TEXT NOT NULL,
  tur TEXT NOT NULL,
  kilo NUMERIC(6,1) NOT NULL,
  fiyat NUMERIC(12,2) NOT NULL,
  hisse_sayisi INT NOT NULL DEFAULT 1,
  dolu_hisse INT NOT NULL DEFAULT 0,
  canli_yayin BOOLEAN NOT NULL DEFAULT FALSE,
  helal BOOLEAN NOT NULL DEFAULT TRUE,
  konum TEXT NOT NULL,
  kupe TEXT UNIQUE NOT NULL,
  yas TEXT,
  cinsiyet TEXT,
  irk TEXT,
  aciklama TEXT,
  whatsapp TEXT,
  yayin_url TEXT,
  karkas NUMERIC(6,1),
  vucut_puani INT CHECK (vucut_puani BETWEEN 1 AND 5),
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HAYVANLAR — Satılan hayvanı otomatik pasif yap (Trigger)
CREATE OR REPLACE FUNCTION check_hisse_doluluk()
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
  FOR EACH ROW EXECUTE FUNCTION check_hisse_doluluk();

-- 3. SİPARİŞLER Tablosu
CREATE TABLE IF NOT EXISTS public.siparisler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kullanici_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hayvan_id BIGINT REFERENCES public.hayvanlar(id) ON DELETE RESTRICT,
  hisse_no INT,
  durum TEXT NOT NULL DEFAULT 'onay_bekliyor'
    CHECK (durum IN ('onay_bekliyor','odeme_bekleniyor','aktif','kesiliyor','hazir','teslim_edildi')),
  fiyat NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Row Level Security (RLS) — Herkese okuma, sadece yetkililere yazma
ALTER TABLE public.hayvanlar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hayvanlar herkese açık" ON public.hayvanlar
  FOR SELECT USING (TRUE);
CREATE POLICY "Hayvan ekleme servis rolü" ON public.hayvanlar
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

ALTER TABLE public.siparisler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kendi siparişini gör" ON public.siparisler
  FOR SELECT USING (auth.uid() = kullanici_id);
CREATE POLICY "Sipariş oluştur" ON public.siparisler
  FOR INSERT WITH CHECK (auth.uid() = kullanici_id);

-- 5. TEST VERİSİ EKLE (isteğe bağlı)
INSERT INTO public.hayvanlar
  (tip, cins, tur, kilo, fiyat, hisse_sayisi, dolu_hisse, canli_yayin, helal, konum, kupe, yas, cinsiyet, irk, aciklama, whatsapp, yayin_url, karkas, vucut_puani)
VALUES
  ('Büyükbaş','Simental','Dana',640,128000,7,4,TRUE,TRUE,'Konya','TR-2024-0145','2.5 Yaş','Erkek','Simental x Holstein','Doğal ortamda büyütülmüş. Helal kesim belgeli.','905551234567','live',350,4),
  ('Büyükbaş','Montofon','İnek',580,116000,7,7,FALSE,TRUE,'Ankara','TR-2024-0201','4 Yaş','Dişi','Montofon','Tam dolu, hisse alımı kapalı.','905559876543','',310,3),
  ('Küçükbaş','Kıvırcık','Koç',68,19500,1,0,TRUE,TRUE,'Bursa','TR-2024-0310','3 Yaş','Erkek','Kıvırcık','Organik besili, doğal otlakta yetiştirilmiş.','905553334455','',38,4),
  ('Küçükbaş','Merinos','Koyun',54,15000,1,0,FALSE,TRUE,'İzmir','TR-2024-0402','2 Yaş','Dişi','Merinos','İzmir köy meralarında yetiştirilmiştir.','905557778899','',28,3),
  ('Büyükbaş','Angus','Düve',510,102000,5,2,TRUE,TRUE,'Konya','TR-2024-0521','2 Yaş','Dişi','Angus','Premium Angus cinsi, yüksek et verimi.','905552223344','',280,4),
  ('Küçükbaş','İvesi','Keçi',42,11200,1,0,FALSE,TRUE,'Gaziantep','TR-2024-0687','1.5 Yaş','Erkek','İvesi','Güneydoğunun meşhur İvesi keçisi.','905556667788','',22,3),
  ('Büyükbaş','Holstein','Dana',480,96000,6,1,FALSE,TRUE,'Antalya','TR-2024-0733','2 Yaş','Erkek','Holstein','Sağlıklı, verimli bir Holstein danası.','905551112233','',260,3),
  ('Küçükbaş','Kangal','Koç',75,22000,1,0,TRUE,TRUE,'Sivas','TR-2024-0811','3 Yaş','Erkek','Kangal Akkaraman','Sivas yaylalarında yetiştirilmiştir.','905554445566','',42,4);
