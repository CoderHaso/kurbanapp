-- ============================================================
-- KURBANAPP SQL — BÖLÜM 3: FONKSİYONLAR & TRIGGER'LAR
-- Bölüm 2'den sonra çalıştır
-- ============================================================

-- 3A. Hisse dolunca hayvanı pasif yap
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

-- 3B. Yeni sipariş girilince dolu_hisse'yi artır
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

-- 3C. Sisteme girilince hisse numarası otomatik ata
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

-- 3D. Admin reddettiğinde dolu_hisse'yi geri al (RPC olarak çağrılır)
CREATE OR REPLACE FUNCTION public.decrement_dolu_hisse(hayvan_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.hayvanlar
  SET dolu_hisse = GREATEST(dolu_hisse - 1, 0)
  WHERE id = hayvan_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
