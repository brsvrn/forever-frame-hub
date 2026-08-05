import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Trash2,
  Heart,
  Filter,
  CheckSquare,
  Image as ImageIcon,
  Video,
  PlayCircle,
  Loader2,
} from "lucide-react";
import type { InvitationRow } from "@/lib/invitations.api";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteGuestUploads,
  getGuestUploadViewUrl,
  getR2DownloadUrl,
  updateGuestUpload,
} from "@/lib/r2-actions";
import { toast } from "sonner";

export interface GuestUpload {
  id: string;
  guest_name: string;
  file_url: string;
  file_path?: string | null;
  file_type: string;
  file_size: number;
  is_favorite: boolean;
  status: string | null;
  created_at: string;
}

export function DashboardGallery({ invitation }: { invitation: InvitationRow }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "photos" | "videos" | "favorites">("all");
  const [search, setSearch] = useState("");
  const [uploads, setUploads] = useState<GuestUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchUploads() {
      try {
        const { data, error } = await supabase
          .from("guest_uploads")
          .select(
            "id,guest_name,file_url,file_type,file_size,is_favorite,created_at,status,note,invitation_id",
          )
          .eq("invitation_id", invitation.id)
          .order("created_at", { ascending: false });

        if (!error && data && isMounted) {
          const accessibleUploads = await Promise.all(
            (data as GuestUpload[]).map(async (upload) => {
              try {
                const res = await getGuestUploadViewUrl({ data: { uploadId: upload.id } });
                return { ...upload, file_url: res.url || upload.file_url };
              } catch {
                return upload;
              }
            }),
          );
          if (isMounted) {
            setUploads(accessibleUploads);
          }
        }
      } catch (err) {
        console.error("Error fetching gallery uploads:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchUploads();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`gallery-${invitation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guest_uploads",
          filter: `invitation_id=eq.${invitation.id}`,
        },
        async (payload) => {
          const newUpload = payload.new as GuestUpload;
          let file_url = newUpload.file_url;
          try {
            const res = await getGuestUploadViewUrl({ data: { uploadId: newUpload.id } });
            if (res.url) file_url = res.url;
          } catch {}
          if (isMounted) {
            setUploads((prev) => [{ ...newUpload, file_url }, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [invitation.id]);

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmDelete = window.confirm(
      `${selectedIds.size} adet medyayı silmek istediğinize emin misiniz?`,
    );
    if (!confirmDelete) return;

    const idsToDelete = Array.from(selectedIds);
    try {
      await deleteGuestUploads({ data: { invitationId: invitation.id, uploadIds: idsToDelete } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Medya silinemedi.");
      return;
    }

    setUploads((prev) => prev.filter((u) => !selectedIds.has(u.id)));
    setSelectedIds(new Set());
    toast.success(`${idsToDelete.length} medya başarıyla silindi`);
  };

  const downloadUploads = async (items: GuestUpload[]) => {
    if (items.length === 0 || downloading) return;
    setDownloading(true);
    let completed = 0;

    try {
      for (const upload of items) {
        const result = await getR2DownloadUrl({ data: { uploadId: upload.id } });

        if (result.url) {
          // Direct download via presigned URL with Content-Disposition
          const link = document.createElement("a");
          link.href = result.url;
          document.body.appendChild(link);
          link.click();
          link.remove();
          completed++;
        }
      }

      if (completed === items.length) toast.success(`${completed} medya indirildi`);
      else if (completed > 0)
        toast.warning(`${completed} medya indirildi, bazı dosyalar alınamadı.`);
      else toast.error("Dosyalar indirilemedi. Depo okuma yetkisini kontrol edin.");
    } finally {
      setDownloading(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation(); // Kart seçimi tetiklenmesin

    try {
      await updateGuestUpload({
        data: { invitationId: invitation.id, uploadId: id, isFavorite: !currentStatus },
      });
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_favorite: !currentStatus } : u)),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Favori durumu güncellenemedi.");
    }
  };

  const moderateUpload = async (
    event: React.MouseEvent,
    id: string,
    status: "approved" | "rejected",
  ) => {
    event.stopPropagation();
    try {
      await updateGuestUpload({
        data: { invitationId: invitation.id, uploadId: id, status },
      });
      setUploads((current) =>
        current.map((upload) => (upload.id === id ? { ...upload, status } : upload)),
      );
      toast.success(status === "approved" ? "Medya onaylandı." : "Medya reddedildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Moderasyon işlemi tamamlanamadı.");
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === uploads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(uploads.map((u) => u.id)));
  };

  const filteredUploads = uploads.filter((u) => {
    if (filter === "photos" && !u.file_type.startsWith("image/")) return false;
    if (filter === "videos" && !u.file_type.startsWith("video/")) return false;
    if (filter === "favorites" && !u.is_favorite) return false;
    if (search && !u.guest_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-foreground mb-2">Medya Galerisi</h2>
          <p className="text-muted-foreground text-sm">
            Misafirlerinizin paylaştığı orijinal fotoğraflar ve videolar.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-4 bg-gold/10 px-4 py-2 rounded-lg border border-gold/20">
              <span className="text-gold text-sm font-medium mr-2">{selectedIds.size} seçildi</span>
              <button
                onClick={() =>
                  void downloadUploads(uploads.filter((upload) => selectedIds.has(upload.id)))
                }
                disabled={downloading}
                className="p-2 text-foreground hover:text-foreground bg-accent/10 rounded-md transition-colors tooltip"
                title="Seçilenleri indir"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-foreground hover:text-rose-500 bg-accent/10 rounded-md transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={toggleSelectAll}
            className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-colors"
            title="Tümünü Seç"
          >
            <CheckSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Misafir adına göre ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-foreground"
          />
        </div>
        <div className="flex bg-surface border border-border rounded-xl p-1 shrink-0">
          {[
            { id: "all", label: "Tümü", icon: null },
            { id: "photos", label: "Fotoğraf", icon: ImageIcon },
            { id: "videos", label: "Video", icon: Video },
            { id: "favorites", label: "Favoriler", icon: Heart },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${filter === f.id ? "bg-accent/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f.icon && (
                <f.icon className={`w-4 h-4 ${f.id === "favorites" ? "text-rose-500" : ""}`} />
              )}
              <span className="hidden sm:inline">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUploads.map((upload) => {
          const isSelected = selectedIds.has(upload.id);
          const isVideo = upload.file_type.startsWith("video/");

          return (
            <div
              key={upload.id}
              onClick={() => toggleSelect(upload.id)}
              className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? "border-gold" : "border-transparent"}`}
            >
              {isVideo ? (
                <video
                  src={`${upload.file_url}#t=0.1`}
                  className="h-full w-full object-cover pointer-events-none"
                  preload="metadata"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={upload.file_url}
                  alt={upload.guest_name ? `${upload.guest_name} yüklemesi` : "Misafir yüklemesi"}
                  className={`w-full h-full object-cover transition-transform duration-700 ${isSelected ? "scale-105" : "group-hover:scale-105"}`}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Top Icons */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={(e) => toggleFavorite(e, upload.id, upload.is_favorite)}
                  className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${upload.is_favorite ? "bg-rose-500/20 text-rose-500" : "bg-background/40 text-foreground/70 hover:text-foreground opacity-0 group-hover:opacity-100"}`}
                >
                  <Heart className="w-4 h-4" fill={upload.is_favorite ? "currentColor" : "none"} />
                </button>
              </div>

              {upload.status === "pending" ? (
                <div className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[0.65rem] font-semibold text-black">
                  Onay bekliyor
                </div>
              ) : null}

              {/* Selection Indicator */}
              <div
                className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-gold border-gold text-black" : "border-border0 bg-background/20 opacity-0 group-hover:opacity-100"}`}
                style={upload.status === "pending" ? { top: "3.25rem" } : undefined}
              >
                {isSelected && <CheckSquare className="w-3 h-3" />}
              </div>

              {/* Video Indicator */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-background/40 backdrop-blur-md flex items-center justify-center text-foreground">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                </div>
              )}

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-foreground text-sm font-medium truncate">{upload.guest_name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-muted-foreground text-xs">
                    {(upload.file_size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void downloadUploads([upload]);
                    }}
                    disabled={downloading}
                    className="text-gold text-xs font-medium hover:underline disabled:opacity-50"
                  >
                    İndir
                  </button>
                </div>
                {upload.status === "pending" ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(event) => void moderateUpload(event, upload.id, "approved")}
                      className="rounded-lg bg-emerald-500 px-2 py-2 text-xs font-medium text-white"
                    >
                      Onayla
                    </button>
                    <button
                      type="button"
                      onClick={(event) => void moderateUpload(event, upload.id, "rejected")}
                      className="rounded-lg bg-rose-500 px-2 py-2 text-xs font-medium text-white"
                    >
                      Reddet
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {filteredUploads.length === 0 && (
        <div className="py-20 text-center border border-dashed border-border rounded-2xl">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-muted-foreground">Bu filtrelere uygun medya bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
