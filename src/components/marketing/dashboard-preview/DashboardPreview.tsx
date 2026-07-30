import { useState, useEffect, useRef } from "react";
import { FadeIn, SlideUp } from "@/components/motion";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { usePhone } from "@/contexts/PhoneContext";
import {
  Users,
  ImageIcon,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";

export function DashboardPreview() {
  const { setActiveSection } = usePhone();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  useEffect(() => {
    if (isInView) setActiveSection("dashboard");
  }, [isInView, setActiveSection]);

  const [stats, setStats] = useState({ rsvp: 245, photos: 856, notes: 42 });
  const [activities, setActivities] = useState([
    {
      id: 1,
      name: "Cem Yılmaz & Ailesi",
      count: "+3 Kişi",
      time: "Şimdi",
      type: "rsvp",
      negative: false,
    },
    {
      id: 2,
      name: "Zeynep Demir",
      count: "+1 Kişi",
      time: "10 dk önce",
      type: "rsvp",
      negative: false,
    },
    {
      id: 3,
      name: "Ali Veli",
      count: "Katılamıyor",
      time: "1 saat önce",
      type: "rsvp",
      negative: true,
    },
  ]);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // 30% chance to add new RSVP
      if (Math.random() > 0.7) {
        setStats((prev) => ({ ...prev, rsvp: prev.rsvp + 1 }));
        setActivities((prev) => {
          const names = ["Ayşe Yılmaz", "Burak K.", "Caner & Eşi", "Deniz Şahin"];
          const newActivity = {
            id: Date.now(),
            name: names[Math.floor(Math.random() * names.length)],
            count: "+2 Kişi",
            time: "Şimdi",
            type: "rsvp",
            negative: false,
          };
          return [newActivity, ...prev].slice(0, 4);
        });
      }

      // 50% chance to add photos
      if (Math.random() > 0.5) {
        setStats((prev) => ({ ...prev, photos: prev.photos + Math.floor(Math.random() * 3) + 1 }));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="dashboard"
      ref={ref}
      className="py-24 lg:py-32 bg-stone-50 dark:bg-neutral-950 relative overflow-hidden min-h-[100dvh] flex flex-col justify-center border-t"
    >
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse duration-700"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Her Şey <span className="text-primary">Kontrolünüz Altında</span>
            </h2>
            <p className="text-lg text-foreground/80 font-light leading-relaxed">
              Düğün organizasyonunun kaotik yapısını unutun. Gelişmiş yönetim panelinizle davetli
              sayınızı, yüklenen fotoğrafları ve mesajları tek bir ekrandan{" "}
              <strong className="font-semibold text-foreground">anlık</strong> takip edin.
            </p>
          </SlideUp>
        </div>

        <FadeIn delay={0.2} duration={0.8} className="max-w-5xl mx-auto">
          {/* Dashboard Window Mockup */}
          <div className="rounded-2xl md:rounded-[2rem] border border-border/50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden relative group">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

            {/* Mac Window Header */}
            <div className="h-12 bg-neutral-100/50 dark:bg-neutral-900/50 border-b border-border/50 flex items-center px-6 backdrop-blur-md relative z-10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto text-xs font-medium text-muted-foreground flex items-center gap-2 bg-background/50 px-4 py-1.5 rounded-md shadow-sm border border-border/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                panel.memorywedding.com/ayse-emre
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-6 bg-transparent relative z-10">
              {/* Sidebar (Desktop) */}
              <div className="hidden md:flex flex-col gap-2 border-r border-border/50 pr-6">
                <div className="font-serif italic text-xl font-bold mb-8 text-foreground">
                  Ayşe & Emre
                </div>
                <div className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-3 shadow-md">
                  <LayoutDashboardIcon className="w-4 h-4" /> Genel Bakış
                </div>
                <div className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/50 font-medium text-sm flex items-center gap-3 transition-colors cursor-pointer">
                  <Users className="w-4 h-4" /> Davetliler
                </div>
                <div className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/50 font-medium text-sm flex items-center gap-3 transition-colors cursor-pointer">
                  <ImageIcon className="w-4 h-4" /> Galeri
                </div>
                <div className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/50 font-medium text-sm flex items-center gap-3 transition-colors cursor-pointer mt-auto">
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
                  <div className="hidden sm:flex px-4 py-2 rounded-lg border border-border/50 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm text-sm font-medium items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Canlı
                    Veri Akışı
                  </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Stat Card 1 */}
                  <motion.div
                    layout
                    className="p-5 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-border/50 shadow-sm backdrop-blur-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        +12 <ArrowUpRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                    <motion.div
                      key={stats.rsvp}
                      initial={{ scale: 1.2, color: "rgb(59 130 246)" }} // blue-500
                      animate={{ scale: 1, color: "var(--foreground)" }}
                      className="text-3xl font-bold mb-1"
                    >
                      {stats.rsvp}
                    </motion.div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Katılım Onaylandı
                    </div>
                  </motion.div>

                  {/* Stat Card 2 */}
                  <motion.div
                    layout
                    className="p-5 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-border/50 shadow-sm backdrop-blur-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        +48 <ArrowUpRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                    <motion.div
                      key={stats.photos}
                      initial={{ scale: 1.2, color: "rgb(168 85 247)" }} // purple-500
                      animate={{ scale: 1, color: "var(--foreground)" }}
                      className="text-3xl font-bold mb-1"
                    >
                      {stats.photos}
                    </motion.div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Yüklenen Fotoğraf
                    </div>
                  </motion.div>

                  {/* Stat Card 3 */}
                  <div className="p-5 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-border/50 shadow-sm backdrop-blur-md hidden sm:block">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stats.notes}</div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Ziyaretçi Defteri Notu
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="p-6 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-border/50 shadow-sm backdrop-blur-md">
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" /> Son Bildirimler
                    </h4>
                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {activities.map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0 overflow-hidden"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${activity.negative ? "bg-stone-300 dark:bg-stone-700" : "bg-green-500"}`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {activity.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                              </div>
                            </div>
                            <span
                              className={`text-sm font-semibold ${activity.negative ? "text-muted-foreground" : "text-foreground"}`}
                            >
                              {activity.count}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-border/50 shadow-sm backdrop-blur-md">
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" /> Galeriye Eklenenler
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg bg-muted overflow-hidden relative group cursor-pointer"
                        >
                          <img
                            src={`https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=150&h=150&sig=${i + 20 + stats.photos}`} // Update image sig to simulate new images
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt="Gallery"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Overlay to prevent actual clicks while preserving the look on marketing page */}
            <div
              className="absolute inset-0 z-20 hidden md:block"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0) 80%, rgba(var(--background-rgb), 0.5) 100%)",
              }}
            ></div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
