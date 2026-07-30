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
import { storage } from "@/lib/storage-adapter";
import { toast } from "sonner";

export interface GuestUpload {
  id: string;
  guest_name: string;
  file_url: string;
  file_path?: string | null;
  file_type: string;
  file_size: number;
  is_favorite: boolean;
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
    async function fetchUploads() {
      const { data, error } = await supabase
        .from("guest_uploads")
        .select("*")
        .eq("invitation_id", invitation.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const accessibleUploads = await Promise.all(
          (data as GuestUpload[]).map(async (upload) => ({
            ...upload,
            file_url: await storage.getViewUrl("memorywedding-uploads", upload.file_url),
          })),
        );
        setUploads(accessibleUploads);
      }
      setLoading(false);
    }

    fetchUploads();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("schema-db-changes")
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
          const accessibleUpload = {
            ...newUpload,
            file_url: await storage.getViewUrl("memorywedding-uploads", newUpload.file_url),
          };
          setUploads((prev) => [accessibleUpload, ...prev]);
        },
      )
      .subscribe();

    return () => {
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
    const uploadsToDelete = uploads.filter((u) => idsToDelete.includes(u.id));

    // 1. Delete from database
    const { error: dbError } = await supabase.from("guest_uploads").delete().in("id", idsToDelete);

    if (dbError) {
      toast.error("Medya silinirken hata oluştu: " + dbError.message);
      return;
    }

    // 2. Delete from storage
    for (const upload of uploadsToDelete) {
      if (upload.file_url) {
        try {
          const path = upload.file_path || storage.getFilePath("memorywedding-uploads", upload.file_url);
          if (path) {
            await storage.deleteFile("memorywedding-uploads", path);
          }
        } catch (err) {
          console.error("Storage delete error", err);
        }
      }
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
        const result = await storage.downloadFile(
          "memorywedding-uploads",
          upload.file_path || upload.file_url,
        );
        if (!result.blob) continue;
        const path = upload.file_path || storage.getFilePath("memorywedding-uploads", upload.file_url);
        const fallbackExtension = upload.file_type.startsWith("video/") ? "mp4" : "jpg";
        const fileName = path.split("/").pop() || `memory-${upload.id}.${fallbackExtension}`;
        const objectUrl = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
        completed++;
      }

      if (completed === items.length) toast.success(`${completed} medya indirildi`);
      else if (completed > 0)
        toast.warning(`${completed} medya indirildi, bazı dosyalar alınamadı`);
      else toast.error("Dosyalar indirilemedi. Depo okuma yetkisini kontrol edin.");
    } finally {
      setDownloading(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation(); // Kart seçimi tetiklenmesin

    const { error } = await supabase
      .from("guest_uploads")
      .update({ is_favorite: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Favori durumu güncellenemedi: " + error.message);
    } else {
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_favorite: !currentStatus } : u)),
      );
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
          <h2 className="text-2xl font-display font-medium text-white mb-2">Medya Galerisi</h2>
          <p className="text-zinc-400 text-sm">
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
                className="p-2 text-zinc-300 hover:text-white bg-zinc-800 rounded-md transition-colors tooltip"
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
                className="p-2 text-zinc-300 hover:text-rose-500 bg-zinc-800 rounded-md transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={toggleSelectAll}
            className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
            title="Tümünü Seç"
          >
            <CheckSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Misafir adına göre ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors text-white"
          />
        </div>
        <div className="flex bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 shrink-0">
          {[
            { id: "all", label: "Tümü", icon: null },
            { id: "photos", label: "Fotoğraf", icon: ImageIcon },
            { id: "videos", label: "Video", icon: Video },
            { id: "favorites", label: "Favoriler", icon: Heart },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${filter === f.id ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"}`}
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
                  src={upload.file_url}
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                  onClick={(event) => event.stopPropagation()}
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
                  className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${upload.is_favorite ? "bg-rose-500/20 text-rose-500" : "bg-black/40 text-white/70 hover:text-white opacity-0 group-hover:opacity-100"}`}
                >
                  <Heart className="w-4 h-4" fill={upload.is_favorite ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Selection Indicator */}
              <div
                className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-gold border-gold text-black" : "border-white/50 bg-black/20 opacity-0 group-hover:opacity-100"}`}
              >
                {isSelected && <CheckSquare className="w-3 h-3" />}
              </div>

              {/* Video Indicator */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                </div>
              )}

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-sm font-medium truncate">{upload.guest_name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-zinc-400 text-xs">
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
              </div>
            </div>
          );
        })}
      </div>

      {filteredUploads.length === 0 && (
        <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">Bu filtrelere uygun medya bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
