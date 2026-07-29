import { LineChart, BarChart2, MousePointerClick, Clock, TrendingUp, Users } from "lucide-react";
import type { InvitationRow } from "@/lib/invitations.api";

export function DashboardAnalytics({ invitation }: { invitation: InvitationRow }) {
  const stats = [
    { label: "Toplam Ziyaret", value: "1,248", change: "+12%", icon: MousePointerClick },
    { label: "Tekil Ziyaretçi", value: "856", change: "+5%", icon: Users },
    { label: "Ortalama Süre", value: "2 dk 14 sn", change: "+30s", icon: Clock },
    { label: "RSVP Dönüşüm", value: "%68", change: "+4%", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">İstatistikler</h2>
        <p className="text-zinc-400 text-sm">Davetiyenizin ziyaretçi ve etkileşim metrikleri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-zinc-800 rounded-lg text-gold">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-semibold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <LineChart className="w-5 h-5 text-zinc-400" />
            <h3 className="text-white font-medium">Günlük Ziyaretçi Grafiği</h3>
          </div>
          <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 text-sm">Grafik Verisi Yükleniyor...</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-zinc-400" />
            <h3 className="text-white font-medium">En Çok Ziyaret Edilen Saatler</h3>
          </div>
          <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 text-sm">Grafik Verisi Yükleniyor...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
