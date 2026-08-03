# MemoryWedding — Antigravity Devir ve Devam Planı

Son güncelleme: 3 Ağustos 2026  
Repo: `brsvrn/forever-frame-hub`  
Aktif geliştirme dalı: `feature/platform-foundation`  
Canlı dal: `main`  
Canlı alan adı: `https://www.memory-wedding.com`  
Supabase proje kimliği: `cepmgnouktktetocuiox`

## 1. Bu belgenin amacı

Bu dosya, MemoryWedding ana geliştirme planında şimdiye kadar tamamlanan işleri, kısmen tamamlanan alanları, henüz başlanmayan özellikleri ve güvenli devam sırasını tek yerde toplar. Antigravity bu dosyayı, `docs/phase-1-platform-foundation.md`, `docs/phase-3-advanced-event-features.md` ve `docs/phase-4-builder-integration.md` ile birlikte okumalıdır.

Temel uygulama ilkesi değişmemelidir:

```text
Ortak veri modeli
  -> sunucu işlemleri ve güvenlik
  -> yeniden kullanılabilir özellik bileşenleri
  -> oluşturma sihirbazı
  -> yönetim paneli
  -> kontrollü gelişmiş editör
```

Sihirbaz, panel ve ileride yapılacak gelişmiş editör aynı tablo ve sunucu işlemlerini kullanmalıdır. Aynı özelliğin ikinci bir veri modeli veya ikinci bir kaydetme akışı oluşturulmamalıdır.

## 2. Canlı ortamın mevcut durumu

- Bakım modu **açıktır**. Normal ziyaretçi ana sayfa ve korunan rotalarda `503 Service Unavailable` görür.
- `/bakim` erişilebilir durumdadır.
- Admin girişi, admin paneli, bakım ayarı işlemleri ve PayTR webhook bakım engelinin dışındadır.
- Admin için doğrulanmış oturuma bağlı güvenli bakım bypass/önizleme akışı vardır; URL parametresi tek başına bypass sağlamaz.
- Supabase üzerinde yeni platform tabloları canlıya uygulanmıştır.
- Doğrulama sorgusunda beklenen **16 tablonun 16'sı** bulunmuş ve **16'sında da RLS açık** görülmüştür.
- Migration sırasında mevcut iki davetiye için paylaşım, ses, müzik ve hediye ayarları oluşturulmuştur.
- Bakım modu, tüm kabul testleri bitmeden kapatılmamalıdır.

### Canlıya uygulanmış migrationlar

1. `supabase/migrations/20260803000100_platform_foundation.sql`
2. `supabase/migrations/20260803000200_core_content.sql`
3. `supabase/migrations/20260803000300_collaboration.sql`
4. `supabase/migrations/20260803000400_advanced_event_features.sql`

Canlı şemayla uyumluluk için yapılan önemli düzeltmeler:

- `invitations.event_time` hem `time` hem metin kökenli şemalarda güvenli biçimde dönüştürülür.
- Eksik eski ortamlarda `update_updated_at_column()` migration içinde tekrar çalıştırılabilir biçimde oluşturulur.
- Eski `guest_uploads` tablosuna yeni R2 akışı için nullable `file_path` eklenir; eski `file_url` kayıtları korunur.

Bu migrationları canlıda yeniden çalıştırmak gerekmemektedir. Yeni migration yazılacaksa additive, idempotent ve geri alınabilir tasarlanmalıdır.

## 3. Son doğrulama durumu

`2c05a96` commit’i itibarıyla:

- `npm run typecheck`: başarılı
- `npm test`: **15 test dosyası / 45 test başarılı**
- `npm run build`: başarılı
- Bilinen build uyarısı: bazı istemci chunkları 500 kB üzerinde. Bu bir sonraki performans fazında code splitting ile ele alınmalıdır.

## 4. Önemli commitler

| Commit | İçerik |
|---|---|
| `2c05a96` | Kişisel davetli bağlantılarının LCV formu, kota/etkinlik doğrulaması ve yanıt bekleyenler paneliyle bağlanması |
| `393ab74` | SEO uyumlu tema kataloğu, tema detayları, canlı demo ve builder bağlantısı |
| `2c4fbb1` | Tekli/çoklu etkinlikler için Google, Outlook, Apple ve `.ics` takvim akışı |
| `4239f2c` | Gelişmiş LCV doğrulaması, rapor kartları ve Excel/PDF/CSV çıktıları |
| `29593ba` | Güvenli, markalı 1200×630 Open Graph/WhatsApp görsel üretimi |
| `db61921` | Lisanslı hazır müzik kataloğu ve YouTube kaynakları |
| `daeaf60` | Paylaşım görseli üzerinde çift isimleri |
| `4ccdac5` | Fotoğraf yoksa paylaşım önizlemesinde tema görseli |
| `1f34a8e` | Sunucuda `VITE_SUPABASE_URL` uyumluluğu |
| `a6e4a34` | Gelişmiş ayarlarda sonsuz spinner yerine hata/yeniden deneme |
| `f47a1c7` | Güvenli admin bakım önizleme işlemi |
| `fa56402` | Ortak 15 adımlı builder akışı |
| `1729a9c` | Gelişmiş ayarların builder'a bağlanması |
| `1013adb` | Paylaşım, ses, müzik, IBAN ve kişisel bağlantı temeli |
| `ada083d` | Ortak etkinlik yönetimi ve ekip rolleri |
| `a9bbeee` | Temel etkinlik içeriği ve güvenli misafir akışları |

## 5. Tamamlanan altyapı

### 5.1 Framework ve ana yapı

- TanStack Start, React 19, Vite ve dosya tabanlı TanStack Router.
- Supabase Auth ve sunucu taraflı service-role işlemleri.
- Ana etkinlik kaydı `invitations`; mevcut `/davet/:slug` bağlantıları korunur.
- Cloudflare R2 yeni özel ses/medya işlemlerinde kullanılır.
- PayTR ödeme başlatma, callback doğrulaması ve paket aktivasyonu korunmuştur.

### 5.2 Bakım modu

- Kalıcı tek kaynak `system_settings` kaydıdır.
- Admin paneli gerçek veritabanı durumunu okur ve günceller.
- Sunucu seviyesinde guard vardır.
- Admin ve callback istisnaları vardır.
- Bakım sayfası no-cache davranışındadır; normal ziyaretçi yanıtı 503'tür.
- PayTR webhook bakım sayfasına yönlendirilmez.

### 5.3 Ortak etkinlik yönetimi

- `owner`, `co_manager`, `content_manager`, `gallery_manager`, `viewer` rolleri.
- Sunucu tarafında ortak izin matrisi.
- Hashlenmiş, süreli, iptal edilebilir ve tek kullanımlık ekip davetleri.
- Etkinlik üyeleri ve işlem geçmişi tabloları.
- Kritik işlemler yalnız buton gizlemeye değil, sunucu yetki kontrolüne bağlıdır.

### 5.4 Ortak veri modeli

Canlıda bulunan ana yeni tablolar:

- `event_members`
- `event_member_invitations`
- `event_activity_logs`
- `event_builder_progress`
- `event_schedules`
- `event_family_details`
- `event_invitation_content`
- `event_feature_settings`
- `event_memory_settings`
- `event_rsvp_settings`
- `event_custom_questions`
- `event_share_settings`
- `event_audio_settings`
- `event_music_settings`
- `event_gift_settings`
- `event_guest_links`

### 5.5 Çok adımlı builder

15 adımlı registry ve ortak builder akışı kurulmuştur:

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

Paket veya tema tarafından desteklenmeyen adımlar gizlenebilir. Anonim kullanıcı sunucuya bağlı adımda girişe yönlendirilir ve taslak kurtarma verisi korunur. Builder ilerlemesi `event_builder_progress` içinde saklanır.

### 5.6 Çoklu etkinlik ve temel içerik

- `event_schedules` ile birden fazla tarih/saat/mekân kaydı.
- Aile bilgileri için ortak tablo ve form.
- Davet metni için ortak içerik tablosu.
- Modül açma/kapatma ayarları.
- Anı Kutusu ve LCV temel ayar tabloları.
- Builder ve panel bu alanlarda ortak bileşenleri kullanır.

### 5.7 Paylaşım görünümü

- Etkinlik bazlı paylaşım başlığı, açıklaması, mesajı ve görseli.
- Davetiye sayfasında dinamik Open Graph/Twitter metadata.
- Özel görsel yoksa davetiye kapağı, o da yoksa seçili tema görseli fallback'i.
- Builder önizlemesinde tema görseli üzerinde çift isimleri ve okunabilirlik katmanı.
- `/api/share-image/:slug` davetiye adı, tarih, marka ve tema/kapak arka planıyla gerçek 1200×630 PNG üretir.
- OG ve Twitter meta etiketleri bu dinamik görseli boyut, tür ve alternatif metin bilgileriyle kullanır.
- Paylaşım ayarı sürümü görsel URL'sine eklendiği için yeni değişiklikler yeni cache anahtarı alır.
- Sunucu yalnızca aynı origin, yapılandırılmış Supabase ve yapılandırılmış R2 görsel hostlarını indirir; localhost, özel IP ve keyfi dış hostlar engellenir.
- Özel kapak veya tema görseli okunamazsa marka renkli güvenli arka plan oluşturulur; özel galeri dosyası kullanılmaz.

Canlı WhatsApp/Facebook scraper sonucu bakım modu kapatılmadan gerçek platformda doğrulanamaz; bu smoke test yayın kapısında açık kalır.

### 5.8 Sesli karşılama

- Mikrofon kaydı ve dosya yükleme altyapısı.
- MIME, boyut ve 30 saniye sınırı.
- R2 presigned upload ve private oynatma URL'si.
- Davetiyede kullanıcı etkileşimiyle oynatma.
- Sesli mesaj başlayınca arka plan müziği durur; bitince önceki duruma döner.

### 5.9 Müzik — son tamamlanan iş

`db61921` ile:

- Kullanıcı müzik dosyası yükleme butonu builder arayüzünden kaldırıldı.
- Üç hazır parça eklendi: `There is Romance`, `Two Together`, `Water Lily`.
- Parçalar Kevin MacLeod/Incompetech resmi kaynaklarından yayınlanır ve CC BY 4.0 atfı arayüzde gösterilir.
- Katalog tanımı `src/lib/music-library.ts` içindedir.
- YouTube `watch`, `youtu.be`, `shorts`, `embed`, `live` biçimleri güvenli şekilde doğrulanır.
- Veritabanında YouTube video kimliği mevcut `source_type = legacy` ve `track_id` alanıyla tutulur; bu nedenle yeni migration gerekmez.
- YouTube sesi indirilmiyor veya ayrı ses dosyasına dönüştürülmüyor.
- Davetiyede görünür YouTube iframe oynatıcısı kullanılır ve YouTube kaynağı otomatik başlamaz.
- Hazır doğrudan ses parçaları açılış tamamlandıktan sonra mevcut tarayıcı autoplay kurallarına göre çalışır.

Müzik için takip notları:

- Incompetech uzak dosyaları üçüncü taraf bağımlılığıdır. Uzun vadede lisans kaydıyla birlikte kontrollü kendi CDN/R2 kopyası değerlendirilmeli; önce lisans ve atıf koşulu tekrar hukuk/ürün tarafından onaylanmalıdır.
- `legacy` değerinin YouTube anlamında kullanılması geriye uyumluluk tercihidir. İleride `youtube` source type eklenecekse migration, Zod schema, Supabase type ve eski kayıt dönüşümü birlikte yapılmalıdır.
- Canlıda bir katalog parçası ve bir YouTube videosuyla masaüstü/Android/iPhone oynatma testi henüz yapılmamıştır.

### 5.10 IBAN ve kişisel davet bağlantıları

- IBAN varsayılan kapalıdır ve yalnız yetkili etkinlik sahibi tarafından düzenlenir.
- Kişisel misafir bağlantılarında açık token saklanmaz; hash ve kısa ipucu tutulur.
- Süre, iptal ve görüntülenme bilgileri veri modelinde vardır.

## 6. Kısmen tamamlanan alanlar

Bu alanlar veri modeli veya temel arayüze sahiptir fakat ana plandaki tüm kabul kriterlerini karşılamaz.

### 6.1 Davet metni sistemi

Var:

- Kendi metnini yazma ve temel içerik kaydı.
- Metin şablonu için veri modeli temeli.

Eksik:

- Kategori bazlı tam hazır metin kataloğu.
- Favoriler.
- Kullanıcının kendi şablonunu yönetmesi.
- Önceki sürüme dönme arayüzü.
- Kullanıcı onaylı yapay zekâ taslak üretimi.

### 6.2 Gelişmiş LCV

Var:

- Mevcut LCV akışı.
- Gelişmiş ayar ve özel soru tabloları.
- Katılım durumuna göre koşullu misafir alanları.
- Etkinlik bazlı katılım seçimi ve sunucu doğrulaması.
- Kısa/uzun metin, evet-hayır, tek/çoklu seçim, sayı, tarih, yemek ve servis soru türleri.
- Yetişkin, çocuk, ulaşım, yemek ve etkinlik bazlı panel raporları.
- Güvenli Excel SpreadsheetML, PDF ve CSV dışa aktarma.
- Kişisel davetli bağlantısından açılan formda ad, iletişim, kişi kotası ve davet edildiği etkinliklerin güvenli biçimde doldurulması.
- Kişisel bağlantının yalnız izin verilen etkinliklere ve davetli kotasına göre sunucuda doğrulanması.
- Başarılı LCV yanıtının kişisel bağlantı durumuna işlenmesi ve eşzamanlı ikinci yanıtta kayıt geri alma koruması.
- Aktif kişisel davetlerden yanıt bekleyenlerin gerçek verilerle panelde listelenmesi.

Eksik veya canlı uçtan uca doğrulanmadı:

- Özel soru yanıtlarının toplu/aggregate raporu.
- Form, rapor ve Excel/PDF çıktılarının canlı ve fiziksel mobil cihaz testi.

### 6.3 Anı Kutusu

Var:

- Fotoğraf/video yükleme temeli.
- R2 `file_path` uyumluluğu.
- Onay/görünürlük ayar modeli.
- Davetiyede Memory Wall/Polaroid görünümü.

Eksik:

- Misafir sesli mesaj kaydı ve yönetimi.
- Yazılı not-only gönderimi.
- Başlangıç/bitiş tarihi kurallarının tüm upload endpointlerinde zorlanması.
- Dosya türü ve boyut ayarlarının etkinlik bazlı tam uygulanması.
- Canlı anı duvarının yüksek yük ve realtime testi.

### 6.4 QR Studio

Var:

- QR üretimi ve mevcut PNG/PDF kart çıktıları.
- Tema görseliyle QR kartı.

Eksik:

- Tam renk/logo/ölçü editörü.
- JPG.
- A4 çoklu kart ve kesim çizgileri.
- Karşılama panosu, Instagram hikâyesi ve kare gönderi.
- Her varyantta otomatik QR okunabilirlik testi.

### 6.5 Takvime ekleme

Var:

- Tekli ve çoklu etkinliklerde ortak takvim menüsü.
- Google Takvim ve Outlook web bağlantıları.
- Apple Takvim uyumlu `.ics` indirme.
- Çoklu etkinliklerde sunucu tarafından doğrulanan `.ics` endpoint'i.
- Etkinlik saat dilimine göre UTC dönüşümü, tüm gün ve gece yarısını aşan etkinlik desteği.
- Takvim modülü kapalıysa seçeneklerin davetiyeden gizlenmesi.

Eksik veya canlı uçtan uca doğrulanmadı:

- Google/Outlook/Apple bağlantılarının fiziksel iPhone ve Android cihazlarda canlı testi.
- Takvime ekleme analitik olayının ortak analitik servise bağlanması.

### 6.6 Yönetim paneli

Mevcut panel, galeri, misafir, depolama, istatistik, QR ve ayar sayfaları vardır. Yeni ortak bileşenlerin bir bölümü builder ve panelde kullanılır.

Eksik:

- Ana plandaki yeni menü yapısının tamamı.
- Tüm sayfalarda rol bazlı görünürlük ve salt okunur durumların QA'i.
- İşlem geçmişi için son kullanıcı arayüzü.
- Gelişmiş LCV rapor ekranları.
- Analitik olayların tamamı.

## 7. Henüz tamamlanmayan ana fazlar

### 7.1 Tema altyapısının kalan kısmı

Var:

- Tüm seçilebilir temalar için `/temalar/:slug` tanıtım sayfası ve `/temalar` kataloğu.
- Kategori, açıklama, renk paleti, desteklenen özellikler ve telefon görünümü.
- Tema bazlı title/description/Open Graph metadata, canonical URL ve sitemap kayıtları.
- Canlı demoyu seçilen temayla açma ve builder'a tema seçimini taşıma.

Eksik:

- Tema bazlı ayrıntılı ekran görüntüsü galerileri, benzer temalar ve SSS.
- Tema tanımlarında editoryal uzun açıklama ve etkinlik türleri.
- `supportedSections`, `imageSlots`, `galleryStyles`, `openingAnimations` alanlarının veri modeline tam taşınması.
- Pasif temanın yeni müşteriden gizlenip eski etkinlikte çalışmaya devam etmesi.
- Tema yönetiminin statik `theme-engine` ve Supabase kayıtları arasında tek kaynak stratejisi.

### 7.2 Kontrollü gelişmiş editör

Başlanmadı veya ürün seviyesinde tamamlanmadı:

- Canlı blok seçimi.
- İçerik ve stil sekmeleri.
- Bölüm taşıma/gizleme/gösterme.
- Güvenli font ve boyut aralıkları.
- Kontrast uyarısı.
- Son 10 işlem için geri al/yinele.
- Mobil/tablet/masaüstü/tam ekran önizleme.

Tam serbest Canva benzeri editör yapılmamalıdır.

### 7.3 Dilekler, tepkiler ve dijital anı defteri

- Dilek gönderme, onaylama, gizleme ve spam kontrolü.
- Kalp/alkış/mutluluk/kutlama tepkileri.
- Fotoğraf, not, dilek ve seslerden dijital anı defteri.
- PDF dışa aktarma ve kapak seçimi.

### 7.4 Kişisel davetli bağlantılarının kalan kısmı

- Misafir listesi içe aktarma.
- Kişisel QR kartı.
- Davet edildiği etkinlikleri seçme arayüzü.
- LCV durumu panelde görünür; son açılma, filtreleme ve toplu işlemler henüz tamamlanmadı.

### 7.5 Analitik olaylar

Ana dokümanda listelenen builder, tema, ekip, paylaşım, ses, LCV, QR, kişisel bağlantı, anı ve editör olaylarının tamamı ortak analitik servise bağlanmalıdır.

Analitiğe e-posta, telefon, IBAN, ses içeriği, davet metni, özel mesaj veya token gönderilmemelidir.

### 7.6 Eski etkinlik migration ve yayın kapısı

- Eski etkinlik örnekleriyle tam regresyon matrisi.
- Eski QR kodlarının canlı doğrulaması.
- PayTR sandbox ve tekrar callback testi.
- iPhone Safari ve Android Chrome fiziksel cihaz testi.
- Yetkisiz URL erişimi ve rol yükseltme güvenlik testi.
- Bakım modu kapatılmadan önce production smoke test.

## 8. Antigravity için önerilen kesin devam sırası

### P0 — Önce mevcut son işi doğrula

1. `feature/platform-foundation` ve `main` dallarının `2c05a96` veya daha yeni committe olduğunu doğrula.
2. Vercel dağıtımının başarılı olduğunu kontrol et.
3. Admin bakım bypass ile `/olustur` adım 7'yi aç.
4. Üç katalog parçasını ayrı ayrı önizle ve kaydet.
5. Davetiye bağlantısında katalog müziğini masaüstü ve mobilde oynat.
6. Geçerli/geçersiz YouTube bağlantısı test et.
7. YouTube iframe'in görünür olduğunu, otomatik başlamadığını ve sesli karşılama sırasında durduğunu doğrula.

### P1 — Gelişmiş LCV raporlarını tamamla

Özel soru yanıtlarının toplu raporunu mevcut ortak servis ve dışa aktarma yapısına ekle. Form, kişisel bağlantı ve yanıt bekleyenler akışını yeniden yazma; canlı/fiziksel cihaz testlerini yayın kapısında tamamla.

### P2 — Tema schema'yı tamamla

Mevcut tema tanıtım rotalarını yeniden yazmadan desteklenen modüller, görsel slotlar, etkinlik türleri ve tema bazlı açılış/galeri seçeneklerini ortak schema'ya ekle.

### P2 — Kontrollü gelişmiş editör

Önce ortak section schema, sonra editör UI. Builder/panel verisini kopyalama.

### P3 — QR ve anı ürünleri

Gelişmiş QR baskıları, sesli misafir mesajı, dilekler/tepkiler ve dijital anı defteri.

### P3 — Geçiş ve bakım kapatma

Tüm regresyon, ödeme, mobil, güvenlik ve canlı testleri tamamla; ancak bundan sonra admin onayıyla bakım modunu kapat.

## 9. Kritik güvenlik kuralları

- `SUPABASE_SERVICE_ROLE_KEY` hiçbir `VITE_` değişkenine taşınmamalıdır.
- Sunucu işlemlerinde `requireEventPermission` kullanılmalıdır.
- RLS tek başına bırakılmamalı; service-role kullanan her handler etkinlik/rol doğrulamalıdır.
- Tokenlar açık saklanmamalıdır.
- IBAN, telefon, e-posta ve kişisel mesajlar audit/analitik payloadlarına yazılmamalıdır.
- Dosya türü yalnız uzantıyla doğrulanmamalıdır.
- PayTR callback bakım middleware'i veya auth yönlendirmesiyle engellenmemelidir.
- Bakım bypass yalnız doğrulanmış admin oturumuna bağlı kalmalıdır.
- Yeni tablolar için `anon`/`authenticated` doğrudan yazma yetkisi açılmamalıdır.

## 10. Ortam değişkenleri

Değerleri bu dosyaya veya Git'e yazma. Gerekli adlar:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_URL                    # opsiyonel server alias; VITE URL fallback'i mevcut
SUPABASE_PUBLISHABLE_KEY        # opsiyonel server alias
SUPABASE_SERVICE_ROLE_KEY       # yalnız server
VITE_SITE_URL
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ACCESS_KEY_ID
CLOUDFLARE_SECRET_ACCESS_KEY
VITE_CLOUDFLARE_R2_PUBLIC_URL
```

PayTR değişkenlerini mevcut canlı ayarlardan isim/değer değiştirmeden koru.

## 11. Önemli kaynak dosyalar

| Alan | Dosya |
|---|---|
| Builder | `src/routes/olustur.tsx` |
| Davetiye sayfası | `src/routes/davet.$slug.tsx` |
| Tema motoru | `src/lib/theme-engine.ts` |
| Gelişmiş ayar UI | `src/components/dashboard/DashboardExperience.tsx` |
| Gelişmiş ayar server işlemleri | `src/lib/advanced-event.functions.ts` |
| Gelişmiş ayar şeması | `src/lib/advanced-event-schema.ts` |
| Müzik kataloğu | `src/lib/music-library.ts` |
| Davetiye müzik oynatıcı | `src/components/invitation/PremiumAudioPlayer.tsx` |
| Paylaşım görsel endpoint'i | `src/routes/api.share-image.$slug.ts` |
| Paylaşım görsel güvenliği/şablonu | `src/lib/share-image.ts` |
| LCV formu ve sunucu işlemleri | `src/components/invitation/PremiumRSVP.tsx` ve `src/lib/rsvp.functions.ts` |
| LCV paneli ve dışa aktarma | `src/components/dashboard/DashboardRSVP.tsx` ve `src/lib/rsvp-export.ts` |
| Takvim bağlantıları ve `.ics` | `src/components/invitation/CalendarLinks.tsx`, `src/lib/calendar.ts` ve `src/routes/api.calendar.$scheduleId.ts` |
| Tema katalog/detay içeriği | `src/routes/temalar.index.tsx`, `src/routes/temalar.$slug.tsx` ve `src/lib/theme-pages.ts` |
| Etkinlik izinleri | `src/lib/event-permissions.ts` ve `src/lib/event-access.server.ts` |
| Ekip yönetimi | `src/lib/event-team.functions.ts` |
| Çoklu program | `src/lib/event-schedules.functions.ts` |
| Bakım | `src/lib/maintenance.server.ts` ve request middleware |
| Supabase admin client | `src/integrations/supabase/client.server.ts` |
| Auth middleware | `src/integrations/supabase/auth-middleware.ts` |
| Migrationlar | `supabase/migrations/` |

## 12. Her değişiklikte çalıştırılacak kontroller

```bash
npm run typecheck
npm test
npm run build
```

Özellik riskine göre ayrıca:

- 360 px mobil yatay taşma testi.
- iPhone Safari ve Android Chrome testi.
- Gizli sekmede bakım ve public erişim testi.
- Admin rolü, ekip rolü ve yetkisiz kullanıcı testi.
- Eski bir davetiye, eski QR ve eski LCV örneğiyle regresyon.
- PayTR değişikliğinde sandbox ödeme ve tekrarlı callback testi.

## 13. Bilinen teknik borçlar

- Büyük bundle/chunklar dinamik import ile bölünmeli.
- Bazı eski bileşenlerde ortak form ve hata kalıpları tekrar ediyor.
- Statik tema motoru ve Supabase tema yönetimi için net tek kaynak kararı gerekli.
- Dinamik OG görselinin gerçek WhatsApp/Facebook cache ve scraper smoke testi bekliyor.
- Müzik kataloğu üçüncü taraf stream URL'lerine bağlı.
- YouTube kaynağı veritabanında geriye uyumluluk nedeniyle `legacy` olarak tutuluyor.
- Tüm planlanan analitik olaylar bağlı değil.
- Fiziksel cihaz ve yüksek yük testleri tamamlanmadı.

## 14. Bakım modunu kapatma kontrol listesi

Bakım modu ancak aşağıdakiler tamamlandığında kapatılmalıdır:

- Production build ve Vercel deployment başarılı.
- Eski ve yeni davetiye açılıyor.
- QR yükleme, galeri görüntüleme, indirme ve silme çalışıyor.
- LCV gönderme ve panel raporu çalışıyor.
- PayTR ödeme/callback/paket aktivasyonu çalışıyor.
- Builder taslak, devam, yayın ve panel dönüşü çalışıyor.
- Müzik, sesli karşılama ve birbirini durdurma davranışı mobilde çalışıyor.
- WhatsApp gerçek kart sonucu doğrulanıyor.
- Admin ve ekip rol testleri başarılı.
- Yetkisiz kullanıcı başka etkinliğe erişemiyor.
- iPhone Safari ve Android Chrome testleri başarılı.
- Kullanıcı canlı açılış için açıkça onay veriyor.

## 15. İlk devam görevi için kısa talimat

Antigravity önce kod yazmaya başlamadan şu sırayı izlemelidir:

1. Bu dosyayı ve üç faz belgesini oku.
2. `git status`, `git log -5` ve canlı deployment durumunu kontrol et.
3. Müzik özelliğinin canlı smoke testini tamamla.
4. `/api/share-image/:slug` yanıtının üretimde PNG ve 1200×630 olduğunu, davetiye HTML'inin bu URL'yi kullandığını doğrula.
5. Sonucu raporla.
6. Kullanıcıdan öncelik değişikliği gelmezse gelişmiş LCV'yi tamamlamaya başla.

Bakım modunu kapatma, PayTR akışını yeniden yazma, mevcut tabloları silme veya eski davetiye URL'lerini değiştirme.
