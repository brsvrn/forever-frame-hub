import { Save, Link as LinkIcon, Shield, Bell } from "lucide-react";
import type { InvitationRow } from "@/lib/invitations.api";

export function DashboardSettings({ invitation }: { invitation: InvitationRow }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out max-w-3xl">
      <div>
        <h2 className="text-2xl font-display font-medium text-foreground mb-2">Ayarlar</h2>
        <p className="text-muted-foreground text-sm">
          Davetiyeniz ile ilgili yayın, bildirim ve güvenlik tercihleri.
        </p>
      </div>

      <div className="space-y-6">
        {/* URL Setting */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <LinkIcon className="w-5 h-5 text-gold" />
            <h3 className="text-foreground font-medium">Davetiye Bağlantısı</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-accent/10/50 rounded-xl px-4 py-2 border border-zinc-700/50">
              <span className="text-muted-foreground text-sm">memorywedding.com/davet/</span>
              <input
                type="text"
                defaultValue={invitation.slug}
                className="bg-transparent border-none outline-none text-foreground text-sm ml-1 w-full"
              />
            </div>
            <button className="px-6 py-2 bg-accent/10 hover:bg-zinc-700 text-foreground text-sm rounded-xl transition-colors">
              Değiştir
            </button>
          </div>
          <p className="text-muted-foreground text-xs mt-3">
            Bağlantıyı değiştirdiğinizde eski bağlantınız çalışmayacaktır. Halihazırda davetiye
            gönderdiğiniz misafirler varsa bu işlemi önermiyoruz.
          </p>
        </div>

        {/* Privacy */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gold" />
              <h3 className="text-foreground font-medium">Gizlilik & Güvenlik</h3>
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 rounded bg-accent/10 border-zinc-700 text-gold focus:ring-gold/20"
              />
              <div>
                <p className="text-foreground text-sm font-medium">Arama Motorlarında Görünme</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Davetiyenizin Google gibi arama motorlarında indekslenmesine izin vermeyin.
                  (Gizlilik Modu)
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 rounded bg-accent/10 border-zinc-700 text-gold focus:ring-gold/20"
              />
              <div>
                <p className="text-foreground text-sm font-medium">
                  Sadece RSVP Yapanlar Galeriye Yükleme Yapabilsin
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Galeriye anı ekleme özelliğini sadece listede olan misafirlerle sınırlandırın.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-gold" />
            <h3 className="text-foreground font-medium">E-posta Bildirimleri</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground text-sm">
                Yeni LCV yanıtı geldiğinde anında bildir
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded bg-accent/10 border-zinc-700 text-gold focus:ring-gold/20"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-foreground text-sm">Günlük LCV özeti gönder</span>
              <input
                type="checkbox"
                className="rounded bg-accent/10 border-zinc-700 text-gold focus:ring-gold/20"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold/90 text-black font-medium rounded-xl transition-colors">
            <Save className="w-4 h-4" />
            Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
