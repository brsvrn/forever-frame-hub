import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Radio } from "lucide-react";
import heroCouple from "@/assets/hero-couple.jpg";
import invitationCard from "@/assets/invitation-card.jpg";
import qrGuests from "@/assets/qr-guests.jpg";
import themeAmalfi from "@/assets/theme-amalfi-lemon-terrace.png";
import themeEmerald from "@/assets/theme-emerald-forest.png";
import themeComo from "@/assets/theme-lake-como-garden.png";
import { supabase } from "@/integrations/supabase/client";
import type { ThemeConfig } from "@/lib/theme-engine";
import { getGuestUploadViewUrl } from "@/lib/r2-actions";

type MemoryPhoto = {
  id: string;
  file_url: string;
  file_type: string;
  guest_name: string | null;
  note: string | null;
  created_at: string;
  status: string | null;
};

const demoPhotoSources = [
  heroCouple,
  invitationCard,
  qrGuests,
  themeAmalfi,
  themeEmerald,
  themeComo,
  qrGuests,
  themeComo,
  heroCouple,
  themeEmerald,
  invitationCard,
  themeAmalfi,
];

const demoPhotos: MemoryPhoto[] = demoPhotoSources.map((file_url, index) => ({
  id: `demo-memory-${index}`,
  file_url,
  file_type: "image/jpeg",
  guest_name: ["Elif", "Mert", "Selin", "Can", "Zeynep", "Deniz"][index % 6],
  note:
    index % 3 === 0
      ? [
          "Ömür boyu mutluluklar!",
          "Bu güzel geceyi hep hatırlayın.",
          "Birlikte nice mutlu yıllara!",
        ][index % 3]
      : null,
  created_at: new Date(Date.now() - index * 60_000).toISOString(),
  status: "active",
}));

export function MemoryWall({
  theme,
  invitationId,
  isDemo = false,
}: {
  theme: ThemeConfig;
  invitationId: string;
  isDemo?: boolean;
}) {
  const [photos, setPhotos] = useState<MemoryPhoto[]>(isDemo ? demoPhotos : []);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(!isDemo);

  const loadPhotos = useCallback(async () => {
    if (isDemo) {
      setPhotos(demoPhotos);
      setLoading(false);
      return;
    }

    try {
      let { data, error } = await supabase
        .from("guest_uploads")
        .select("id,file_url,file_type,guest_name,note,created_at,status")
        .eq("invitation_id", invitationId)
        .order("created_at", { ascending: false });

      // Eski kurulumlarda note alanı henüz eklenmemiş olabilir; duvar yine de çalışsın.
      if (error?.message.toLowerCase().includes("note")) {
        const fallback = await supabase
          .from("guest_uploads")
          .select("id,file_url,file_type,guest_name,created_at,status")
          .eq("invitation_id", invitationId)
          .order("created_at", { ascending: false });
        data = fallback.data?.map((photo) => ({ ...photo, note: null })) ?? null;
        error = fallback.error;
      }

      if (!error && data) {
        const activePhotos = data.filter(
          (upload) =>
            upload.file_type?.startsWith("image/") &&
            (!upload.status || upload.status === "active" || upload.status === "approved"),
        );
        const photosWithAccess = await Promise.all(
          activePhotos.map(async (photo) => {
            try {
              const res = await getGuestUploadViewUrl({ data: { uploadId: photo.id } });
              return {
                ...photo,
                file_url: res.url || photo.file_url,
              };
            } catch {
              return photo;
            }
          }),
        );
        setPhotos(photosWithAccess);
      }
    } catch (err) {
      console.error("Error loading memory wall photos:", err);
    } finally {
      setLoading(false);
    }
  }, [invitationId, isDemo]);

  useEffect(() => {
    void loadPhotos();

    if (isDemo) return;

    const channel = supabase
      .channel(`memory-wall-${invitationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guest_uploads",
          filter: `invitation_id=eq.${invitationId}`,
        },
        () => void loadPhotos(),
      )
      .subscribe();

    const polling = window.setInterval(() => void loadPhotos(), 15_000);

    return () => {
      window.clearInterval(polling);
      void supabase.removeChannel(channel);
    };
  }, [invitationId, isDemo, loadPhotos]);

  useEffect(() => {
    const updatePageSize = () => setPageSize(window.innerWidth < 768 ? 5 : 10);
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(photos.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1));
    if (totalPages <= 1) return;

    const rotation = window.setInterval(() => {
      setPage((current) => (current + 1) % totalPages);
    }, 10_000);

    return () => window.clearInterval(rotation);
  }, [totalPages, pageSize]);

  const visiblePhotos = useMemo(
    () => photos.slice(page * pageSize, page * pageSize + pageSize),
    [page, pageSize, photos],
  );

  return (
    <section className="relative flex min-h-dvh snap-start items-center px-4 py-24 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-9 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/75 backdrop-blur-xl">
            <Radio className="size-3.5 text-rose-300" aria-hidden="true" />
            Canlı fotoğraf akışı
          </span>
          <h3 className={`mt-5 text-4xl text-white sm:text-6xl ${theme.styles.typography.display}`}>
            Anı Duvarı
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
            Misafirlerimizin gözünden gecenin en güzel anları. Yeni fotoğraflar duvara otomatik
            olarak eklenir.
          </p>
        </header>

        <div className="relative py-4 sm:py-8">
          {loading ? (
            <div className="relative grid min-h-80 place-items-center text-sm text-white/65">
              Anılar hazırlanıyor…
            </div>
          ) : visiblePhotos.length === 0 ? (
            <div className="relative grid min-h-80 place-items-center px-6 text-center">
              <div>
                <ImageIcon className="mx-auto size-10 text-white/40" aria-hidden="true" />
                <p className="mt-4 text-lg text-white">İlk anı bekleniyor</p>
                <p className="mt-2 text-sm text-white/60">
                  Misafirler fotoğraf yüklediğinde anı duvarı otomatik olarak canlanacak.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${page}-${pageSize}-${visiblePhotos[0]?.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={
                  visiblePhotos.length === 1
                    ? "relative flex justify-center py-3"
                    : "relative grid grid-cols-2 items-start justify-items-center gap-4 py-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5"
                }
              >
                {visiblePhotos.map((photo, index) => (
                  <motion.figure
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: [-2.2, 1.7, -1.1, 2.4, -1.8][index % 5],
                      y: [8, 28, 0, 22, 6][index % 5],
                    }}
                    transition={{ delay: index * 0.045, duration: 0.55 }}
                    className={`group relative w-full max-w-[15rem] rounded-md border border-white/80 bg-white p-2.5 pb-4 text-zinc-800 shadow-[0_14px_38px_rgba(0,0,0,.28)] ${
                      index === 0 && visiblePhotos.length % 2 === 1
                        ? "col-span-2 sm:col-span-1"
                        : ""
                    }`}
                  >
                    <figcaption className="mb-2 px-1 py-1 text-center text-[0.68rem] font-semibold leading-tight text-zinc-700">
                      {photo.guest_name && photo.guest_name !== "İsimsiz Misafir"
                        ? `Yükleyen: ${photo.guest_name}`
                        : "Bir misafir yükledi"}
                    </figcaption>
                    <img
                      src={photo.file_url}
                      alt={
                        photo.guest_name
                          ? `${photo.guest_name} tarafından paylaşılan anı`
                          : "Düğün anısı"
                      }
                      className="aspect-[4/5] w-full object-cover transition-transform duration-[4000ms] group-hover:scale-[1.025]"
                      loading="lazy"
                    />
                    <div className="px-1 pt-3">
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-zinc-400">
                        {new Date(photo.created_at).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {photo.note?.trim() ? (
                        <blockquote className="mt-2 border-t border-zinc-100 px-1 pt-2 text-xs italic leading-relaxed text-zinc-600">
                          “{photo.note.trim()}”
                        </blockquote>
                      ) : null}
                    </div>
                  </motion.figure>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {photos.length > 0 ? (
            <div className="mt-4 flex items-center gap-4 px-1">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  key={`progress-${page}-${pageSize}`}
                  className="h-full rounded-full"
                  style={{ backgroundColor: theme.qr.accent }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: totalPages > 1 ? 10 : 1, ease: "linear" }}
                />
              </div>
              <span className="text-[0.65rem] font-semibold tracking-widest text-white/55">
                {page + 1} / {totalPages}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
