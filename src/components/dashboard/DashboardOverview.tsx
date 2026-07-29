import { useState, useEffect } from "react";
import { Users, Image as ImageIcon, Video, CalendarDays, HardDrive, MessageSquare, QrCode, Download, Loader2 } from "lucide-react";
import { getDashboardStats, type InvitationRow } from "@/lib/invitations.api";

export function DashboardOverview({ invitation }: { invitation: InvitationRow }) {
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    getDashboardStats(invitation.id).then(setStatsData);
  }, [invitation.id]);

  const daysLeft = invitation.event_date 
    ? Math.max(0, Math.ceil((new Date(invitation.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const storageGB = statsData ? (statsData.storageUsed / (1024 * 1024 * 1024)).toFixed(2) : "0";

  const stats = [
    { label: "Toplam LCV / Katılımcı", value: statsData ? `${statsData.totalRsvp} / ${statsData.totalGuests}` : "...", icon: Users },
    { label: "Yüklenen Fotoğraf", value: statsData ? statsData.photoCount : "...", icon: ImageIcon },
    { label: "Yüklenen Video", value: statsData ? statsData.videoCount : "...", icon: Video },
    { label: "Misafir Mesajları", value: statsData ? statsData.messagesCount : "...", icon: MessageSquare },
    { label: "Etkinliğe Kalan", value: `${daysLeft} Gün`, icon: CalendarDays },
    { label: "Depolama Kullanımı", value: `${storageGB} GB`, icon: HardDrive },
  ];

  const handleQRDownload = async (format: "png" | "pdf") => {
    try {
      const url = `https://memorywedding.com/davet/${invitation.slug}`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(url)}`;
      
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      // PDF için geçici olarak resim indiriyoruz ancak isim .png oluyor
      // İleride jsPDF eklenebilir.
      a.download = `QR-${invitation.slug}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("QR İndirme Hatası", error);
      alert("QR kod indirilirken bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Genel Bakış</h2>
        <p className="text-zinc-400 text-sm">Davetiyenizin genel performansı ve yüklenen anıların özeti.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-start gap-4 hover:border-gold/30 transition-colors">
            <div className="p-3 bg-zinc-800/50 rounded-xl text-gold">
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-semibold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-64 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">RSVP Grafik Alanı (Yakında)</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-xl mb-4 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-black" />
          </div>
          <h3 className="text-white font-medium mb-1">Masa QR Kodu</h3>
          <p className="text-zinc-400 text-xs mb-4">Misafirlerinizin anı paylaşması için masalara koyacağınız QR kod.</p>
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => handleQRDownload('png')}
              className="flex-1 py-2 bg-gold/10 text-gold hover:bg-gold hover:text-black font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" /> PNG
            </button>
            <button 
              onClick={() => handleQRDownload('pdf')}
              className="flex-1 py-2 bg-gold/10 text-gold hover:bg-gold hover:text-black font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" /> PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
