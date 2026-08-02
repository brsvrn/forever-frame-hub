# Faz 1 — Platform Temeli

## Mevcut sistem haritası

- Framework: TanStack Start, React 19, Vite ve dosya tabanlı TanStack Router.
- Kimlik: Supabase Auth; global roller `admin` ve `user`.
- Ana kayıt: `invitations`; mevcut yayın URL'si `/davet/:slug`.
- Builder: `/olustur`; altı görünür adım, `localStorage` kurtarma kopyası ve `invitations` otomatik kaydı.
- LCV: `rsvps`; misafir ekleme public RLS, sonuç yönetimi etkinlik sahibine açık.
- Medya: dosya Cloudflare R2, metadata `guest_uploads`; R2 silme işlemi sonraki fazda tamamlanacak.
- Temalar: statik `theme-engine` ile Supabase `themes` tablosunun birleşimi.
- PayTR: başlangıç server function, aktif callback `/api/paytr-webhook`.
- Bakım: request middleware ve `system_settings` tekil kaydı.

## Eklenen temel

- Etkinlik rolleri, hashlenmiş ekip davetleri, audit kayıtları, builder ilerlemesi ve çoklu program tabloları.
- `owner`, `co_manager`, `content_manager`, `gallery_manager`, `viewer` rolleri için ortak izin matrisi.
- Kritik yazmaları tarayıcıdan kapatan, service-role ve sunucu doğrulaması gerektiren RLS/grant modeli.
- On beş adımlı builder registry; uygulanmamış adımlar mevcut arayüzde sahte ekran olarak gösterilmez.
- Builder taslağı için 250 KB sınırı, iyimser sürüm kontrolü ve güvenli audit kaydı.
- Ödeme kimliği, paket ve fiyatının sunucudan türetilmesi; sayfa başına idempotency anahtarı.
- Ücretsiz etkinlik aktivasyonunun e-posta karşılaştırması yerine doğrulanmış admin rolüne bağlanması.

## Canlı migration çalışma sırası

1. Bakım modunu aç ve anonim ana sayfanın 503 verdiğini doğrula.
2. Admin paneli ile `/api/paytr-webhook` erişiminin bakım dışında kaldığını doğrula.
3. Supabase PITR/veritabanı yedeği ve `invitations`, `transactions`, `rsvps`, `guest_uploads` satır sayılarını kaydet.
4. Önce bakım migrationını, ardından `20260803000100_platform_foundation.sql` migrationını çalıştır.
5. Her davetiye için bir `owner`, bir builder progress ve en fazla bir primary schedule bulunduğunu doğrula.
6. Eski `/davet/:slug`, QR yükleme, LCV ve panel bağlantılarından örnekler aç.
7. PayTR sandbox başlatma ve tekrarlanan callback testini tamamla.

## Geri dönüş

- Uygulama kodunu önceki commit'e döndürmek yeni tabloları etkilemez; migration additive tasarlanmıştır.
- Hızlı geri dönüşte yeni tablolar silinmez. Yeni server işlemleri durdurulur ve eski `invitations` alanları okunmaya devam eder.
- Veri kaybı riski nedeniyle canlıda otomatik `DROP TABLE` rollback uygulanmaz.
- Gerekirse yalnız yeni trigger ve politikalar devre dışı bırakılır; tablo kaldırma ayrı, yedek doğrulamalı operasyon olarak yürütülür.

## Faz kapısı

- TypeScript kontrolü, unit testler ve production build başarılı olmalı.
- Canlı migration uygulanmadan bu dal `main` ile birleştirilmemeli.
- Faz 2 özellikleri bu temel dal incelenip kabul edilmeden production'a taşınmamalı.
