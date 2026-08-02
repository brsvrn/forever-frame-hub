# Faz 4 — Oluşturma Sihirbazı Bağlantısı

## Sonuç

Oluşturma ekranı ortak `builder-schema` içindeki 15 adımlı yapıya geçirildi. Paket veya tema tarafından desteklenmeyen adımlar gösterilmiyor. QR paketi yalnızca gerekli QR akışını kullanıyor.

## Bağlanan adımlar

1. Paket ve Etkinlik Türü
2. Tema Seçimi
3. Temel Bilgiler
4. Aile Bilgileri
5. Etkinlikler ve Konumlar
6. Davet Metni
7. Müzik ve Sesli Karşılama
8. Galeri ve Anı Kutusu
9. LCV ve Misafir Ayarları
10. QR Ayarları
11. Paylaşım Görünümü
12. Ek Özellikler
13. Ekip ve Yetkililer
14. Tam Önizleme
15. Yayınlama

## Tek veri kaynağı

- Çoklu etkinlikler `event_schedules` üzerinden `DashboardSchedule` ile yönetilir.
- Anı Kutusu, LCV ve modül ayarları `DashboardSettings` ile panel ve sihirbazda ortaktır.
- Müzik, sesli karşılama, paylaşım ve IBAN ayarları `DashboardExperience` ile ortaktır.
- Ekip davetleri `DashboardTeam` ile aynı sunucu yetki kontrollerini kullanır.
- Temel bilgi, aile ve davet metni mevcut taslak otomatik kaydıyla ortak tablolara eşitlenir.
- Sihirbaz ilerlemesi gerçek 15 adım kimliğiyle `event_builder_progress` kaydına yazılır.

## Güvenlik ve oturum

- Sunucuya bağlı adımlar anonim kullanıcıya sahte form göstermez.
- Kullanıcı girişe yönlendirilirken taslak korunur ve dönüş adımı URL üzerinde saklanır.
- Panelde kullanılan rol ve yetki kontrolleri sihirbazdan gelen işlemlerde de aynen uygulanır.
- Modül kaydı, aynı anda başka bir gelişmiş ayarın yaptığı değişikliği ezmemek için güncel sunucu sürümüyle birleştirilir.

## Mobil davranış

- Adım şeridi yatay kaydırılır.
- Aktif adım değiştiğinde kendisini otomatik olarak görünür alana taşır.
- 360 px testinde sayfa yatay taşma üretmedi; yalnızca adım şeridinin kendi kontrollü kaydırması bulunur.

## Doğrulamalar

- TypeScript tür denetimi başarılı.
- Hedefli ESLint kontrolünde hata yok; mevcut dosyalardaki eski uyarılar devam ediyor.
- 31 otomatik test başarılı.
- Production build başarılı.
- Masaüstü ve 360 × 800 mobil yerleşim tarayıcıda doğrulandı.

## Bu fazda özellikle yapılmayanlar

- QR Studio'nun yeni baskı editörü oluşturulmadı; mevcut gerçek QR Studio bağlantısı kullanıldı.
- Misafir sesli mesaj yükleme arayüzü açılmadı; sunucu yükleme akışı Faz 7'de tamamlanmadan sahte seçenek gösterilmiyor.
- Tema tanıtım sayfaları ve gelişmiş blok editörü bu faza eklenmedi.

