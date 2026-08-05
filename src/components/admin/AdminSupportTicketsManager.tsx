import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  Send,
  ExternalLink,
  Tag,
} from "lucide-react";
import { getAdminSupportTickets, updateSupportTicket } from "@/lib/admin/support.api";
import type { AdminSupportTicket } from "@/lib/admin/types";
import { toast } from "sonner";

interface AdminSupportTicketsManagerProps {
  adminEmail: string;
}

export function AdminSupportTicketsManager({ adminEmail }: AdminSupportTicketsManagerProps) {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null);
  const [savingTicket, setSavingTicket] = useState(false);

  // Edit fields
  const [status, setStatus] = useState<any>("new");
  const [priority, setPriority] = useState<any>("normal");
  const [adminNotes, setAdminNotes] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getAdminSupportTickets({ status: filterStatus });
      setTickets(data);
    } catch (error) {
      toast.error("Destek talepleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const openDetailModal = (ticket: AdminSupportTicket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setAdminNotes(ticket.adminNotes || "");
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    setSavingTicket(true);
    try {
      await updateSupportTicket(adminEmail, selectedTicket.id, {
        status,
        priority,
        adminNotes: adminNotes.trim() || null,
      });
      toast.success("Talep güncellendi.");
      await loadTickets();
      setSelectedTicket(null);
    } catch (error) {
      toast.error("Güncelleme başarısız.");
    } finally {
      setSavingTicket(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Destek Talepleri</h2>
          <p className="text-sm text-muted-foreground">
            Kullanıcıların ve ziyaretçilerin ilettiği soru, öneri ve destek mesajlarını yönetin.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-card/60 p-3 rounded-2xl border border-border">
        {(
          [
            { id: "all", label: "Tümü" },
            { id: "new", label: "Yeni" },
            { id: "in_progress", label: "İnceleniyor" },
            { id: "waiting_user", label: "Kullanıcı Bekleniyor" },
            { id: "resolved", label: "Çözüldü" },
            { id: "closed", label: "Kapalı" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filterStatus === tab.id
                ? "bg-gold text-zinc-950 font-semibold"
                : "bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <span className="text-xs text-muted-foreground">Talepler yükleniyor...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-16 text-center bg-card/40 rounded-2xl border border-border text-muted-foreground text-sm">
          Destek talebi bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => openDetailModal(ticket)}
              className="bg-card/70 border border-border hover:border-gold/40 rounded-2xl p-5 cursor-pointer transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                      ticket.priority === "urgent"
                        ? "bg-rose-500/20 text-rose-400"
                        : ticket.priority === "high"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                  <h4 className="font-semibold text-foreground text-sm">{ticket.subject}</h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{ticket.message}</p>
                <div className="text-[11px] text-muted-foreground flex items-center gap-3 pt-1">
                  <span>Gönderen: {ticket.name} ({ticket.email})</span>
                  <span>•</span>
                  <span>{new Date(ticket.createdAt).toLocaleString("tr-TR")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <span
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium ${
                    ticket.status === "new"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : ticket.status === "resolved"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-surface text-muted-foreground"
                  }`}
                >
                  {ticket.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">{selectedTicket.subject}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedTicket.name} • {selectedTicket.email}
              </p>
            </div>

            {/* Message Body */}
            <div className="p-4 rounded-2xl bg-surface/50 border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {selectedTicket.message}
            </div>

            {/* Contact quick buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(selectedTicket.subject)}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-gold" />
                E-Posta ile Yanıtla
              </a>
              {selectedTicket.phone && (
                <a
                  href={`tel:${selectedTicket.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Ara ({selectedTicket.phone})
                </a>
              )}
            </div>

            {/* Status & Priority selects */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="font-medium text-xs text-foreground block">Durum:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                >
                  <option value="new">Yeni</option>
                  <option value="in_progress">İnceleniyor</option>
                  <option value="waiting_user">Kullanıcı Bekleniyor</option>
                  <option value="resolved">Çözüldü</option>
                  <option value="closed">Kapalı</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="font-medium text-xs text-foreground block">Öncelik:</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                >
                  <option value="low">Düşük</option>
                  <option value="normal">Normal</option>
                  <option value="high">Yüksek</option>
                  <option value="urgent">Acil</option>
                </select>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <span className="font-medium text-xs text-foreground block">Yönetici Notu:</span>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Bu destek talebi hakkında dahili not..."
                className="w-full p-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={handleSaveTicket}
                disabled={savingTicket}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90 disabled:opacity-50 shadow-lg shadow-gold/20"
              >
                {savingTicket && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
