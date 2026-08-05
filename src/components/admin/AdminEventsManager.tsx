import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  ExternalLink,
  Trash2,
  RotateCcw,
  Clock,
  HardDrive,
  ShieldAlert,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode,
  Loader2,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  getAdminEvents,
  updateEventLifecycleDates,
  softDeleteEvent,
  restoreEvent,
} from "@/lib/admin/events.api";
import type { AdminEventSummary } from "@/lib/admin/types";
import { toast } from "sonner";

interface AdminEventsManagerProps {
  adminEmail: string;
}

export function AdminEventsManager({ adminEmail }: AdminEventsManagerProps) {
  const [events, setEvents] = useState<AdminEventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft" | "paid" | "unpaid" | "deleted"
  >("all");
  const [selectedEvent, setSelectedEvent] = useState<AdminEventSummary | null>(null);
  const [savingLifecycle, setSavingLifecycle] = useState(false);

  // Edit fields
  const [adminNotes, setAdminNotes] = useState("");
  const [customQrCloseDate, setCustomQrCloseDate] = useState("");
  const [customRetentionDate, setCustomRetentionDate] = useState("");
  const [customInvitationExpireDate, setCustomInvitationExpireDate] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getAdminEvents({
        includeDeleted: filterStatus === "deleted",
        filterStatus,
      });
      setEvents(data);
    } catch (error) {
      toast.error("Etkinlikler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [filterStatus]);

  const openDetailModal = (event: AdminEventSummary) => {
    setSelectedEvent(event);
    setAdminNotes(event.adminNotes || "");
    setCustomQrCloseDate(
      event.qrClosingAt ? new Date(event.qrClosingAt).toISOString().slice(0, 16) : ""
    );
    setCustomRetentionDate(
      event.retentionExpiresAt ? new Date(event.retentionExpiresAt).toISOString().slice(0, 16) : ""
    );
    setCustomInvitationExpireDate(
      event.invitationExpiresAt ? new Date(event.invitationExpiresAt).toISOString().slice(0, 16) : ""
    );
  };

  const handleSaveLifecycle = async () => {
    if (!selectedEvent) return;
    setSavingLifecycle(true);
    try {
      await updateEventLifecycleDates(adminEmail, selectedEvent.id, {
        qrClosingAt: customQrCloseDate ? new Date(customQrCloseDate).toISOString() : null,
        retentionExpiresAt: customRetentionDate ? new Date(customRetentionDate).toISOString() : null,
        invitationExpiresAt: customInvitationExpireDate
          ? new Date(customInvitationExpireDate).toISOString()
          : null,
        adminNotes: adminNotes.trim() || null,
      });
      toast.success("Etkinlik süre ve bilgileri güncellendi.");
      await loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      toast.error("Güncelleme başarısız oldu.");
    } finally {
      setSavingLifecycle(false);
    }
  };

  const handleQuickExtendQr = (days: number) => {
    const currentBase = customQrCloseDate
      ? new Date(customQrCloseDate)
      : selectedEvent?.eventDate
        ? new Date(selectedEvent.eventDate)
        : new Date();
    const newDate = new Date(currentBase.getTime() + days * 24 * 60 * 60 * 1000);
    setCustomQrCloseDate(newDate.toISOString().slice(0, 16));
    toast.info(`QR yükleme süresi +${days} gün uzatıldı.`);
  };

  const handleQuickExtendInvitation = (years: number) => {
    const currentBase = customInvitationExpireDate
      ? new Date(customInvitationExpireDate)
      : selectedEvent?.eventDate
        ? new Date(selectedEvent.eventDate)
        : new Date();
    const newDate = new Date(currentBase);
    newDate.setFullYear(newDate.getFullYear() + years);
    setCustomInvitationExpireDate(newDate.toISOString().slice(0, 16));
    toast.info(`Davetiye yayını +${years} yıl uzatıldı.`);
  };

  const handleSoftDelete = async (eventId: string) => {
    if (!confirm("Bu etkinliği silmek (arşivlemek) istediğinizden emin misiniz?")) return;
    try {
      await softDeleteEvent(adminEmail, eventId);
      toast.success("Etkinlik arşive taşındı.");
      await loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  const handleRestore = async (eventId: string) => {
    try {
      await restoreEvent(adminEmail, eventId);
      toast.success("Etkinlik geri yüklendi.");
      await loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  const filteredEvents = events.filter((ev) => {
    const q = searchQuery.toLowerCase();
    return (
      ev.partnerOne.toLowerCase().includes(q) ||
      ev.partnerTwo.toLowerCase().includes(q) ||
      ev.slug.toLowerCase().includes(q) ||
      ev.venue.toLowerCase().includes(q) ||
      ev.city.toLowerCase().includes(q) ||
      (ev.userEmail && ev.userEmail.toLowerCase().includes(q))
    );
  });

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Etkinlik Yönetimi</h2>
          <p className="text-sm text-muted-foreground">
            Platformdaki tüm davetiyeleri, yayın durumlarını, QR yükleme sürelerini ve saklama tarihlerini yönetin.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="İsim, link (slug), şehir, sahip e-postası ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: "all", label: "Tümü" },
              { id: "published", label: "Yayında" },
              { id: "draft", label: "Taslak" },
              { id: "paid", label: "Ödenmiş" },
              { id: "unpaid", label: "Ödenmemiş" },
              { id: "deleted", label: "Silinenler" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? "bg-gold text-zinc-950 font-semibold"
                  : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <span className="text-xs text-muted-foreground">Etkinlikler yükleniyor...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center bg-card/40 rounded-2xl border border-border text-muted-foreground text-sm">
          Arama kriterlerine uygun etkinlik bulunamadı.
        </div>
      ) : (
        <div className="bg-card/70 border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Çift / Başlık</th>
                  <th className="px-5 py-3.5 font-medium">Tarih & Şehir</th>
                  <th className="px-5 py-3.5 font-medium">Paket & Tema</th>
                  <th className="px-5 py-3.5 font-medium">Durum</th>
                  <th className="px-5 py-3.5 font-medium">Medya & Alan</th>
                  <th className="px-5 py-3.5 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-accent/5 transition-colors group cursor-pointer"
                    onClick={() => openDetailModal(event)}
                  >
                    {/* Partners & Slug */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">
                        {event.partnerOne} & {event.partnerTwo}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                        <span>/{event.slug}</span>
                      </div>
                    </td>

                    {/* Date & Venue */}
                    <td className="px-5 py-4">
                      <div className="text-foreground">
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString("tr-TR")
                          : "Tarih Yok"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.city || "Şehir belirtilmemiş"}
                      </div>
                    </td>

                    {/* Package & Theme */}
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-medium text-foreground">
                        <span className="capitalize">{event.packageType}</span>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize mt-1">
                        {event.theme}
                      </div>
                    </td>

                    {/* Status Badges */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {event.deletedAt ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-400 font-medium">
                            Silinmiş
                          </span>
                        ) : (
                          <>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                event.isPublished
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {event.isPublished ? "Yayında" : "Taslak"}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                event.isPaid
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-zinc-500/20 text-zinc-400"
                              }`}
                            >
                              {event.isPaid ? "Ödenmiş" : "Ücretsiz / Bekliyor"}
                            </span>

                            {event.qrUploadOpen && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gold/20 text-gold font-medium">
                                QR Açık
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Media counts (Metadata ONLY, no image previews) */}
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      <div>
                        {event.photoCount} Fotoğraf • {event.videoCount} Video
                      </div>
                      <div className="text-foreground/80 font-medium mt-0.5">
                        {formatBytes(event.totalStorageBytes)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openDetailModal(event)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground transition-all"
                      >
                        <span>Detay & Süre</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Detail & Lifecycle Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  {selectedEvent.partnerOne} & {selectedEvent.partnerTwo}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID: {selectedEvent.id} • Sahip: {selectedEvent.userEmail || selectedEvent.userId}
                </p>
              </div>
              <a
                href={`/davet/${selectedEvent.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold text-xs font-medium border border-gold/30 transition-all"
              >
                <span>Davetiyeyi Aç</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Privacy-safe Media Summary */}
            <div className="p-4 rounded-2xl bg-surface/50 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-gold" />
                  Misafir Yüklemeleri (Metadata Özeti)
                </span>
                <span className="text-emerald-400 font-mono">Gizlilik Korumalı</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-card p-2.5 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground block">Fotoğraf</span>
                  <span className="font-bold text-foreground text-sm">{selectedEvent.photoCount}</span>
                </div>
                <div className="bg-card p-2.5 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground block">Video</span>
                  <span className="font-bold text-foreground text-sm">{selectedEvent.videoCount}</span>
                </div>
                <div className="bg-card p-2.5 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground block">Depolama</span>
                  <span className="font-bold text-foreground text-sm">
                    {formatBytes(selectedEvent.totalStorageBytes)}
                  </span>
                </div>
              </div>
            </div>

            {/* Lifecycle Extensions & Controls */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" />
                Süre ve Yayın Ayarları
              </h4>

              {/* QR Upload Closing Date */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">QR Fotoğraf Yükleme Kapanış Tarihi:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickExtendQr(3)}
                      className="px-2 py-0.5 rounded bg-surface hover:bg-accent/10 border border-border text-[11px] text-gold"
                    >
                      +3 Gün
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickExtendQr(7)}
                      className="px-2 py-0.5 rounded bg-surface hover:bg-accent/10 border border-border text-[11px] text-gold"
                    >
                      +7 Gün
                    </button>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  value={customQrCloseDate}
                  onChange={(e) => setCustomQrCloseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Media Retention Expiry */}
              <div className="space-y-1.5">
                <span className="font-medium text-xs text-foreground block">
                  Medya Saklama Bitiş Tarihi (R2 / Depolama Temizliği):
                </span>
                <input
                  type="datetime-local"
                  value={customRetentionDate}
                  onChange={(e) => setCustomRetentionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Invitation Expiration Date */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Davetiye Sayfası Yayından Kalkış Tarihi:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickExtendInvitation(1)}
                    className="px-2 py-0.5 rounded bg-surface hover:bg-accent/10 border border-border text-[11px] text-gold"
                  >
                    +1 Yıl Uzat
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={customInvitationExpireDate}
                  onChange={(e) => setCustomInvitationExpireDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <span className="font-medium text-xs text-foreground block">Yönetici Notu:</span>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Etkinlik hakkında özel yönetici notu..."
                  className="w-full p-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50 resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
              <div>
                {selectedEvent.deletedAt ? (
                  <button
                    onClick={() => handleRestore(selectedEvent.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Etkinliği Geri Yükle
                  </button>
                ) : (
                  <button
                    onClick={() => handleSoftDelete(selectedEvent.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Etkinliği Sil (Arşive Taşı)
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleSaveLifecycle}
                  disabled={savingLifecycle}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90 disabled:opacity-50 shadow-lg shadow-gold/20"
                >
                  {savingLifecycle && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
