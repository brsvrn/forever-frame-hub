import { FadeIn, SlideUp } from "@/components/motion";
import {
  Users,
  ImageIcon,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Her Şey <span className="text-primary">Kontrolünüz Altında</span>
            </h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Düğün organizasyonunun kaotik yapısını unutun. Gelişmiş yönetim panelinizle davetli
              sayınızı, yüklenen fotoğrafları ve mesajları tek bir ekrandan anlık takip edin.
            </p>
          </SlideUp>
        </div>

        <FadeIn delay={0.2} duration={0.8} className="max-w-5xl mx-auto">
          {/* Dashboard Window Mockup */}
          <div className="rounded-2xl md:rounded-[2rem] border border-border bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden relative">
            {/* Mac Window Header */}
            <div className="h-12 bg-neutral-100 dark:bg-neutral-900 border-b border-border flex items-center px-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto text-xs font-medium text-muted-foreground flex items-center gap-2 bg-background px-4 py-1.5 rounded-md shadow-sm border">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                panel.memorywedding.com/ayse-emre
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-6 bg-neutral-50/50 dark:bg-transparent">
              {/* Sidebar (Desktop) */}
              <div className="hidden md:flex flex-col gap-2 border-r border-border pr-6">
                <div className="font-serif italic text-xl font-bold mb-8 text-foreground">
                  Ayşe & Emre
                </div>
                <div className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-3 shadow-md">
                  <LayoutDashboardIcon className="w-4 h-4" /> Genel Bakış
                </div>
                <div className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted font-medium text-sm flex items-center gap-3 transition-colors cursor-pointer">
                  <Users className="w-4 h-4" /> Davetliler (LCV)
                </div>
                <div className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted font-medium text-sm flex items-center gap-3 transition-colors cursor-pointer">
                  <ImageIcon className="w-4 h-4" /> Canlı Galeri
                </div>
                <div className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted font-medium text-sm flex items-center gap-3 transition-colors cursor-pointer mt-auto">
                  <SettingsIcon className="w-4 h-4" /> Ayarlar
                </div>
              </div>

              {/* Main Content Area */}
              <div className="md:col-span-3 space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Genel Bakış</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Düğününüze son 14 gün kaldı!
                    </p>
                  </div>
                  <div className="hidden sm:flex px-4 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-sm font-medium items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Canlı
                    Veri Aktif
                  </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Stat Card 1 */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        +12 <ArrowUpRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">245</div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Katılım Onaylandı
                    </div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        +48 <ArrowUpRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">856</div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Yüklenen Fotoğraf
                    </div>
                  </div>

                  {/* Stat Card 3 (Hidden on very small mobile) */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-border shadow-sm hover:shadow-md transition-shadow hidden sm:block">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">42</div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Ziyaretçi Defteri Notu
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-border shadow-sm">
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" /> Son LCV Bildirimleri
                    </h4>
                    <div className="space-y-4">
                      {[
                        { name: "Cem Yılmaz & Ailesi", count: "+3 Kişi", time: "10 dk önce" },
                        { name: "Zeynep Demir", count: "+1 Kişi", time: "1 saat önce" },
                        {
                          name: "Ali Veli",
                          count: "Katılamıyor",
                          time: "3 saat önce",
                          negative: true,
                        },
                      ].map((activity, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${activity.negative ? "bg-stone-300" : "bg-green-500"}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{activity.name}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                          <span
                            className={`text-sm font-semibold ${activity.negative ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            {activity.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-border shadow-sm">
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" /> Galeriye Son
                      Eklenenler
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg bg-muted overflow-hidden relative group cursor-pointer"
                        >
                          <img
                            src={`https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=150&h=150&sig=${i + 20}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt="Gallery"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">İndir</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Overlay to prevent actual clicks while preserving the look */}
            <div
              className="absolute inset-0 z-20 hidden md:block"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0) 80%, rgba(var(--background-rgb), 0.8) 100%)",
              }}
            ></div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// Simple icons for the dashboard mockup
function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
