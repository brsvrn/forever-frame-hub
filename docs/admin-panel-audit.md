# MemoryWedding — Admin Paneli Denetim ve Güvenlik Raporu (Phase 0 Audit)

**Tarih:** 2026-08-05  
**Geliştirme Dalı:** `feature/admin-panel-v1`  
**Hedef:** MemoryWedding platformunun site sahibi tarafından güvenli, izole ve eksiksiz yönetilmesini sağlayan Super Admin Paneli mimarisi.

---

## 1. Mevcut Admin Sistemi İncelemesi

- **Arayüz:** `src/routes/admin.tsx` dosyasında temel bir `AdminGate` ve 4 sekmeli (`themes`, `packages`, `audit`, `settings`) bir arayüz bulunmaktadır.
- **Bileşenler:** `src/components/admin/` altında `PackageManager.tsx`, `ThemeManager.tsx`, `SystemSettings.tsx` yer almaktadır.
- **Server API & Doğrulama:**
  - `src/lib/admin-auth.server.ts`: `requireAdmin` fonksiyonuyla sunucu tarafında Bearer token alıp `supabase.auth.getUser` ve `has_role(user_id, 'admin')` RPC kontrolü yapmaktadır.
  - `src/routes/api.admin.system-settings.ts`: TanStack Start API route ile GET/POST endpoint'leri sunar ve audit log kaydı (`admin_audit_logs`) atar.
  - `src/lib/maintenance.server.ts`: Bakım modu kontrolünü sunucu tarafında gerçekleştirir; `isMaintenanceBypassPath` ile admin yollarını ve PayTR webhook'larını bakım engelinden muaf tutar.

---

## 2. Mevcut Rol ve Yetkilendirme Yapısı

1. **Sistem Rolleri (`public.app_role`):**
   - `admin` (Super Admin / Site Sahibi)
   - `user` (Normal kullanıcı)
   - `has_role(_user_id UUID, _role public.app_role)` SECURITY DEFINER RPC fonksiyonu mevcuttur.
   - Sahip e-postası `brsvrn@gmail.com` migration (`20260730000200_grant_owner_admin.sql`) ile `admin` rolüne atanmıştır.
2. **Etkinlik Düzeyi Rolleri (`public.event_member_role`):**
   - `owner`, `co_manager`, `content_manager`, `gallery_manager`, `viewer`
   - Bu roller sadece kendi etkinlikleri (`public.event_members`) dahilindedir ve platform adminliğine izin vermez.

---

## 3. Mevcut Veritabanı Tabloları

| Tablo Adı | Amaç | Durum |
| :--- | :--- | :--- |
| `profiles` | Kullanıcı profil detayları | Mevcut |
| `user_roles` | Kullanıcı sistem rolleri (`admin`, `user`) | Mevcut |
| `invitations` | Etkinlikler ve davetiye ana verisi | Mevcut |
| `transactions` | PayTR ve ödeme işlemleri | Mevcut |
| `packages` | Paket tanımları | Mevcut |
| `package_price_history` | Fiyat değişiklik geçmişi | Mevcut |
| `themes` | Tema konfigürasyonları | Mevcut |
| `system_settings` | Bakım modu ve sistem ayarları | Mevcut (Genişletilecek) |
| `admin_audit_logs` | Yönetici işlem kayıtları | Mevcut |
| `guest_uploads` | Misafir fotoğraf/video kayıtları | Mevcut |
| `event_members` | Etkinlik ekip üyeleri | Mevcut |
| `event_schedules` | Etkinlik program akışı | Mevcut |
| `event_activity_logs` | Etkinlik seviyesi loglar | Mevcut |

---

## 4. Eksik Modüller ve İhtiyaçlar

1. **Kullanım Kodları (`access_codes` & `access_code_redemptions`):**
   - Site sahibi kodu (sınırsız), tek kullanımlık, çok kullanımlık, süreli ve kişiye özel kod tabloları ve transaction korumalı redemption mantığı.
2. **Sipariş ve PayTR Yönetimi:**
   - Sipariş listesi, PayTR merchant_oid, callback logları, UTM/reklam takibi, test sipariş ayrımı, harici iade notları.
3. **Etkinlik Yönetimi:**
   - Detaylı filtreleme (taslak, yayında, ödenmiş, süresi dolmuş), süre uzatma (davetiye 1 yıl, QR 5 gün, saklama 2 ay), soft delete/restore.
   - **Gizlilik kuralı:** Fotoğraf/video dosya URL'leri admin paneline ASLA iletilmeyecek; yalnızca adet ve boyut metadata'sı gösterilecek.
4. **Kullanıcı Yönetimi:**
   - Kullanıcı listesi, etkinlik/sipariş ilişkileri, rol atama/kaldırma (kendini düşürme korumalı), hesap dondurma.
5. **Analitik ve Dönüşüm Raporu:**
   - Birinci taraf sipariş/dönüşüm verileri, UTM kaynakları, paket dağılımları.
6. **Destek Talepleri (`support_tickets`):**
   - İletişim ve destek talepleri yönetimi.
7. **Retention & Temizleme Kuyruğu (`retention_jobs`):**
   - Süresi dolan etkinlik ve medyaların güvenli takip kuyruğu.

---

## 5. Riskli Alanlar ve Güvenlik Önlemleri

1. **Medya Gizliliği:**
   - Admin sorgularında `guest_uploads.file_url` seçilmeyecek; yalnızca `count(*)` ve `sum(file_size)` aggregation'ı kullanılacak.
2. **PayTR Callback Bütünlüğü:**
   - Callback yalnızca `src/server.ts` içinde hash doğrulamasıyla işlenir. Admin panelinden sahte `paid` durumu veya client-side tetikleme yapılamaz.
3. **Kalıcı Bakım Modu:**
   - `system_settings` üzerinden yönetilir; admin paneli ve PayTR webhook'ları bypass listesinde kalmaya devam eder.
4. **Rol Doğrulaması:**
   - Her admin rotası ve API handler'ı hem UI'da hem de sunucu tarafında `requireAdmin` ve `has_role(uid, 'admin')` ile korunacaktır.

---

## 6. Yapılacak Migration Dosyası

- `supabase/migrations/20260805000100_super_admin_panel.sql`:
  - `access_codes` ve `access_code_redemptions`
  - `support_tickets`
  - `retention_jobs`
  - `system_settings` genişletmeleri (destek telefon/whatsapp, süre varsayılanları)
  - `invitations` için `deleted_at`, `qr_closing_at`, `retention_expires_at`, `invitation_expires_at`
  - `admin_audit_logs` indeksleri ve ek alanlar.
