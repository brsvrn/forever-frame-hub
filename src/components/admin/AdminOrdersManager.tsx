import { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Loader2,
  RefreshCw,
  Tag,
  Globe,
  Share2,
} from "lucide-react";
import { getAdminOrders, updateOrderAdminNotes } from "@/lib/admin/orders.api";
import type { AdminOrderSummary } from "@/lib/admin/types";
import { toast } from "sonner";

interface AdminOrdersManagerProps {
  adminEmail: string;
}

export function AdminOrdersManager({ adminEmail }: AdminOrdersManagerProps) {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "success" | "pending" | "failed" | "refunded"
  >("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderSummary | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  // Edit fields
  const [adminNotes, setAdminNotes] = useState("");
  const [refundStatus, setRefundStatus] = useState<
    "none" | "requested" | "under_review" | "externally_refunded"
  >("none");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders({
        status: filterStatus,
      });
      setOrders(data);
    } catch (error) {
      toast.error("Siparişler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const openDetailModal = (order: AdminOrderSummary) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || "");
    setRefundStatus(order.refundStatus || "none");
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setSavingNotes(true);
    try {
      await updateOrderAdminNotes(adminEmail, selectedOrder.id, adminNotes, refundStatus);
      toast.success("Sipariş bilgileri güncellendi.");
      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error("Güncelleme başarısız.");
    } finally {
      setSavingNotes(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const valInTL = amount > 10000 ? amount / 100 : amount;
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(valInTL);
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.merchantOid.toLowerCase().includes(q) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(q)) ||
      (o.userName && o.userName.toLowerCase().includes(q)) ||
      (o.invitationSlug && o.invitationSlug.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Sipariş & PayTR Yönetimi</h2>
          <p className="text-sm text-muted-foreground">
            Tüm PayTR işlemlerini, tutarları, UTM dönüşüm kaynaklarını ve iade durumlarını izleyin.
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
            placeholder="Sipariş No (merchant_oid), e-posta, link ara..."
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
              { id: "success", label: "Başarılı" },
              { id: "pending", label: "Bekleyen" },
              { id: "failed", label: "Başarısız" },
              { id: "refunded", label: "İadeler" },
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

      {/* Orders Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <span className="text-xs text-muted-foreground">Siparişler yükleniyor...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-card/40 rounded-2xl border border-border text-muted-foreground text-sm">
          Sipariş bulunamadı.
        </div>
      ) : (
        <div className="bg-card/70 border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Sipariş No (PayTR)</th>
                  <th className="px-5 py-3.5 font-medium">Müşteri</th>
                  <th className="px-5 py-3.5 font-medium">Tutar & Paket</th>
                  <th className="px-5 py-3.5 font-medium">Durum</th>
                  <th className="px-5 py-3.5 font-medium">Kaynak / UTM</th>
                  <th className="px-5 py-3.5 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-accent/5 transition-colors group cursor-pointer"
                    onClick={() => openDetailModal(order)}
                  >
                    {/* Merchant OID */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-semibold text-foreground text-xs">
                        {order.merchantOid}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleString("tr-TR")}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="text-foreground font-medium text-xs">
                        {order.userName || order.userEmail || "Bilinmiyor"}
                      </div>
                      {order.partnerNames && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {order.partnerNames}
                        </div>
                      )}
                    </td>

                    {/* Amount & Package */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground">
                        {formatCurrency(order.amount)}
                      </div>
                      <div className="text-[11px] text-muted-foreground capitalize">
                        {order.packageType}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                            order.status === "success" || (order.status as any) === "paid"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : order.status === "pending"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {order.status === "success" || (order.status as any) === "paid" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : order.status === "pending" ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span className="capitalize">{order.status}</span>
                        </span>

                        {order.isTestOrder && (
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            [Test Siparişi]
                          </span>
                        )}

                        {order.refundStatus !== "none" && (
                          <span className="text-[10px] text-rose-400 font-semibold">
                            İade: {order.refundStatus}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* UTM / Source Badge */}
                    <td className="px-5 py-4 text-xs">
                      {order.firstUtmSource || order.lastUtmSource ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface border border-border text-foreground font-mono text-[11px]">
                          <Tag className="w-3 h-3 text-gold" />
                          <span>
                            {order.lastUtmSource || order.firstUtmSource} /{" "}
                            {order.lastUtmMedium || order.firstUtmMedium || "cpc"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Direkt / Organik</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openDetailModal(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground transition-all"
                      >
                        <span>Detay</span>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase mb-1">
                  PayTR İşlem Detayı
                </div>
                <h3 className="text-lg font-mono font-bold text-foreground">
                  {selectedOrder.merchantOid}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-foreground font-sans">
                  {formatCurrency(selectedOrder.amount)}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {selectedOrder.packageType} Paketi
                </div>
              </div>
            </div>

            {/* Customer & Event Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface/50 border border-border space-y-1.5">
                <span className="text-muted-foreground font-medium block">Müşteri Bilgileri</span>
                <div className="font-semibold text-foreground text-sm">
                  {selectedOrder.userName || "İsim Yok"}
                </div>
                <div className="text-muted-foreground">{selectedOrder.userEmail}</div>
                <div className="text-[11px] font-mono text-muted-foreground/70">
                  Kullanıcı ID: {selectedOrder.userId}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface/50 border border-border space-y-1.5">
                <span className="text-muted-foreground font-medium block">Bağlı Etkinlik</span>
                {selectedOrder.invitationSlug ? (
                  <>
                    <div className="font-semibold text-foreground text-sm">
                      {selectedOrder.partnerNames || selectedOrder.invitationSlug}
                    </div>
                    <a
                      href={`/davet/${selectedOrder.invitationSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-gold hover:underline mt-1"
                    >
                      <span>/{selectedOrder.invitationSlug}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                ) : (
                  <span className="text-muted-foreground">Bağlı etkinlik bulunamadı.</span>
                )}
              </div>
            </div>

            {/* Attribution & Marketing Information */}
            <div className="p-4 rounded-2xl bg-surface/50 border border-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Share2 className="w-4 h-4 text-gold" />
                Pazarlama & Dönüşüm Takibi (Attribution)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-card p-2 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">UTM Source</span>
                  <span className="font-mono font-medium text-foreground">
                    {selectedOrder.lastUtmSource || selectedOrder.firstUtmSource || "-"}
                  </span>
                </div>
                <div className="bg-card p-2 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">UTM Medium</span>
                  <span className="font-mono font-medium text-foreground">
                    {selectedOrder.lastUtmMedium || selectedOrder.firstUtmMedium || "-"}
                  </span>
                </div>
                <div className="bg-card p-2 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">UTM Campaign</span>
                  <span className="font-mono font-medium text-foreground truncate block">
                    {selectedOrder.lastUtmCampaign || selectedOrder.firstUtmCampaign || "-"}
                  </span>
                </div>
                <div className="bg-card p-2 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">GCLID / FBCLID</span>
                  <span className="font-mono font-medium text-foreground">
                    {selectedOrder.gclid ? "Google Ads" : selectedOrder.fbclid ? "Meta Ads" : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Refund Status & Admin Notes */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="font-medium text-xs text-foreground block">
                  Harici İade Takip Durumu:
                </span>
                <select
                  value={refundStatus}
                  onChange={(e) => setRefundStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                >
                  <option value="none">İade Yok (Normal)</option>
                  <option value="requested">Müşteri İade Talep Etti</option>
                  <option value="under_review">İncelemede</option>
                  <option value="externally_refunded">PayTR / Banka Üzerinden İade Edildi</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="font-medium text-xs text-foreground block">Yönetici Notu:</span>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Bu sipariş ile ilgili yönetici notları..."
                  className="w-full p-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50 resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90 disabled:opacity-50 shadow-lg shadow-gold/20"
              >
                {savingNotes && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Not ve Durumu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
