import { useEffect, useState } from "react";
import { AlertTriangle, Clock, HardDrive, Loader2 } from "lucide-react";
import { getStorageStats, type InvitationRow } from "@/lib/invitations.api";

type StorageStats = Awaited<ReturnType<typeof getStorageStats>>;

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index > 1 ? 2 : 0)} ${units[index]}`;
}

export function DashboardStorage({ invitation }: { invitation: InvitationRow }) {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    getStorageStats(invitation)
      .then((result) => active && setStats(result))
      .catch(
        (reason) =>
          active && setError(reason instanceof Error ? reason.message : "Veriler alınamadı."),
      );
    return () => {
      active = false;
    };
  }, [invitation]);

  if (!stats && !error) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Depolama verileri yükleniyor…
      </div>
    );
  }

  if (!stats) return <div className="text-rose-400">Depolama verileri alınamadı: {error}</div>;

  const percentage = stats.limitBytes
    ? Math.min(100, Math.round((stats.usedBytes / stats.limitBytes) * 100))
    : 0;
  const remaining = Math.max(0, stats.limitBytes - stats.usedBytes);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="mb-2 font-display text-2xl font-medium text-foreground">Depolama</h2>
        <p className="text-sm text-muted-foreground">Yüklenen gerçek dosyalar ve paket kotanız.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 lg:p-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-accent/10/50 p-4 text-gold">
              <HardDrive className="size-8" />
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Kullanılan Alan · {stats.packageName}</p>
              <h3 className="text-3xl font-semibold text-foreground">
                {formatBytes(stats.usedBytes)}{" "}
                <span className="text-xl font-normal text-muted-foreground">
                  / {stats.limitBytes ? formatBytes(stats.limitBytes) : "Kota tanımlanmamış"}
                </span>
              </h3>
            </div>
          </div>
          {stats.limitBytes > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-500/80">
              <AlertTriangle className="size-4" /> Depolama %{percentage} dolu
            </div>
          )}
        </div>

        <div className="relative mb-6 h-4 w-full overflow-hidden rounded-full bg-accent/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-border pt-6 md:grid-cols-3">
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Fotoğraf</p>
            <p className="font-medium text-foreground">
              {stats.photoCount} adet ({formatBytes(stats.photoBytes)})
            </p>
          </div>
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Video</p>
            <p className="font-medium text-foreground">
              {stats.videoCount} adet ({formatBytes(stats.videoBytes)})
            </p>
          </div>
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Kalan Kota</p>
            <p className="font-medium text-emerald-400">
              {stats.limitBytes
                ? `${formatBytes(remaining)} kullanılabilir`
                : "Paket kotası tanımlanmamış"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-6">
        <Clock className="size-6 shrink-0 text-muted-foreground" />
        <div>
          <h4 className="mb-1 font-medium text-foreground">Otomatik Silinme</h4>
          <p className="mb-4 text-sm text-muted-foreground">
            {stats.retentionDays > 0
              ? `${stats.packageName} kapsamında yüklenen medyalar etkinlik tarihinden itibaren ${stats.retentionDays} gün saklanır.`
              : "Bu paket için saklama süresi tanımlanmamış."}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Planlanan silinme tarihi: </span>
            <span className="font-medium text-foreground">
              {stats.deleteDate
                ? new Date(stats.deleteDate).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Henüz belirlenmedi"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
