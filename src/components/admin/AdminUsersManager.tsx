import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Calendar,
  CreditCard,
  UserCheck,
  UserX,
} from "lucide-react";
import { getAdminUsers, toggleUserAdminRole } from "@/lib/admin/users.api";
import type { AdminUserSummary } from "@/lib/admin/types";
import { toast } from "sonner";

interface AdminUsersManagerProps {
  adminEmail: string;
}

export function AdminUsersManager({ adminEmail }: AdminUsersManagerProps) {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleActionUser, setRoleActionUser] = useState<AdminUserSummary | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Kullanıcılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleConfirmRoleToggle = async () => {
    if (!roleActionUser) return;
    setActionLoading(true);
    const willGrant = roleActionUser.role !== "admin";

    try {
      await toggleUserAdminRole(
        adminEmail,
        roleActionUser.id,
        roleActionUser.email,
        willGrant
      );
      toast.success(
        willGrant
          ? `${roleActionUser.email} kullanıcısına yönetici yetkisi verildi.`
          : `${roleActionUser.email} kullanıcısının yönetici yetkisi kaldırıldı.`
      );
      setRoleActionUser(null);
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Kullanıcı & Rol Yönetimi
          </h2>
          <p className="text-sm text-muted-foreground">
            Platform kullanıcılarını, sahip oldukları etkinlikleri, toplam harcamalarını ve yönetici
            yetkilerini kontrol edin.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="E-posta veya isim ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <span className="text-xs text-muted-foreground">Kullanıcılar yükleniyor...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center bg-card/40 rounded-2xl border border-border text-muted-foreground text-sm">
          Kullanıcı bulunamadı.
        </div>
      ) : (
        <div className="bg-card/70 border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Kullanıcı</th>
                  <th className="px-5 py-3.5 font-medium">Rol</th>
                  <th className="px-5 py-3.5 font-medium">Etkinlikler</th>
                  <th className="px-5 py-3.5 font-medium">Sipariş & Harcama</th>
                  <th className="px-5 py-3.5 font-medium">Kayıt Tarihi</th>
                  <th className="px-5 py-3.5 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground text-xs">
                        {user.fullName || "İsimsiz Kullanıcı"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                    </td>

                    {/* Role badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-gold/20 text-gold border border-gold/30"
                            : "bg-surface text-muted-foreground border border-border"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <ShieldCheck className="w-3 h-3 text-gold" />
                        ) : (
                          <Users className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className="capitalize">
                          {user.role === "admin" ? "Yönetici (Admin)" : "Kullanıcı"}
                        </span>
                      </span>
                    </td>

                    {/* Events count */}
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{user.eventCount} Etkinlik</span>
                      </div>
                    </td>

                    {/* Orders and Spent */}
                    <td className="px-5 py-4 text-xs">
                      <div className="font-semibold text-foreground">
                        {formatCurrency(user.totalSpent)}
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        {user.orderCount} Sipariş
                      </div>
                    </td>

                    {/* Created date */}
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </td>

                    {/* Role Action Button */}
                    <td className="px-5 py-4 text-right">
                      {user.email === adminEmail ? (
                        <span className="text-xs text-muted-foreground/60 italic">Siz (Mevcut)</span>
                      ) : (
                        <button
                          onClick={() => setRoleActionUser(user)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            user.role === "admin"
                              ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400"
                              : "bg-gold/10 hover:bg-gold/20 border-gold/30 text-gold"
                          }`}
                        >
                          {user.role === "admin" ? "Yöneticiliği Al" : "Admin Yap"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Toggle Confirmation Modal */}
      {roleActionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-foreground">Rol Değişikliği Onayı</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>{roleActionUser.email}</strong> kullanıcısının rolü{" "}
              <strong className="text-foreground">
                {roleActionUser.role === "admin" ? "Normal Kullanıcı" : "Yönetici (Admin)"}
              </strong>{" "}
              olarak değiştirilecek. Onaylıyor musunuz?
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setRoleActionUser(null)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleToggle}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90 disabled:opacity-50 shadow-lg shadow-gold/20"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Rolü Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
