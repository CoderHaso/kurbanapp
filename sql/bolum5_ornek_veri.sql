-- ============================================================
-- KURBANAPP SQL — BÖLÜM 5: ÖRNEK VERİ
-- Bölüm 4'ten sonra çalıştır
-- Hayvanlar tablosu boşsa doldurur, doluysa hiçbir şey yapmaz
-- ============================================================

INSERT INTO public.hayvanlar
  (tip, cins, tur, kilo, fiyat, hisse_sayisi, dolu_hisse,
   canli_yayin, helal, konum, kupe, yas, cinsiyet, irk,
   aciklama, whatsapp, yayin_url, karkas, vucut_puani, aktif,
   kesim_tarihi, teslim_tarihi, auto_onay)
VALUES
  ('Büyükbaş','Simental','Dana',640,128000,7,4,
   TRUE,TRUE,'Konya','TR-2026-0145','2.5 Yaş','Erkek','Simental x Holstein',
   'Doğal ortamda büyütülmüş. Helal kesim belgeli.',
   '905551234567','https://www.youtube.com/watch?v=Odt0ixuucfc',350,4,TRUE,
   '2026-06-06','2026-06-10',FALSE),

  ('Büyükbaş','Montofon','İnek',580,116000,7,7,
   FALSE,TRUE,'Ankara','TR-2026-0201','4 Yaş','Dişi','Montofon',
   'Tam dolu, hisse alımı kapalı.',
   '905559876543',NULL,310,3,FALSE,
   '2026-06-06','2026-06-10',FALSE),

  ('Küçükbaş','Kıvırcık','Koç',68,19500,1,0,
   TRUE,TRUE,'Bursa','TR-2026-0310','3 Yaş','Erkek','Kıvırcık',
   'Organik besili, doğal otlakta yetiştirilmiş.',
   '905553334455','https://www.youtube.com/watch?v=Odt0ixuucfc',38,4,TRUE,
   '2026-06-06','2026-06-10',TRUE),

  ('Küçükbaş','Merinos','Koyun',54,15000,1,0,
   FALSE,TRUE,'İzmir','TR-2026-0402','2 Yaş','Dişi','Merinos',
   'İzmir köy meralarında yetiştirilmiştir.',
   '905557778899',NULL,28,3,TRUE,
   '2026-06-07','2026-06-11',TRUE),

  ('Büyükbaş','Angus','Düve',510,102000,5,2,
   TRUE,TRUE,'Konya','TR-2026-0521','2 Yaş','Dişi','Angus',
   'Premium Angus cinsi, yüksek et verimi.',
   '905552223344','https://www.youtube.com/watch?v=Odt0ixuucfc',280,4,TRUE,
   '2026-06-06','2026-06-10',FALSE),

  ('Küçükbaş','İvesi','Keçi',42,11200,1,0,
   FALSE,TRUE,'Gaziantep','TR-2026-0687','1.5 Yaş','Erkek','İvesi',
   'Güneydoğunun meşhur İvesi keçisi.',
   '905556667788',NULL,22,3,TRUE,
   '2026-06-07','2026-06-11',TRUE),

  ('Büyükbaş','Holstein','Dana',480,96000,6,1,
   FALSE,TRUE,'Antalya','TR-2026-0733','2 Yaş','Erkek','Holstein',
   'Sağlıklı, verimli bir Holstein danası.',
   '905551112233',NULL,260,3,TRUE,
   '2026-06-06','2026-06-10',FALSE),

  ('Küçükbaş','Kangal','Koç',75,22000,1,0,
   TRUE,TRUE,'Sivas','TR-2026-0811','3 Yaş','Erkek','Kangal Akkaraman',
   'Sivas yaylalarında yetiştirilmiştir.',
   '905554445566','https://www.youtube.com/watch?v=Odt0ixuucfc',42,4,TRUE,
   '2026-06-07','2026-06-11',TRUE)

ON CONFLICT (kupe) DO NOTHING;
-- ON CONFLICT → Aynı küpe no varsa atla, hata verme
