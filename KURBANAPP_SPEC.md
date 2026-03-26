# KURBANAPP PROJE ANAYASASI VE GEREKSİNİMLERİ

## 📱 TEMEL PRENSİP VE PWA KURALI (ŞART)
**Uygulama Progressive Web App (PWA) olarak %100 UYUMLU (Responsive) ve HYBRID bir yapıda olacaktır. Bu kural projenin en önemli kuralıdır! Yazılacak HER kodda mobil-ilk (mobile-first) vizyon akılda tutulacak, overscroll ve touch-action özellikleri native mobile hissiyatına ("Ana Ekrana Ekle") uyumlu hale getirilecektir. Gelecek sohbetlerde AI ajanları bu PWA kuralını unutmamalıdır.**

## 🎯 PROJE ÖZETİ
Sahibinden tarzı, detaylı filtreleme ve listeleme özelliklerine sahip, modern, şık ve güvenilir bir "Kurban Satın Alım ve Takip" uygulaması. 

## 🐮 KATEGORİLER VE HAYVAN TÜRLERİ
1. **Büyükbaş (Düve, İnek, Dana):**
   - Özellikler: Kilo, Cins.
   - Fiyatlandırma: Toplam fiyat, Kişi başına düşen fiyat.
   - Ortaklık Yapısı: Admin tarafından belirlenen kapasite (Örn: Maksimum 7 kişi). İster 1 kişi tek başına, ister belirlenen sayıya kadar hissedar girebilir. Kaç hissenin dolduğu ve kaç hissenin boş olduğu sistemde görünmelidir.
2. **Küçükbaş (Koç, Koyun, Kuzu, Keçi):**
   - Özellikler: Kilo, Cins.
   - Fiyatlandırma: Tek fiyat (Hisse sistemi yoktur).

## 🎥 MEDYA VE CANLI YAYIN SİSTEMİ
- **Canlı Yayın:** Sahiplenilen / Listelenen hayvanın anlık olarak izlenebilmesi için canlı yayın entegrasyonu (veya kamera yayın linki).
- **Kesim Anı Yayını:** Kurban kesimi esnasında hissedarlara/sahiplere özel kesim anı canlı yayını.
- **Medya Galerisi:** Her hayvana özel detaylı fotoğraflar ve videolar.

## 📄 BELGELER VE GÜVEN
- Helal Kesim Belgesi.
- Sağlık ve Veteriner Raporları / Ek Belgeler.
- Kullanıcı ile satıcı/sistem arasında Dijital Sözleşmeler.
- Hayvana ait küpe numarası ve ek özel bilgiler.

## 💬 İLETİŞİM
- Hızlı iletişim için hayvana/ilana özel WhatsApp (WP) İletişim Butonu.

## 🛠️ TEKNOLOJİ ÖNERİSİ LİSTESİ (Hybrid & Responsive)
- Frontend/Mobil: Next.js (PWA destekli Web + Mobil Görünüm) veya React Native (Expo ile Web+iOS+Android).
- Tasarım: Modern, güven veren renkler, glassmorphism detaylar, Premium UI/UX.
