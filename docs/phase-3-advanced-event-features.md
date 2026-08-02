# Faz 3 — Gelişmiş Etkinlik Özellikleri

## Teslim edilen ortak model

- `event_share_settings`: etkinliğe özel Open Graph/WhatsApp başlığı, açıklaması, mesajı ve görseli.
- `event_audio_settings`: en fazla 30 saniyelik sesli karşılama ve erişilebilir yazılı alternatif.
- `event_music_settings`: lisans bilgisi, ses seviyesi ve R2 üzerinde kullanıcı müziği.
- `event_gift_settings`: varsayılan kapalı, yalnızca etkinlik sahibinin yönetebildiği IBAN alanı.
- `event_guest_links`: hashlenmiş, iptal edilebilir ve süreli kişisel davet bağlantıları.

## Sunucu ve güvenlik

- Tüm tablolar RLS ile kapalıdır; `anon` ve `authenticated` doğrudan tablo yetkisi almaz.
- Okuma/yazma işlemleri mevcut etkinlik rol matrisi üzerinden sunucuda doğrulanır.
- IBAN ve kişisel bağlantı bilgileri audit metadata içine yazılmaz.
- Ses yükleme MIME türü, dosya boyutu, etkinlik dizini ve sesli karşılama süresi sunucuda doğrulanır.
- Eski ses dosyası yenisi doğrulandıktan sonra R2’den temizlenir.
- Kişisel bağlantının açık tokenı veritabanına yazılmaz; yalnızca SHA-256 özeti ve son altı karakter ipucu tutulur.

## Davetiye davranışı

- Etkinlik paylaşım ayarları dinamik `og:*` ve Twitter metadata üretir.
- Özel görsel yoksa seçilen temanın görseli kullanılabilir.
- Sesli karşılama otomatik başlamaz; misafir oynatma düğmesine basar.
- Sesli karşılama başladığında arka plan müziği durur ve mesaj bittiğinde önceki duruma döner.
- Yeni müzik yüklemeleri doğrudan ses dosyasıdır; eski YouTube kayıtları geriye dönük uyumluluk için korunur.
- IBAN alanı yalnızca iki ayrı etkinleştirme ayarı açıkken ve etkinlik yayınlandığında görünür.

## Canlıya alma kapısı

1. Önce `20260803000100`, `20260803000200`, `20260803000300`, ardından `20260803000400` çalıştırılmalıdır.
2. R2 CORS ayarı production alan adından `PUT` isteğine izin vermelidir.
3. Ses yükleme, ses/müzik çakışması, WhatsApp kartı ve kişisel bağlantı gizli sekmede doğrulanmalıdır.
4. Migration uygulanmadan bu kod production `main` dalına alınmamalıdır.
