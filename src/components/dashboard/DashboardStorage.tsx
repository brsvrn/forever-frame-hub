import { HardDrive, Clock, AlertTriangle } from "lucide-react";
import type { InvitationRow } from "@/lib/invitations.api";

export function DashboardStorage({ invitation }: { invitation: InvitationRow }) {
  // Mock data - should be fetched from DB
  const limitBytes = 20 * 1024 * 1024 * 1024; // 20GB default
  const usedBytes = 8.4 * 1024 * 1024 * 1024; // 8.4GB used
  const percentage = Math.round((usedBytes / limitBytes) * 100);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Depolama</h2>
        <p className="text-zinc-400 text-sm">Paketinizin sunduğu depolama alanı ve kullanım durumu.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-zinc-800/50 rounded-2xl text-gold">
              <HardDrive className="w-8 h-8" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Kullanılan Alan</p>
              <h3 className="text-3xl font-semibold text-white">
                {formatBytes(usedBytes)} <span className="text-zinc-500 text-xl font-normal">/ {formatBytes(limitBytes)}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-amber-500/80 bg-amber-500/10 px-4 py-2 rounded-xl text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Depolama %{percentage} dolu
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-6">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold/80 to-gold rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
          <div>
            <p className="text-zinc-500 text-sm mb-1">Fotoğraf</p>
            <p className="text-white font-medium">348 adet (3.1 GB)</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm mb-1">Video</p>
            <p className="text-white font-medium">42 adet (5.3 GB)</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm mb-1">Kalan Kota</p>
            <p className="text-emerald-400 font-medium">{formatBytes(limitBytes - usedBytes)} kullanılabilir</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-start gap-4">
        <Clock className="w-6 h-6 text-zinc-500 shrink-0" />
        <div>
          <h4 className="text-white font-medium mb-1">Otomatik Silinme (Data Retention)</h4>
          <p className="text-zinc-400 text-sm mb-4">
            Premium Experience paketine göre yüklenen medyalar, etkinlik tarihinden itibaren 90 gün boyunca saklanır. Süre bitimine 7 gün kala tarafınıza uyarı maili iletilecektir.
          </p>
          <p className="text-sm">
            <span className="text-zinc-500">Planlanan silinme tarihi: </span>
            <span className="text-white font-medium">24 Kasım 2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
