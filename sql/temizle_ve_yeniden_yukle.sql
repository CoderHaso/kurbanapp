-- ============================================================
-- KURBANAPP — VERİ TEMİZLEME + 25 TEMİZ İLAN
-- UYARI: Tüm mevcut hayvanlar ve siparişler silinir!
-- Supabase SQL Editor'da çalıştır.
-- ============================================================

-- 1. Önce siparişleri sil (foreign key önce)
DELETE FROM public.siparisler;

-- 2. Hayvanları sil
DELETE FROM public.hayvanlar;

-- 3. Sequence'i sıfırla (id 1'den başlasın)
ALTER SEQUENCE public.hayvanlar_id_seq RESTART WITH 1;

-- 4. 25 temiz ilan ekle (sıfır satın alma, sıfır hisse dolu)
INSERT INTO public.hayvanlar
  (tip, cins, tur, kilo, fiyat, hisse_sayisi, dolu_hisse,
   canli_yayin, helal, konum, kupe, yas, cinsiyet, irk,
   aciklama, whatsapp, yayin_url, karkas, vucut_puani, aktif,
   kesim_tarihi, teslim_tarihi, auto_onay)
VALUES
-- BÜYÜKBAŞ (15 adet)
('Büyükbaş','Simental','Dana',680,136000,7,0,FALSE,TRUE,'Konya','TR-2026-A001','2.5 Yaş','Erkek','Simental x Holstein','Doğal ortamda yetiştirilmiş, sağlık sertifikalı.','905551234567',NULL,374,5,TRUE,'2026-06-06','2026-06-10',FALSE),
('Büyükbaş','Montofon','İnek',610,122000,7,0,FALSE,TRUE,'Ankara','TR-2026-A002','3 Yaş','Dişi','Montofon','Süt verimi yüksek, şişman ve sağlıklı.','905552345678',NULL,336,4,TRUE,'2026-06-06','2026-06-10',FALSE),
('Büyükbaş','Angus','Dana',590,118000,7,0,TRUE,TRUE,'Bursa','TR-2026-A003','2 Yaş','Erkek','Angus','Premium Angus, yüksek kaliteli et.','905553456789','https://www.youtube.com/watch?v=Odt0ixuucfc',325,5,TRUE,'2026-06-07','2026-06-11',FALSE),
('Büyükbaş','Holstein','İnek',560,112000,7,0,FALSE,TRUE,'İstanbul','TR-2026-A004','4 Yaş','Dişi','Holstein','Her iki ırk için ideal, sağlıklı.','905554567890',NULL,308,4,TRUE,'2026-06-07','2026-06-11',TRUE),
('Büyükbaş','Simental','Düve',520,104000,7,0,FALSE,TRUE,'İzmir','TR-2026-A005','1.5 Yaş','Dişi','Simental','Genç ve sağlıklı düve.','905555678901',NULL,286,4,TRUE,'2026-06-06','2026-06-10',TRUE),
('Büyükbaş','Charolais','Dana',700,140000,7,0,TRUE,TRUE,'Samsun','TR-2026-A006','3 Yaş','Erkek','Charolais','Büyük ve etli, Fransa orijinli ırk.','905556789012','https://www.youtube.com/watch?v=Odt0ixuucfc',385,5,TRUE,'2026-06-08','2026-06-12',FALSE),
('Büyükbaş','Limousin','Dana',650,130000,7,0,FALSE,TRUE,'Kayseri','TR-2026-A007','2.5 Yaş','Erkek','Limousin','Et kalitesi üstün Fransız ırkı.','905557890123',NULL,358,5,TRUE,'2026-06-06','2026-06-10',FALSE),
('Büyükbaş','Montofon','Dana',630,126000,7,0,FALSE,TRUE,'Trabzon','TR-2026-A008','2 Yaş','Erkek','Montofon','Karadeniz bölgesinde yetiştirilmiş.','905558901234',NULL,347,4,TRUE,'2026-06-07','2026-06-11',TRUE),
('Büyükbaş','Simental','İnek',580,116000,7,0,TRUE,TRUE,'Erzurum','TR-2026-A009','5 Yaş','Dişi','Simental x Yerli','Doğu Anadolu yaylaları.','905559012345','https://www.youtube.com/watch?v=Odt0ixuucfc',319,4,TRUE,'2026-06-06','2026-06-10',FALSE),
('Büyükbaş','Yerli Kara','Dana',490,98000,7,0,FALSE,TRUE,'Diyarbakır','TR-2026-A010','2 Yaş','Erkek','Yerli Kara','Güneydoğu damızlık.','905551123456',NULL,270,3,TRUE,'2026-06-08','2026-06-12',TRUE),
('Büyükbaş','Angus','Düve',540,108000,5,0,FALSE,TRUE,'Adana','TR-2026-A011','2 Yaş','Dişi','Angus x Simental','5 hisselik küçük grup için ideal.','905552234567',NULL,297,4,TRUE,'2026-06-07','2026-06-11',FALSE),
('Büyükbaş','Holstein','Dana',600,120000,7,0,TRUE,TRUE,'Tekirdağ','TR-2026-A012','2.5 Yaş','Erkek','Holstein','Marmara bölgesi besiciliği.','905553345678','https://www.youtube.com/watch?v=Odt0ixuucfc',330,4,TRUE,'2026-06-06','2026-06-10',TRUE),
('Büyükbaş','Charolais','İnek',660,132000,7,0,FALSE,TRUE,'Balıkesir','TR-2026-A013','3.5 Yaş','Dişi','Charolais','Batı Anadolu meraları.','905554456789',NULL,363,5,TRUE,'2026-06-07','2026-06-11',FALSE),
('Büyükbaş','Simmental','Dana',710,142000,7,0,TRUE,TRUE,'Konya','TR-2026-A014','3 Yaş','Erkek','Simmental','Konya ovalarında yetişti.','905555567890','https://www.youtube.com/watch?v=Odt0ixuucfc',391,5,TRUE,'2026-06-06','2026-06-10',FALSE),
('Büyükbaş','Yerli Sarı','Dana',470,94000,3,0,FALSE,TRUE,'Kastamonu','TR-2026-A015','2 Yaş','Erkek','Yerli Sarı','3 hisselik küçük büyükbaş.','905556678901',NULL,259,3,TRUE,'2026-06-08','2026-06-12',TRUE),

-- KÜÇÜKBAŞ (10 adet)
('Küçükbaş','Kıvırcık','Koç',72,21600,1,0,FALSE,TRUE,'Bursa','TR-2026-B001','3 Yaş','Erkek','Kıvırcık','Bursa yöresinin meşhur Kıvırcık koçu.','905557789012',NULL,40,4,TRUE,'2026-06-06','2026-06-10',TRUE),
('Küçükbaş','Merinos','Koyun',58,16000,1,0,FALSE,TRUE,'Eskişehir','TR-2026-B002','2 Yaş','Dişi','Merinos','Merinos x Kıvırcık melezi.','905558890123',NULL,32,3,TRUE,'2026-06-07','2026-06-11',TRUE),
('Küçükbaş','Kangal','Koç',80,24000,1,0,TRUE,TRUE,'Sivas','TR-2026-B003','3 Yaş','Erkek','Kangal Akkaraman','Sivas yaylası, iri yapılı.','905559901234','https://www.youtube.com/watch?v=Odt0ixuucfc',44,5,TRUE,'2026-06-06','2026-06-10',TRUE),
('Küçükbaş','İvesi','Koç',65,19500,1,0,FALSE,TRUE,'Gaziantep','TR-2026-B004','2.5 Yaş','Erkek','İvesi','Güneydoğunun meşhur İvesi ırkı.','905551234560',NULL,36,4,TRUE,'2026-06-07','2026-06-11',TRUE),
('Küçükbaş','Dağlıç','Koyun',55,15400,1,0,FALSE,TRUE,'Afyon','TR-2026-B005','2 Yaş','Dişi','Dağlıç','İç Anadolu yaylaları.','905552345670',NULL,30,3,TRUE,'2026-06-08','2026-06-12',TRUE),
('Küçükbaş','Kıvırcık','Koç',68,20400,1,0,TRUE,TRUE,'Çanakkale','TR-2026-B006','2 Yaş','Erkek','Kıvırcık','Ege bölgesi meraları.','905553456780','https://www.youtube.com/watch?v=Odt0ixuucfc',37,4,TRUE,'2026-06-06','2026-06-10',TRUE),
('Küçükbaş','Tuj','Koç',75,22500,1,0,FALSE,TRUE,'Erzincan','TR-2026-B007','3 Yaş','Erkek','Tuj','Doğu Anadolu dağ ırkı, sağlam yapılı.','905554567800',NULL,41,4,TRUE,'2026-06-07','2026-06-11',TRUE),
('Küçükbaş','Merinos','Koç',70,21000,1,0,FALSE,TRUE,'Balıkesir','TR-2026-B008','2.5 Yaş','Erkek','Merinos','Bandırma yöresinden.','905555678900',NULL,38,4,TRUE,'2026-06-08','2026-06-12',TRUE),
('Küçükbaş','İvesi','Keçi',48,13440,1,0,FALSE,TRUE,'Şanlıurfa','TR-2026-B009','1.5 Yaş','Dişi','İvesi Keçisi','Güneydoğu keçisi, yüksek süt.','905556789090',NULL,26,3,TRUE,'2026-06-07','2026-06-11',TRUE),
('Küçükbaş','Kilis','Keçi',52,15600,1,0,FALSE,TRUE,'Kilis','TR-2026-B010','2 Yaş','Erkek','Kilis Keçisi','Kilis yöresine özgü keçi ırkı.','905557890990',NULL,29,3,TRUE,'2026-06-08','2026-06-12',TRUE)

ON CONFLICT (kupe) DO NOTHING;

-- 5. Kontrol
SELECT
  COUNT(*) as toplam_ilan,
  SUM(CASE WHEN tip LIKE 'Büyük%' OR tip LIKE 'Buyuk%' THEN 1 ELSE 0 END) as buyukbas,
  SUM(CASE WHEN tip LIKE 'Küçük%' OR tip LIKE 'Kucuk%' THEN 1 ELSE 0 END) as kucukbas,
  SUM(dolu_hisse) as toplam_dolu_hisse
FROM public.hayvanlar;
