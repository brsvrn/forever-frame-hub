import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CreditCard,
  Key,
  HardDrive,
  QrCode,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { getAdminDashboardStats } from "@/lib/admin/stats.api";
import { purgeTestOrders } from "@/lib/admin/orders.api";
import type { AdminStats } from "@/lib/admin/types";
import { toast } from "sonner";

interface AdminDashboardOverviewProps {
  onNavigateTab: (tabId: string) => void;
  adminEmail: string;
}

export function AdminDashboardOverview({ onNavigateTab, adminEmail }: AdminDashboardOverviewProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getAdminDashboardStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePurgeTestOrders = async () => {
    if (!window.confirm("Veritabanındaki tüm test / deneme sipariş kayıtlarını kalıcı olarak silmek istediğinize emin misiniz?")) {
      return;
    }
    setPurging(true);
    try {
      const res = await purgeTestOrders(adminEmail);
      toast.success(`${res.count} adet test siparişi veritabanından temizlendi.`);
      await fetchStats();
    } catch (error) {
      toast.error("Test siparişleri temizlenirken hata oluştu.");
    } finally {
      setPurging(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-amber-950/30 border border-gold/20 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sistem Sahibi Paneli
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Hoş Geldiniz, {adminEmail.split("@")[0]}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              MemoryWedding platformundaki tüm gerçek etkinlikleri, canlı ödemeleri, kullanım kodlarını ve sistem ayarlarını buradan yönetebilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading || purging}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-border text-xs font-medium text-foreground transition-all hover:border-gold/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-gold" : ""}`} />
              Yenile
            </button>
            <button
              onClick={() => onNavigateTab("codes")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90 shadow-lg shadow-gold/20"
            >
              <Key className="w-3.5 h-3.5" />
              VIP Kod Oluştur
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Test Orders Notice & Purge Option (Only shown if test data exists) */}
      {(stats?.testOrdersCount || 0) > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Geliştirme / Test Sipariş Kaydı Bulundu ({stats?.testOrdersCount} adet)
              </h4>
              <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
                Veritabanında önceki testlerden kalan <strong>{stats?.testOrdersCount} adet</strong> test işlemi tespit edildi. Bunlar canlı cironuza <u>dahil edilmemiştir</u>.
              </p>
            </div>
          </div>
          <button
            onClick={handlePurgeTestOrders}
            disabled={purging}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {purging ? "Temizleniyor..." : "Test Verilerini Temizle"}
          </button>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Revenue */}
        <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-gold/40 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Toplam Ciro (Net Canlı)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-sans text-foreground">
              {loading ? "..." : formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">Bu Ay:</span>
              <span>{loading ? "..." : formatCurrency(stats?.monthRevenue || 0)}</span>
            </div>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-gold/40 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Etkinlikler</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-sans text-foreground">
              {loading ? "..." : stats?.totalEvents || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span className="text-blue-400 font-medium">{stats?.publishedEvents || 0} Yayında</span>
              <span>•</span>
              <span>{stats?.draftEvents || 0} Taslak</span>
            </div>
          </div>
        </div>

        {/* Active QR & Uploads */}
        <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-gold/40 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">QR Yükleme Açık</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-sans text-foreground">
              {loading ? "..." : stats?.activeQrUploadEvents || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span>{stats?.totalMediaFiles || 0} Misafir Medyası</span>
            </div>
          </div>
        </div>

        {/* Users & Codes */}
        <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-gold/40 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Kayıtlı Kullanıcı</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-sans text-foreground">
              {loading ? "..." : stats?.totalUsers || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span>{stats?.activeCodes || 0} Aktif VIP/Promo Kod</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage & Privacy Status */}
        <div className="bg-card/60 border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-4">
              <HardDrive className="w-4 h-4 text-gold" />
              Depolama ve Medya Durumu
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Kullanılan Alan</span>
                <span className="font-semibold text-foreground">
                  {loading ? "..." : formatBytes(stats?.totalMediaStorageBytes || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Toplam Medya Dosyası</span>
                <span className="font-semibold text-foreground">
                  {loading ? "..." : stats?.totalMediaFiles || 0} adet
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-border/50 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Gizlilik Koruması Aktif:</strong> Misafirlerin yüklediği özel fotoğraflar admin panelinde gösterilmez; yalnızca adet ve depolama boyutu izlenir.
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("retention")}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs font-medium text-foreground transition-colors"
          >
            <span>Saklama ve Temizleme Kuyruğu</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Orders & PayTR Summary */}
        <div className="bg-card/60 border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-4">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Sipariş & PayTR Durumu (Canlı)
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Başarılı Ödemeler</span>
                <span className="font-semibold text-emerald-400">
                  {loading ? "..." : stats?.paidOrders || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Bekleyen İşlemler</span>
                <span className="font-semibold text-amber-400">
                  {loading ? "..." : stats?.pendingOrders || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Başarısız / İptal</span>
                <span className="font-semibold text-rose-400">
                  {loading ? "..." : stats?.failedOrders || 0}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("orders")}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs font-medium text-foreground transition-colors"
          >
            <span>Tüm Siparişleri İncele</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Nav Shortcuts */}
        <div className="bg-card/60 border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              Hızlı İşlemler
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab("events")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/50 hover:bg-surface border border-border/50 text-xs text-foreground transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Etkinlik Yönetimi</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                onClick={() => onNavigateTab("codes")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/50 hover:bg-surface border border-border/50 text-xs text-foreground transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-gold" />
                  <span>Kullanım & VIP Kodları</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                onClick={() => onNavigateTab("users")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/50 hover:bg-surface border border-border/50 text-xs text-foreground transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Kullanıcı ve Rol Yönetimi</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                onClick={() => onNavigateTab("settings")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/50 hover:bg-surface border border-border/50 text-xs text-foreground transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>Bakım Modu & Sistem Ayarları</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
