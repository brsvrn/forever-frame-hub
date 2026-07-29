import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";
import { getInvitationById, type InvitationRow } from "@/lib/invitations.api";
import { Loader2, ArrowLeft, LayoutDashboard, Database, Image as ImageIcon, Users, BarChart3, Settings, QrCode } from "lucide-react";

import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardStorage } from "@/components/dashboard/DashboardStorage";
import { DashboardGallery } from "@/components/dashboard/DashboardGallery";
import { DashboardRSVP } from "@/components/dashboard/DashboardRSVP";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { DashboardSettings } from "@/components/dashboard/DashboardSettings";
import { PrintableQR } from "@/components/dashboard/PrintableQR";
import { themes } from "@/lib/theme-engine";

export const Route = createFileRoute("/panel_/$id")({
  component: () => (
    <AuthProvider>
      <PremiumDashboardGate />
    </AuthProvider>
  ),
});

function PremiumDashboardGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useParams();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/giris" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-black">
        <Loader2 className="size-6 animate-spin text-gold" aria-hidden="true" />
      </div>
    );
  }

  return <PremiumDashboard userId={user.id} invitationId={id} />;
}

type TabType = "overview" | "storage" | "gallery" | "rsvp" | "analytics" | "print" | "settings";

function PremiumDashboard({ userId, invitationId }: { userId: string; invitationId: string }) {
  const [invitation, setInvitation] = useState<InvitationRow | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvitationById(invitationId).then(data => {
      setInvitation(data);
      setLoading(false);
    });
  }, [invitationId]);

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-950 text-white">
        <Loader2 className="size-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!invitation || invitation.user_id !== userId) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-950 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Erişim Engellendi</h2>
          <p className="text-zinc-400 mb-6">Bu davetiyeyi görüntüleme yetkiniz yok.</p>
          <Link to="/panel" className="text-gold hover:underline">Panele Dön</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
    { id: "gallery", label: "Medya Galerisi", icon: ImageIcon },
    { id: "rsvp", label: "Misafirler", icon: Users },
    { id: "storage", label: "Depolama", icon: Database },
    { id: "analytics", label: "İstatistikler", icon: BarChart3 },
    { id: "print", label: "QR & Baskı", icon: QrCode },
    { id: "settings", label: "Ayarlar", icon: Settings },
  ] as const;

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <Link to="/panel" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Tüm Davetiyeler
          </Link>
          <h1 className="text-xl font-display truncate">
            {invitation.partner_one} & {invitation.partner_two}
          </h1>
          <a 
            href={`/davet/${invitation.slug}`}
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-gold mt-1 hover:underline block truncate"
          >
            memorywedding.com/davet/{invitation.slug}
          </a>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                activeTab === tab.id 
                  ? "bg-gold text-black font-medium shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {activeTab === "overview" && <DashboardOverview invitation={invitation} />}
        {activeTab === "gallery" && <DashboardGallery invitation={invitation} />}
        {activeTab === "rsvp" && <DashboardRSVP invitation={invitation} />}
        {activeTab === "storage" && <DashboardStorage invitation={invitation} />}
        {activeTab === "analytics" && <DashboardAnalytics invitation={invitation} />}
        {activeTab === "print" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-medium text-white mb-2">Masa Kartı & Baskı</h2>
            <p className="text-zinc-400 text-sm mb-8">Etkinliğinizde masalara yerleştirebileceğiniz, misafirlerinizin fotoğraf yüklemesi için tasarlanmış QR kodlu masa kartlarınızı indirebilirsiniz.</p>
            <PrintableQR 
              url={`https://memorywedding.com/davet/${invitation.slug}`}
              partnerOne={invitation.partner_one}
              partnerTwo={invitation.partner_two}
              themeConfig={themes[invitation.theme] || { primaryColor: "#D4AF37", secondaryColor: "#18181B", font: "Inter" }}
            />
          </div>
        )}
        {activeTab === "settings" && <DashboardSettings invitation={invitation} />}
      </main>
    </div>
  );
}
