-- Instagram content approval queue for @memoryweddingtr.
-- Publication is intentionally opt-in: seed content starts in pending_approval.

create table if not exists public.social_content_queue (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  platform text not null default 'instagram'
    check (platform in ('instagram')),
  account_handle text not null default 'memoryweddingtr',
  content_type text not null
    check (content_type in ('image', 'carousel', 'reel')),
  status text not null default 'pending_approval'
    check (status in (
      'draft',
      'pending_approval',
      'approved',
      'publishing',
      'published',
      'rejected',
      'failed'
    )),
  title text not null,
  caption text not null,
  media_urls text[] not null default '{}',
  thumbnail_url text,
  publish_at timestamptz not null,
  notes text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  platform_media_id text,
  last_error text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(media_urls) between 1 and 10),
  check (
    (content_type = 'carousel' and cardinality(media_urls) between 2 and 10)
    or (content_type in ('image', 'reel') and cardinality(media_urls) = 1)
  )
);

create index if not exists social_content_queue_review_idx
  on public.social_content_queue (publish_at, created_at)
  where status = 'pending_approval';

create index if not exists social_content_queue_publish_idx
  on public.social_content_queue (publish_at, created_at)
  where status in ('approved', 'publishing');

create index if not exists social_content_queue_approved_by_idx
  on public.social_content_queue (approved_by)
  where approved_by is not null;

drop trigger if exists social_content_queue_updated_at on public.social_content_queue;
create trigger social_content_queue_updated_at
before update on public.social_content_queue
for each row execute function public.update_updated_at_column();

alter table public.social_content_queue enable row level security;

drop policy if exists social_content_queue_admin_select on public.social_content_queue;
drop policy if exists social_content_queue_admin_insert on public.social_content_queue;
drop policy if exists social_content_queue_admin_update on public.social_content_queue;
drop policy if exists social_content_queue_admin_delete on public.social_content_queue;

create policy social_content_queue_admin_select
on public.social_content_queue for select to authenticated
using ((select public.has_role('admin'::public.app_role, (select auth.uid()))));

create policy social_content_queue_admin_insert
on public.social_content_queue for insert to authenticated
with check ((select public.has_role('admin'::public.app_role, (select auth.uid()))));

create policy social_content_queue_admin_update
on public.social_content_queue for update to authenticated
using ((select public.has_role('admin'::public.app_role, (select auth.uid()))))
with check ((select public.has_role('admin'::public.app_role, (select auth.uid()))));

create policy social_content_queue_admin_delete
on public.social_content_queue for delete to authenticated
using ((select public.has_role('admin'::public.app_role, (select auth.uid()))));

revoke all on public.social_content_queue from anon;
grant select, insert, update, delete on public.social_content_queue to authenticated;
grant all on public.social_content_queue to service_role;

insert into public.social_content_queue (
  content_key,
  content_type,
  status,
  title,
  caption,
  media_urls,
  thumbnail_url,
  publish_at,
  notes
) values
  (
    'mw-2026-08-11-dijital-davetiye',
    'reel',
    'pending_approval',
    'Düğün organizasyonunda yeni standart',
    E'Düğün davetiyeniz yalnızca bir link olmasın; misafirleriniz için baştan sona zarif bir deneyime dönüşsün. ✨\n\nMemoryWedding ile dijital davetiye, müzik, harita ve LCV takibi tek yerde. Ücretsiz önizlemenizi dakikalar içinde hazırlayın.\n\nProfildeki bağlantıdan temanızı seçin.\n\n#dijitaldavetiye #düğünhazırlığı #düğünplanlama #evleniyoruz #memorywedding',
    array['https://www.memory-wedding.com/videos/turquoise-cove.mp4'],
    'https://www.memory-wedding.com/logo.jpg',
    '2026-08-11 20:30:00+03',
    'Açılış metni: “Düğününüz, kusursuz bir deneyim.” Son kare CTA: “Ücretsiz önizle”.'
  ),
  (
    'mw-2026-08-12-rsvp',
    'reel',
    'pending_approval',
    'Tek tek misafir arama dönemi bitti',
    E'“Düğüne katılabilecek misiniz?” diye herkesi tek tek aramak zorunda değilsiniz.\n\nDavetlileriniz LCV yanıtını tek dokunuşla gönderir; siz kimlerin geleceğini yönetim panelinden anında görürsünüz. Daha az takip, daha sakin bir hazırlık süreci.\n\nSiz de ücretsiz deneyin.\n\n#lcv #rsvp #düğünorganizasyonu #gelinadayları #dijitaldavetiye',
    array['https://www.memory-wedding.com/videos/aegean-morning.mp4'],
    'https://www.memory-wedding.com/logo.jpg',
    '2026-08-12 20:30:00+03',
    'Ekran yazıları: “Tek tek arama yok” → “Yanıtlar tek panelde” → “Düğününüze odaklanın”.'
  ),
  (
    'mw-2026-08-13-qr-galeri',
    'reel',
    'pending_approval',
    '“Bana da atarsın” cümlesi tarih oluyor',
    E'Misafirlerinizin çektiği düğün fotoğrafları WhatsApp konuşmalarında kaybolmasın. 📸\n\nMasalardaki MemoryWedding QR kartını okutan herkes fotoğraf ve videolarını canlı galeriye yükleyebilir. Uygulama indirmek gerekmez; anılar tek yerde toplanır.\n\nQR Galeri paketini profil bağlantısından inceleyin.\n\n#düğünfotoğrafları #qrcode #canlıgaleri #düğünfikirleri #memorywedding',
    array['https://www.memory-wedding.com/videos/golden-sunset.mp4'],
    'https://www.memory-wedding.com/logo.jpg',
    '2026-08-13 20:30:00+03',
    'İlk 2 saniye kancası: “Misafir fotoğrafları nerede kaldı?”'
  ),
  (
    'mw-2026-08-14-tema-secimi',
    'reel',
    'pending_approval',
    'Hikâyenize uyan temayı seçin',
    E'Deniz esintisi mi, İtalya romantizmi mi, yoksa zamansız bir balo salonu mu?\n\nMemoryWedding tema koleksiyonunda davetiyenizi tarzınıza göre seçebilir, ödeme yapmadan önce telefonunuzda canlı olarak önizleyebilirsiniz.\n\nYorumlara düğün temanızı yazın: Deniz, Doğa, İtalya veya Lüks?\n\n#düğünteması #davetiyetasarımı #weddinginspiration #nişanlılık #düğün2026',
    array['https://www.memory-wedding.com/videos/lake-como-garden.mp4'],
    'https://www.memory-wedding.com/logo.jpg',
    '2026-08-14 20:30:00+03',
    'Etkileşim hedefi: yorum. Son karede dört tema seçeneğini göster.'
  ),
  (
    'mw-2026-08-15-bes-dakika',
    'reel',
    'pending_approval',
    'Davetiyeniz yaklaşık 5 dakikada hazır',
    E'İsimlerinizi, tarihinizi ve mekân bilgilerinizi girin. Temanızı seçin. Önizlemenizi kontrol edin. İşte bu kadar. ✨\n\nMemoryWedding ile dijital davetiyenizi yaklaşık 5 dakikada hazırlayıp misafirlerinizle paylaşabilirsiniz. Üstelik önizleme ücretsiz.\n\nBaşlamak için profil bağlantısına dokunun.\n\n#düğünhazırlıkları #dijitaldüğün #davetiye #evlilikhazırlığı #memorywedding',
    array['https://www.memory-wedding.com/videos/amalfi-lemon-terrace.mp4'],
    'https://www.memory-wedding.com/logo.jpg',
    '2026-08-15 20:30:00+03',
    'Üç adımlı kurulum akışını kısa ekran yazılarıyla anlat.'
  ),
  (
    'mw-2026-08-16-maliyet',
    'reel',
    'pending_approval',
    'Baskı ve dağıtım maliyetine modern alternatif',
    E'Basılı davetiyede tasarım, baskı ve dağıtım ayrı ayrı uğraş ister. Dijital davetiyede ise davet, harita, müzik ve LCV tek bağlantıda buluşur.\n\nMemoryWedding paketleri tek seferlik ödeme ile sunulur; abonelik ve gizli ücret yoktur. Güncel paketleri profil bağlantısından karşılaştırabilirsiniz.\n\n#düğünbütçesi #düğünmasrafları #dijitaldavetiye #düğünönerileri #evleniyoruz',
    array['https://www.memory-wedding.com/videos/soft-sand-dunes.mp4'],
    'https://www.memory-wedding.com/logo.jpg',
    '2026-08-16 20:30:00+03',
    'Fiyatı videoya sabitleme; sitedeki güncel paket sayfasına yönlendir.'
  ),
  (
    'mw-2026-08-17-tam-deneyim',
    'reel',
    'pending_approval',
    'Davetiyeden anı toplamaya tek deneyim',
    E'Davetiyenizi gönderin, LCV yanıtlarını takip edin ve düğün günü misafirlerinizin çektiği anıları QR galeriyle toplayın.\n\nMemoryWedding 2’si Bir Arada paket, düğün öncesinden düğün sonrasına kadar bütün dijital deneyimi tek yerde birleştirir.\n\nKarar vermeden önce ücretsiz önizleyin.\n\n#düğünteknolojisi #düğündavetiyesi #düğünanı #gelindamat #memorywedding',
    array['https://www.memory-wedding.com/videos/grand-ballroom.mp4'],
    'https://www.memory-wedding.com/logo.jpg',
    '2026-08-17 20:30:00+03',
    'Haftanın satış odaklı içeriği. CTA: ücretsiz önizleme.'
  )
on conflict (content_key) do nothing;
