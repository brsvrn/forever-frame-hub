import { useState, useEffect } from "react";
import { Download, Search, CheckCircle2, XCircle, HelpCircle, UserCheck } from "lucide-react";
import { listRsvps, type InvitationRow, type RsvpRow } from "@/lib/invitations.api";

export function DashboardRSVP({ invitation }: { invitation: InvitationRow }) {
  const [rsvps, setRsvps] = useState<RsvpRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "yes" | "no" | "maybe">("all");

  useEffect(() => {
    listRsvps(invitation.id).then(setRsvps);
  }, [invitation.id]);

  if (!rsvps) {
    return <div className="text-zinc-400">Misafir Listesi Yükleniyor...</div>;
  }

  const filteredRsvps = rsvps.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.guest_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalComing = rsvps.filter(r => r.status === "yes").reduce((sum, r) => sum + r.party_size, 0);
  const totalDeclined = rsvps.filter(r => r.status === "no").reduce((sum, r) => sum + r.party_size, 0);
  const totalMaybe = rsvps.filter(r => r.status === "maybe").reduce((sum, r) => sum + r.party_size, 0);

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "yes": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "no": return <XCircle className="w-4 h-4 text-rose-400" />;
      case "maybe": return <HelpCircle className="w-4 h-4 text-amber-400" />;
      default: return null;
    }
  };

  const StatusLabel = ({ status }: { status: string }) => {
    switch (status) {
      case "yes": return <span className="text-emerald-400">Katılıyor</span>;
      case "no": return <span className="text-rose-400">Katılamıyor</span>;
      case "maybe": return <span className="text-amber-400">Belirsiz</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white mb-2">Misafir Listesi (RSVP)</h2>
          <p className="text-zinc-400 text-sm">Katılım durumunu bildiren tüm misafirlerinizi buradan yönetin.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors text-sm">
          <Download className="w-4 h-4" />
          CSV Olarak İndir
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-zinc-500 text-sm mb-1">Toplam Yanıt</p>
          <p className="text-2xl font-semibold text-white">{rsvps.length}</p>
        </div>
        <div className="bg-zinc-900/50 border border-emerald-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-emerald-500/70 text-sm mb-1">Katılan Kişi</p>
          <p className="text-2xl font-semibold text-emerald-400">{totalComing}</p>
        </div>
        <div className="bg-zinc-900/50 border border-rose-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-rose-500/70 text-sm mb-1">Katılamayan</p>
          <p className="text-2xl font-semibold text-rose-400">{totalDeclined}</p>
        </div>
        <div className="bg-zinc-900/50 border border-amber-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-amber-500/70 text-sm mb-1">Belirsiz</p>
          <p className="text-2xl font-semibold text-amber-400">{totalMaybe}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Misafir adı ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors text-white"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors text-white outline-none"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="yes">Katılanlar</option>
          <option value="no">Katılamayanlar</option>
          <option value="maybe">Belirsizler</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden">
        {filteredRsvps.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">Kayıt bulunamadı.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/50 text-zinc-500 text-xs uppercase font-medium">
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
                <tr key={rsvp.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{rsvp.guest_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={rsvp.status} />
                      <StatusLabel status={rsvp.status} />
                    </div>
                  </td>
                  <td className="px-6 py-4">{rsvp.party_size} Kişi</td>
                  <td className="px-6 py-4 hidden md:table-cell text-zinc-400 max-w-xs truncate">{rsvp.note || "-"}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-zinc-500">
                    {new Date(rsvp.created_at).toLocaleDateString("tr-TR", { month: "short", day: "numeric", hour: "2-digit", minute:"2-digit" })}
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
