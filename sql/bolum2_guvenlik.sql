-- ============================================================
-- KURBANAPP SQL — BÖLÜM 2: GÜVENLİK (RLS POLİTİKALARI)
-- Bölüm 1'den sonra çalıştır
-- ============================================================

-- HAYVANLAR RLS
ALTER TABLE public.hayvanlar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hayvanlar herkese açık" ON public.hayvanlar;
CREATE POLICY "Hayvanlar herkese açık" ON public.hayvanlar
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Hayvan ekleme authenticated" ON public.hayvanlar;
CREATE POLICY "Hayvan ekleme authenticated" ON public.hayvanlar
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Hayvan güncelleme authenticated" ON public.hayvanlar;
CREATE POLICY "Hayvan güncelleme authenticated" ON public.hayvanlar
  FOR UPDATE USING (auth.role() = 'authenticated');

-- SİPARİŞLER RLS
ALTER TABLE public.siparisler ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kendi siparişini gör" ON public.siparisler;
CREATE POLICY "Kendi siparişini gör" ON public.siparisler
  FOR SELECT USING (auth.uid() = kullanici_id);

DROP POLICY IF EXISTS "Sipariş oluştur" ON public.siparisler;
CREATE POLICY "Sipariş oluştur" ON public.siparisler
  FOR INSERT WITH CHECK (auth.uid() = kullanici_id);

DROP POLICY IF EXISTS "Sipariş güncelle kendi" ON public.siparisler;
CREATE POLICY "Sipariş güncelle kendi" ON public.siparisler
  FOR UPDATE USING (auth.uid() = kullanici_id);

-- PROFİLLER RLS
ALTER TABLE public.profiller ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kendi profilini gör" ON public.profiller;
CREATE POLICY "Kendi profilini gör" ON public.profiller
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Kendi profilini güncelle" ON public.profiller;
CREATE POLICY "Kendi profilini güncelle" ON public.profiller
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profil oluştur" ON public.profiller;
CREATE POLICY "Profil oluştur" ON public.profiller
  FOR INSERT WITH CHECK (auth.uid() = id);
