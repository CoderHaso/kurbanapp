-- ============================================================
-- KURBANAPP SQL — BÖLÜM 4: AUTH TRIGGER (Profil Oluşturma)
-- Bölüm 3'ten sonra çalıştır
-- NOT: Bu ayrı çalıştırılmalı - auth.users'a trigger atar
-- ============================================================

-- Yeni kullanıcı kaydolunca profiller tablosuna otomatik ekle
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
