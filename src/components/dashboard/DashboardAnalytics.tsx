import { useEffect, useState } from "react";
import { BarChart2, CheckCircle2, HardDrive, Image, LineChart, Loader2, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAnalyticsStats, type InvitationRow } from "@/lib/invitations.api";

type AnalyticsStats = Awaited<ReturnType<typeof getAnalyticsStats>>;

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index > 1 ? 2 : 0)} ${units[index]}`;
}

const tooltipStyle = { background: "#18181b", border: "1px solid #3f3f46", borderRadius: 12 };

export function DashboardAnalytics({ invitation }: { invitation: InvitationRow }) {
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAnalyticsStats(invitation.id)
      .then((result) => active && setData(result))
      .catch(
        (reason) =>
          active && setError(reason instanceof Error ? reason.message : "Veriler alınamadı."),
      );
    return () => {
      active = false;
    };
  }, [invitation.id]);

  if (!data && !error) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Loader2 className="size-5 animate-spin" /> İstatistikler yükleniyor…
      </div>
    );
  }
  if (!data) return <div className="text-rose-400">İstatistikler alınamadı: {error}</div>;

  const cards = [
    {
      label: "Toplam LCV Yanıtı",
      value: data.totalResponses,
      detail: `${data.totalGuests} kişi bildirildi`,
      icon: CheckCircle2,
    },
    {
      label: "Katılacak Misafir",
      value: data.attendingGuests,
      detail: `%${data.attendanceRate} katılım payı`,
      icon: Users,
    },
    {
      label: "Yüklenen Medya",
      value: data.uploadCount,
      detail: `${data.photoCount} fotoğraf · ${data.videoCount} video`,
      icon: Image,
    },
    {
      label: "Depolama Kullanımı",
      value: formatBytes(data.storageUsed),
      detail: "Gerçek dosya boyutu",
      icon: HardDrive,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="mb-2 font-display text-2xl font-medium text-white">İstatistikler</h2>
        <p className="text-sm text-zinc-400">
          LCV ve medya yüklemelerinden hesaplanan gerçek etkinlik verileri.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-4 w-fit rounded-lg bg-zinc-800 p-2 text-gold">
              <card.icon className="size-5" />
            </div>
            <p className="mb-1 text-sm text-zinc-400">{card.label}</p>
            <h3 className="text-2xl font-semibold text-white">{card.value}</h3>
            <p className="mt-2 text-xs text-zinc-500">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-6 flex items-center gap-2">
            <LineChart className="size-5 text-zinc-400" />
            <h3 className="font-medium text-white">Son 7 Gün Etkileşimi</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyActivity}>
                <defs>
                  <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d8b77b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#d8b77b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="lcv"
                  name="LCV"
                  stroke="#d8b77b"
                  fill="url(#goldArea)"
                />
                <Area
                  type="monotone"
                  dataKey="medya"
                  name="Medya"
                  stroke="#fb7185"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-6 flex items-center gap-2">
            <BarChart2 className="size-5 text-zinc-400" />
            <h3 className="font-medium text-white">Saatlere Göre Etkileşim</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourActivity}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="lcv" name="LCV" fill="#d8b77b" radius={[5, 5, 0, 0]} />
                <Bar dataKey="medya" name="Medya" fill="#fb7185" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
