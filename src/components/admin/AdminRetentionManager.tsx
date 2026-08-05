import { useState, useEffect } from "react";
import {
  HardDrive,
  Clock,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Trash2,
  Play,
} from "lucide-react";
import { getRetentionJobs, runRetentionScan } from "@/lib/admin/retention.api";
import type { AdminRetentionJob } from "@/lib/admin/types";
import { toast } from "sonner";

interface AdminRetentionManagerProps {
  adminEmail: string;
}

export function AdminRetentionManager({ adminEmail }: AdminRetentionManagerProps) {
  const [jobs, setJobs] = useState<AdminRetentionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningScan, setRunningScan] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getRetentionJobs();
      setJobs(data);
    } catch (error) {
      toast.error("Saklama kayıtları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleRunScan = async () => {
    setRunningScan(true);
    try {
      const result = await runRetentionScan(adminEmail);
      toast.success(
        `Tarama tamamlandı! Süresi dolan ${result.expiredCodesDeactivated} kod kapatıldı.`
      );
      await loadJobs();
    } catch (error) {
      toast.error("Tarama sırasında hata oluştu.");
    } finally {
      setRunningScan(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Saklama & Temizleme Kuyruğu (Retention)
          </h2>
          <p className="text-sm text-muted-foreground">
            Süresi dolan etkinliklerin, kapanan QR yükleme pencerelerinin ve depolama temizlik
            işlemlerinin yönetimi.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={runningScan}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90 disabled:opacity-50 shadow-lg shadow-gold/20 self-start sm:self-auto"
        >
          {runningScan ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>Otomatik Taramayı Çalıştır</span>
        </button>
      </div>

      {/* Lifecycle Rules Explanation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card/70 border border-border space-y-2">
          <div className="flex items-center gap-2 text-gold font-semibold text-xs">
            <Clock className="w-4 h-4" />
            1. QR Yükleme Penceresi (5 Gün)
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Düğün tarihinden itibaren 5 gün boyunca misafirler masadaki QR kodu okutarak fotoğraf/video
            yükleyebilir. 5 gün sonra yükleme otomatik kapanır.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card/70 border border-border space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <HardDrive className="w-4 h-4" />
            2. Medya Saklama (60 Gün / 2 Ay)
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Çiftler düğünden sonra 60 gün boyunca tüm misafir fotoğraflarını orijinal kalitede toplu
            olarak indirebilir.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card/70 border border-border space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
            <Calendar className="w-4 h-4" />
            3. Davetiye Sayfası (1 Yıl)
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dijital davetiye linki 1 tam yıl boyunca yayında kalır. Çift dilerse bu süre admin
            tarafından uzatılabilir.
          </p>
        </div>
      </div>

      {/* Jobs History Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground">Temizleme ve Tarama Geçmişi</h3>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center bg-card/40 rounded-2xl border border-border text-muted-foreground text-xs">
            Henüz çalıştırılmış bir temizleme kuyruğu işlemi bulunmamaktadır.
          </div>
        ) : (
          <div className="bg-card/70 border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/60 text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-medium">Tarih</th>
                  <th className="px-5 py-3 font-medium">İşlem Türü</th>
                  <th className="px-5 py-3 font-medium">Bağlı Etkinlik</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium">Açılan Alan / Dosya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-accent/5">
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(job.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-foreground">{job.jobType}</td>
                    <td className="px-5 py-3.5 text-foreground">
                      {job.invitationSlug ? `/${job.invitationSlug}` : "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          job.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground">
                      {job.filesCount} dosya ({formatBytes(job.bytesFreed)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
