import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Loader2, Palette, Package, HardDrive, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { clearAdminMaintenanceBypass, enableAdminMaintenanceBypass } from "@/lib/maintenance-admin";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AuthProvider>
      <AdminGate />
    </AuthProvider>
  ),
});

function AdminGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/giris" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }

    let cancelled = false;
    void supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data, error }) => {
      if (!cancelled) setIsAdmin(!error && data === true);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (isAdmin === true) void enableAdminMaintenanceBypass().catch(console.error);
  }, [isAdmin]);

  if (loading || !user || isAdmin === null) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-950">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  // Demo / Test ortamı için yetkilendirme kontrolünü geçici olarak devredışı bırakıyoruz.
  // Gerçek ortamda burası RLS ve Admin Role tablosu ile korunmalıdır.
  if (!isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-950 text-white text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-rose-500">Yetkisiz Erişim</h1>
          <p className="text-zinc-400 mb-6">Bu sayfayı görüntüleme yetkiniz yok.</p>
          <Link to="/panel" className="text-gold hover:underline">
            Yönetim Paneline Dön
          </Link>
        </div>
      </div>
    );
  }
  return <AdminDashboard email={user.email ?? ""} />;
}

type TabType = "themes" | "packages" | "audit" | "settings";

function AdminDashboard({ email }: { email: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("themes");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: "themes", label: "Temalar", icon: Palette },
    { id: "packages", label: "Paketler", icon: Package },
    { id: "audit", label: "İşlem Kayıtları (Audit)", icon: HardDrive },
    { id: "settings", label: "Sistem Ayarları", icon: Settings },
  ] as const;

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-display text-white">Platform Yönetimi</h1>
          <p className="text-xs text-zinc-500 mt-1">{email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-rose-500/20 text-rose-400 font-medium border border-rose-500/30"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={async () => {
              await clearAdminMaintenanceBypass();
              await signOut();
              navigate({ to: "/" });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {activeTab === "themes" && <ThemeManager adminEmail={email} />}
        {activeTab === "packages" && <PackageManager adminEmail={email} />}
        {activeTab === "audit" && <AuditLogs />}
        {activeTab === "settings" && <SystemSettings adminEmail={email} />}
      </main>
    </div>
  );
}

// === Audit Logs Tablosu ===
import { getAuditLogs } from "@/lib/admin.api";
import { ThemeManager } from "@/components/admin/ThemeManager";
import { PackageManager } from "@/components/admin/PackageManager";
import { SystemSettings } from "@/components/admin/SystemSettings";

function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-display text-white mb-1">İşlem Kayıtları</h2>
        <p className="text-sm text-zinc-400">
          Yöneticilerin sistem üzerinde yaptığı değişiklikler (Audit Trail).
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Tarih</th>
                <th className="px-6 py-4 font-medium">Yönetici</th>
                <th className="px-6 py-4 font-medium">İşlem</th>
                <th className="px-6 py-4 font-medium">Hedef</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-zinc-300">
                    {new Date(log.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{log.admin_email}</td>
                  <td className="px-6 py-4 text-white">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        log.action === "create"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.action === "archive"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {log.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{log.target_type}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
