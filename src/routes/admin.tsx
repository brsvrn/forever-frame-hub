import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";
import {
  Loader2,
  LayoutDashboard,
  Calendar,
  CreditCard,
  Key,
  Users,
  Package,
  Palette,
  MessageSquare,
  HardDrive,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { clearAdminMaintenanceBypass, enableAdminMaintenanceBypass } from "@/lib/maintenance-admin";

// Admin Components
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";
import { AdminEventsManager } from "@/components/admin/AdminEventsManager";
import { AdminOrdersManager } from "@/components/admin/AdminOrdersManager";
import { AdminAccessCodesManager } from "@/components/admin/AdminAccessCodesManager";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { AdminSupportTicketsManager } from "@/components/admin/AdminSupportTicketsManager";
import { AdminRetentionManager } from "@/components/admin/AdminRetentionManager";
import { ThemeManager } from "@/components/admin/ThemeManager";
import { PackageManager } from "@/components/admin/PackageManager";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { getAuditLogs } from "@/lib/admin.api";

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
    void supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data, error }) => {
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
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-foreground text-center p-6">
        <div className="max-w-md bg-card border border-border p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <X className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Yetkisiz Erişim</h1>
          <p className="text-sm text-muted-foreground">
            Bu panel yalnızca sistem sahipleri ve yetkili yöneticiler içindir.
          </p>
          <Link
            to="/panel"
            className="inline-block px-5 py-2.5 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90"
          >
            Etkinlik Paneline Dön
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard email={user.email ?? ""} />;
}

export type AdminTabType =
  | "overview"
  | "events"
  | "orders"
  | "codes"
  | "users"
  | "packages"
  | "themes"
  | "support"
  | "retention"
  | "audit"
  | "settings";

function AdminDashboard({ email }: { email: string }) {
  const [activeTab, setActiveTab] = useState<AdminTabType>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navSections = [
    {
      title: "Yönetim",
      items: [
        { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
        { id: "events", label: "Etkinlikler", icon: Calendar },
        { id: "orders", label: "Sipariş & PayTR", icon: CreditCard },
        { id: "codes", label: "Kullanım Kodları", icon: Key },
        { id: "users", label: "Kullanıcılar & Roller", icon: Users },
      ],
    },
    {
      title: "İçerik & Mağaza",
      items: [
        { id: "packages", label: "Paketler & Fiyat", icon: Package },
        { id: "themes", label: "Temalar", icon: Palette },
        { id: "support", label: "Destek Talepleri", icon: MessageSquare },
      ],
    },
    {
      title: "Sistem & Güvenlik",
      items: [
        { id: "retention", label: "Saklama & Temizlik", icon: HardDrive },
        { id: "audit", label: "İşlem Kayıtları (Audit)", icon: History },
        { id: "settings", label: "Sistem & Bakım", icon: Settings },
      ],
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as AdminTabType);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground font-sans flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-foreground">Super Admin</span>
            <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
              {email}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-card border border-border text-foreground"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface/95 backdrop-blur-xl border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h1 className="text-base font-display font-bold text-foreground tracking-tight">
                Super Admin
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-[180px]">
              {email}
            </p>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3">
                {sec.title}
              </span>
              <div className="mt-1 space-y-0.5">
                {sec.items.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gold text-zinc-950 font-bold shadow-md shadow-gold/20"
                          : "text-muted-foreground hover:bg-card hover:text-foreground"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950" : "text-muted-foreground"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-border space-y-1">
          <Link
            to="/panel"
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-card rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Etkinlik Panelim</span>
          </Link>

          <button
            onClick={async () => {
              await clearAdminMaintenanceBypass();
              await signOut();
              navigate({ to: "/" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
        {activeTab === "overview" && (
          <AdminDashboardOverview onNavigateTab={handleTabChange} adminEmail={email} />
        )}
        {activeTab === "events" && <AdminEventsManager adminEmail={email} />}
        {activeTab === "orders" && <AdminOrdersManager adminEmail={email} />}
        {activeTab === "codes" && <AdminAccessCodesManager adminEmail={email} />}
        {activeTab === "users" && <AdminUsersManager adminEmail={email} />}
        {activeTab === "packages" && <PackageManager adminEmail={email} />}
        {activeTab === "themes" && <ThemeManager adminEmail={email} />}
        {activeTab === "support" && <AdminSupportTicketsManager adminEmail={email} />}
        {activeTab === "retention" && <AdminRetentionManager adminEmail={email} />}
        {activeTab === "audit" && <AuditLogs />}
        {activeTab === "settings" && <SystemSettings adminEmail={email} />}
      </main>
    </div>
  );
}

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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">İşlem Kayıtları (Audit Trail)</h2>
        <p className="text-sm text-muted-foreground">
          Yöneticilerin sistem genelinde gerçekleştirdiği tüm kritik operasyonların denetim kaydı.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center bg-card/40 rounded-2xl border border-border text-muted-foreground text-sm">
          Kayıt bulunamadı.
        </div>
      ) : (
        <div className="bg-card/70 border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/60 text-muted-foreground uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Tarih</th>
                  <th className="px-5 py-3.5 font-medium">Yönetici</th>
                  <th className="px-5 py-3.5 font-medium">İşlem</th>
                  <th className="px-5 py-3.5 font-medium">Hedef</th>
                  <th className="px-5 py-3.5 font-medium">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground font-mono">
                      {new Date(log.created_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{log.admin_email}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded font-semibold bg-surface border border-border text-foreground">
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{log.target_type}</td>
                    <td className="px-5 py-3.5 text-[11px] font-mono text-muted-foreground max-w-xs truncate">
                      {log.payload ? JSON.stringify(log.payload) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
