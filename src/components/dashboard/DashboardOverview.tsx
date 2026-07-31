import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  MessageSquare,
  Radio,
  Users,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getDashboardStats, type InvitationRow } from "@/lib/invitations.api";

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

const statusLabel: Record<string, string> = {
  yes: "Katılıyor",
  no: "Katılamıyor",
  maybe: "Belirsiz",
};

export function DashboardOverview({ invitation }: { invitation: InvitationRow }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getDashboardStats(invitation.id)
      .then((data) => active && setStats(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [invitation.id]);

  const daysLeft = invitation.event_date
    ? Math.max(0, Math.ceil((new Date(invitation.event_date).getTime() - Date.now()) / 86400000))
    : null;

  const chartData = useMemo(
    () => [
      { name: "Katılıyor", value: stats?.rsvpBreakdown.yes ?? 0, color: "#21d477" },
      { name: "Belirsiz", value: stats?.rsvpBreakdown.maybe ?? 0, color: "#f0b95b" },
      { name: "Katılamıyor", value: stats?.rsvpBreakdown.no ?? 0, color: "#ee566d" },
    ],
    [stats],
  );
  const chartTotal = chartData.reduce((sum, item) => sum + item.value, 0);
  const visibleChartData =
    chartTotal > 0 ? chartData : [{ name: "Henüz yanıt yok", value: 1, color: "#292929" }];

  const topCards = [
    {
      label: "Katılım Onaylandı",
      value: stats?.rsvpBreakdown.yes ?? "—",
      detail: `${stats?.totalRsvp ?? 0} LCV yanıtı`,
      icon: Users,
      color: "text-muted-foreground bg-card",
    },
    {
      label: "Yüklenen Fotoğraf",
      value: stats?.photoCount ?? "—",
      detail: stats ? `${stats.videoCount} video da yüklendi` : "Veriler yükleniyor",
      icon: ImageIcon,
      color: "text-[#b44cff] bg-[#2b1435]",
    },
    {
      label: "Ziyaretçi Defteri Notu",
      value: stats?.messagesCount ?? "—",
      detail: "Misafirlerden gelen mesajlar",
      icon: MessageSquare,
      color: "text-[#ff8b35] bg-[#351d10]",
    },
  ];

  return (
    <div className="animate-in space-y-7 fade-in slide-in-from-bottom-3 duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#ee566d]">Etkinlik merkezi</p>
          <h2 className="mt-2 font-display text-3xl text-foreground">Genel Bakış</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {daysLeft === null
              ? "Etkinlik tarihi henüz belirlenmedi."
              : daysLeft === 0
                ? "Büyük gün geldi!"
                : `Etkinliğinize son ${daysLeft} gün kaldı.`}
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-white/[0.035] px-4 py-2 text-xs text-zinc-300">
          <Radio className="h-3.5 w-3.5 text-emerald-400" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Canlı Veri Akışı
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-[#ee566d]/25 bg-rose/10 p-4 text-sm text-[#ff8da0]">
          Panel verileri şu anda alınamadı. Sayfayı yenileyerek tekrar deneyin.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {topCards.map((card) => (
          <article
            key={card.label}
            className="rounded-[1.75rem] border border-border bg-[#141515] p-6 shadow-[0_20px_70px_rgba(0,0,0,.18)]"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-6 font-display text-4xl text-foreground">{card.value}</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">{card.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_1fr_1fr]">
        <article className="rounded-[1.75rem] border border-border bg-[#141515] p-6">
          <div className="flex items-center gap-2 text-sm text-zinc-200">
            <Clock3 className="h-4 w-4 text-muted-foreground" /> Son Bildirimler
          </div>
          <div className="mt-5 divide-y divide-white/5">
            {(stats?.recentRsvps ?? []).map((rsvp) => (
              <div
                key={`${rsvp.guest_name}-${rsvp.created_at}`}
                className="flex items-center gap-3 py-3.5"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${rsvp.status === "yes" ? "bg-emerald-500 text-black" : rsvp.status === "no" ? "bg-rose text-foreground" : "bg-amber-400 text-black"}`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{rsvp.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{statusLabel[rsvp.status] ?? rsvp.status}</p>
                </div>
                <span className="text-xs text-zinc-300">{rsvp.party_size ?? 0} kişi</span>
              </div>
            ))}
            {stats && stats.recentRsvps.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Henüz bir LCV yanıtı yok.</p>
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-border bg-[#141515] p-6">
          <div className="flex items-center gap-2 text-sm text-zinc-200">
            <ImageIcon className="h-4 w-4 text-muted-foreground" /> Galeriye Eklenenler
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {(stats?.recentUploads ?? []).map((upload) => (
              <div
                key={`${upload.file_url}-${upload.created_at}`}
                className="aspect-square overflow-hidden rounded-xl bg-card"
              >
                {upload.file_type.startsWith("image/") ? (
                  <img
                    src={upload.file_url}
                    alt="Misafir yüklemesi"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[10px] text-muted-foreground">
                    VİDEO
                  </div>
                )}
              </div>
            ))}
          </div>
          {stats && stats.recentUploads.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Henüz galeriye medya eklenmedi.
            </p>
          ) : null}
        </article>

        <article className="rounded-[1.75rem] border border-border bg-[#141515] p-6">
          <div>
            <p className="text-sm text-zinc-200">LCV Dağılımı</p>
            <p className="mt-1 text-xs text-muted-foreground">Katılımcı sayısına göre canlı görünüm</p>
          </div>
          <div className="relative mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={78}
                  paddingAngle={chartTotal ? 3 : 0}
                  stroke="none"
                >
                  {visibleChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                {chartTotal > 0 ? (
                  <Tooltip
                    contentStyle={{
                      background: "#0d0e0e",
                      border: "1px solid #333",
                      borderRadius: 12,
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                ) : null}
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-3xl text-foreground">{chartTotal}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">katılımcı</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center">
            {chartData.map((item) => (
              <div key={item.name}>
                <span
                  className="mx-auto block h-1.5 w-6 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <p className="mt-2 text-lg text-foreground">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.name}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
