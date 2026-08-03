import { useState, useEffect } from "react";
import {
  Download,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UserCheck,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import type { InvitationRow, RsvpRow } from "@/lib/invitations.api";
import { getRsvpResults, type RsvpResults } from "@/lib/rsvp.functions";
import { createRsvpSpreadsheetXml, pdfSafeText } from "@/lib/rsvp-export";

export function DashboardRSVP({ invitation }: { invitation: InvitationRow }) {
  const [rsvps, setRsvps] = useState<RsvpRow[] | null>(null);
  const [details, setDetails] = useState<RsvpResults | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "yes" | "no" | "maybe">("all");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getRsvpResults({ data: { invitationId: invitation.id } })
      .then((result) => {
        setDetails(result);
        setRsvps(result.rsvps as RsvpRow[]);
      })
      .catch(() => setLoadError("LCV yanıtları yüklenemedi. Lütfen sayfayı yenileyin."));
  }, [invitation.id]);

  if (loadError) {
    return <div className="rounded-xl border border-rose/30 bg-rose/10 p-5 text-rose">{loadError}</div>;
  }

  if (!rsvps) {
    return <div className="text-muted-foreground">Misafir Listesi Yükleniyor...</div>;
  }

  const filteredRsvps = rsvps.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.guest_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalComing = rsvps
    .filter((r) => r.status === "yes")
    .reduce((sum, r) => sum + r.party_size, 0);
  const totalDeclined = rsvps
    .filter((r) => r.status === "no")
    .reduce((sum, r) => sum + r.party_size, 0);
  const totalMaybe = rsvps
    .filter((r) => r.status === "maybe")
    .reduce((sum, r) => sum + r.party_size, 0);
  const attending = rsvps.filter((rsvp) => rsvp.status === "yes");
  const totalAdults = attending.reduce((sum, rsvp) => sum + Number(rsvp.adult_count || 0), 0);
  const totalChildren = attending.reduce((sum, rsvp) => sum + Number(rsvp.child_count || 0), 0);
  const transportCount = attending.filter((rsvp) => rsvp.transport_required === true).length;
  const mealBreakdown = Array.from(
    attending.reduce((counts, rsvp) => {
      const meal = rsvp.meal_preference?.trim();
      if (meal) counts.set(meal, (counts.get(meal) || 0) + Number(rsvp.party_size || 1));
      return counts;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const questionLabels = new Map(
    details?.questions.map((question) => [question.id, question.label]),
  );
  const scheduleLabels = new Map(
    details?.schedules.map((schedule) => [schedule.id, schedule.title]),
  );
  const detailText = (rsvpId: string) => {
    const eventNames = (details?.selections ?? [])
      .filter((selection) => selection.rsvp_id === rsvpId && selection.attending === true)
      .map((selection) => scheduleLabels.get(String(selection.schedule_id)))
      .filter(Boolean);
    const answerText = (details?.answers ?? [])
      .filter((answer) => answer.rsvp_id === rsvpId)
      .map(
        (answer) =>
          `${questionLabels.get(String(answer.question_id)) || "Soru"}: ${Array.isArray(answer.answer) ? answer.answer.join(" / ") : String(answer.answer ?? "")}`,
      );
    return { events: eventNames.join(" / "), answers: answerText.join(" | ") };
  };
  const rsvpPartySizes = new Map(rsvps.map((rsvp) => [rsvp.id, Number(rsvp.party_size || 1)]));
  const eventBreakdown = Array.from(
    (details?.selections ?? []).reduce((counts, selection) => {
      if (!selection.attending) return counts;
      const label = scheduleLabels.get(selection.schedule_id) || "Etkinlik";
      counts.set(label, (counts.get(label) || 0) + (rsvpPartySizes.get(selection.rsvp_id) || 1));
      return counts;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const exportHeaders = [
    "Misafir Adı",
    "Durum",
    "Kişi Sayısı",
    "Yetişkin",
    "Çocuk",
    "E-posta",
    "Telefon",
    "Yemek",
    "Alerji",
    "Ulaşım",
    "Katılacağı Etkinlikler",
    "Özel Soru Yanıtları",
    "Not",
    "Tarih",
  ];
  const statusLabels = { yes: "Katılıyor", no: "Katılamıyor", maybe: "Belirsiz" } as const;
  const exportRows = rsvps.map((rsvp) => {
    const extra = detailText(rsvp.id);
    return [
      rsvp.guest_name,
      statusLabels[rsvp.status],
      rsvp.party_size,
      rsvp.adult_count,
      rsvp.child_count,
      rsvp.guest_email,
      rsvp.guest_phone,
      rsvp.meal_preference,
      rsvp.allergy_info,
      rsvp.transport_required ? "Evet" : "Hayır",
      extra.events,
      extra.answers,
      rsvp.note,
      new Date(rsvp.created_at).toLocaleString("tr-TR"),
    ];
  });

  const downloadBlob = (blob: Blob, filename: string) => {
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const downloadCsv = () => {
    const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [exportHeaders, ...exportRows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");
    downloadBlob(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
      `${invitation.slug}-misafir-listesi.csv`,
    );
  };

  const downloadExcel = () => {
    const xml = createRsvpSpreadsheetXml(exportHeaders, exportRows);
    downloadBlob(
      new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" }),
      `${invitation.slug}-misafir-listesi.xls`,
    );
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(pdfSafeText(`${invitation.partner_one} & ${invitation.partner_two} - LCV Raporu`), 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      pdfSafeText(
        `Toplam yanit: ${rsvps.length} | Katilan: ${totalComing} | Yetiskin: ${totalAdults} | Cocuk: ${totalChildren}`,
      ),
      14,
      26,
    );
    let y = 36;
    exportRows.forEach((row, index) => {
      const line = pdfSafeText(
        `${index + 1}. ${row[0]} | ${row[1]} | ${row[2]} kisi | ${row[6] || "telefon yok"} | ${row[10] || "etkinlik belirtilmedi"}`,
      );
      const lines = doc.splitTextToSize(line, 180) as string[];
      if (y + lines.length * 5 > 285) {
        doc.addPage();
        y = 18;
      }
      doc.text(lines, 14, y);
      y += lines.length * 5 + 3;
    });
    doc.save(`${invitation.slug}-lcv-raporu.pdf`);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "yes":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "no":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case "maybe":
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      default:
        return null;
    }
  };

  const StatusLabel = ({ status }: { status: string }) => {
    switch (status) {
      case "yes":
        return <span className="text-emerald-400">Katılıyor</span>;
      case "no":
        return <span className="text-rose-400">Katılamıyor</span>;
      case "maybe":
        return <span className="text-amber-400">Belirsiz</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-foreground mb-2">
            Misafir Listesi (RSVP)
          </h2>
          <p className="text-muted-foreground text-sm">
            Katılım durumunu bildiren tüm misafirlerinizi buradan yönetin.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadExcel}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-gold/50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel İndir
          </button>
          <button
            type="button"
            onClick={() => void downloadPdf()}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-gold/50"
          >
            <FileText className="w-4 h-4" />
            PDF İndir
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-gold/50"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-sm mb-1">Toplam Yanıt</p>
          <p className="text-2xl font-semibold text-foreground">{rsvps.length}</p>
        </div>
        <div className="bg-surface border border-emerald-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-emerald-500/70 text-sm mb-1">Katılan Kişi</p>
          <p className="text-2xl font-semibold text-emerald-400">{totalComing}</p>
        </div>
        <div className="bg-surface border border-rose-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-rose-500/70 text-sm mb-1">Katılamayan</p>
          <p className="text-2xl font-semibold text-rose-400">{totalDeclined}</p>
        </div>
        <div className="bg-surface border border-amber-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-amber-500/70 text-sm mb-1">Belirsiz</p>
          <p className="text-2xl font-semibold text-amber-400">{totalMaybe}</p>
        </div>
        <div className="bg-surface border border-sky-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-sky-500/70 text-sm mb-1">Yanıt Beklenen</p>
          <p className="text-2xl font-semibold text-sky-400">{details?.pendingGuestLinks.length || 0}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card/30 p-5">
          <h3 className="text-sm font-medium text-foreground">Kişi Dağılımı</h3>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface p-3">
              <p className="text-2xl font-semibold">{totalAdults}</p>
              <p className="text-xs text-muted-foreground">Yetişkin</p>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <p className="text-2xl font-semibold">{totalChildren}</p>
              <p className="text-xs text-muted-foreground">Çocuk</p>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <p className="text-2xl font-semibold">{transportCount}</p>
              <p className="text-xs text-muted-foreground">Ulaşım</p>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card/30 p-5">
          <h3 className="text-sm font-medium text-foreground">Yemek Tercihleri</h3>
          <div className="mt-3 space-y-2 text-sm">
            {mealBreakdown.length ? (
              mealBreakdown.map(([label, count]) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="truncate text-muted-foreground">{label}</span>
                  <strong>{count}</strong>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Henüz yemek tercihi yok.</p>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card/30 p-5">
          <h3 className="text-sm font-medium text-foreground">Etkinlik Bazlı Katılım</h3>
          <div className="mt-3 space-y-2 text-sm">
            {eventBreakdown.length ? (
              eventBreakdown.map(([label, count]) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="truncate text-muted-foreground">{label}</span>
                  <strong>{count} kişi</strong>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Etkinlik bazlı seçim bulunmuyor.</p>
            )}
          </div>
        </section>
      </div>

      {details?.pendingGuestLinks.length ? (
        <section className="rounded-2xl border border-sky-900/30 bg-card/30 p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl">Yanıt Vermeyen Davetliler</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kişisel bağlantı gönderilmiş ancak henüz LCV yanıtı alınmamış davetliler.
              </p>
            </div>
            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm text-sky-400">
              {details.pendingGuestLinks.length} kişi
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {details.pendingGuestLinks.map((guest) => (
              <article key={guest.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{guest.guest_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {guest.guest_email || guest.guest_phone || "İletişim bilgisi yok"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{guest.invited_party_size} kişi</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {guest.view_count > 0
                    ? `Bağlantı ${guest.view_count} kez açıldı`
                    : "Bağlantı henüz açılmadı"}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Misafir adı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors text-foreground"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors text-foreground outline-none"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="yes">Katılanlar</option>
          <option value="no">Katılamayanlar</option>
          <option value="maybe">Belirsizler</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-card/30 border border-border/50 rounded-2xl overflow-hidden">
        {filteredRsvps.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-muted-foreground">Kayıt bulunamadı.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Misafir Adı</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Kişi Sayısı</th>
                <th className="px-6 py-4 hidden md:table-cell">Not</th>
                <th className="px-6 py-4 hidden lg:table-cell">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredRsvps.map((rsvp) => (
                <tr key={rsvp.id} className="hover:bg-accent/10/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{rsvp.guest_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={rsvp.status} />
                      <StatusLabel status={rsvp.status} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {rsvp.party_size} Kişi
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {rsvp.adult_count} yetişkin · {rsvp.child_count} çocuk
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-muted-foreground max-w-sm">
                    <span className="line-clamp-2">{rsvp.note || "-"}</span>
                    {detailText(rsvp.id).events ? (
                      <span className="mt-1 block text-xs text-gold">
                        {detailText(rsvp.id).events}
                      </span>
                    ) : null}
                    {detailText(rsvp.id).answers ? (
                      <span className="mt-1 block text-xs line-clamp-2">
                        {detailText(rsvp.id).answers}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                    {new Date(rsvp.created_at).toLocaleDateString("tr-TR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
