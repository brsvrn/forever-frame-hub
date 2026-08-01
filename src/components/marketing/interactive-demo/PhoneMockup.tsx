import { usePhone } from "@/contexts/PhoneContext";
import { resolveTheme } from "@/lib/theme-engine";
import type { CSSProperties, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, MapPin, Camera, Image as ImageIcon, Send, ArrowLeft } from "lucide-react";

interface PhoneMockupProps {
  className?: string;
  children?: ReactNode;
}

export function PhoneMockup({ className = "", children }: PhoneMockupProps) {
  const { activeScreen, setActiveScreen, activeTheme, isPlaying, setIsPlaying } = usePhone();
  const themeConfig = resolveTheme(activeTheme);
  const theme = {
    bg: "bg-[var(--phone-theme-bg)]",
    textColor: "text-[var(--phone-theme-text)]",
    accent: "bg-[var(--phone-theme-accent)] text-[var(--phone-theme-accent-ink)]",
    font: themeConfig.styles.typography.display,
  };
  const themeVariables = {
    "--phone-theme-bg": themeConfig.secondaryColor || themeConfig.qr.ink,
    "--phone-theme-text": themeConfig.primaryColor || themeConfig.qr.paper,
    "--phone-theme-accent": themeConfig.qr.accent,
    "--phone-theme-accent-ink": themeConfig.qr.ink,
  } as CSSProperties;

  return (
    <div
      className={`relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden ${className}`}
    >
      {/* Dynamic Island / Notch */}
      <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
        <div className="w-24 h-6 bg-black rounded-b-3xl"></div>
      </div>

      {/* Left buttons (Volume) */}
      <div className="absolute -left-[17px] top-[124px] rounded-l-md w-[3px] h-[46px] bg-gray-800"></div>
      <div className="absolute -left-[17px] top-[178px] rounded-l-md w-[3px] h-[46px] bg-gray-800"></div>
      {/* Right button (Power) */}
      <div className="absolute -right-[17px] top-[142px] rounded-r-md w-[3px] h-[64px] bg-gray-800"></div>

      {/* Screen Container with AnimatePresence for smooth transitions */}
      <div
        className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white"
        style={themeVariables}
      >
        {children}
        <AnimatePresence mode="wait">
          {activeScreen === "envelope" && (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden p-6"
              style={{ backgroundColor: themeConfig.qr.paper }}
            >
              {themeConfig.coverVideoUrl ? (
                <video
                  src={themeConfig.coverVideoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover opacity-20"
                />
              ) : (
                <img
                  src={themeConfig.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-20"
                  style={{ objectPosition: themeConfig.qr.imagePosition || "center" }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center text-center mb-12">
                <span className={`text-xs font-semibold tracking-[0.3em] uppercase mb-3 opacity-70`} style={{ color: themeConfig.qr.ink }}>
                  Özel Günümüze
                </span>
                <span className={`text-4xl ${theme.font}`} style={{ color: themeConfig.qr.ink }}>
                  Davetlisiniz
                </span>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative z-10 flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-white/60 bg-white/70 shadow-xl backdrop-blur-md"
                onClick={() => setActiveScreen("invite")}
              >
                <div
                  className="absolute top-0 inset-x-0 h-[55%] bg-stone-50 origin-top border-b border-stone-200 z-10 shadow-sm"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                ></div>
                <span className={`text-4xl z-0 mt-8 ${theme.font}`} style={{ color: themeConfig.qr.ink }}>A & E</span>
              </motion.div>
              <p className="relative z-10 mt-12 animate-pulse text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                Zarfı Açmak İçin Dokunun
              </p>
            </motion.div>
          )}

          {activeScreen === "invite" && (
            <motion.div
              key="invite"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute inset-0 flex flex-col z-10 ${theme.bg}`}
            >
              <div className="flex-1 overflow-y-auto pb-20 no-scrollbar relative">
                <div className="h-[280px] bg-stone-200 relative">
                  {themeConfig.coverVideoUrl ? (
                    <video
                      src={themeConfig.coverVideoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={themeConfig.image}
                      alt={themeConfig.name}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: themeConfig.qr.imagePosition || "center" }}
                    />
                  )}
                  <div
                    className={`absolute inset-0 ${themeConfig.styles.overlay}`}
                    aria-hidden="true"
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-4 right-4 bg-white/40 backdrop-blur-md rounded-full p-2.5 cursor-pointer shadow-lg z-20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <div className="w-5 h-5 flex gap-1 items-end justify-center px-0.5">
                        <span className="w-1 h-3 bg-stone-800 animate-[bounce_1s_infinite]"></span>
                        <span className="w-1 h-4 bg-stone-800 animate-[bounce_1s_infinite_0.2s]"></span>
                        <span className="w-1 h-2 bg-stone-800 animate-[bounce_1s_infinite_0.4s]"></span>
                      </div>
                    ) : (
                      <Music className="w-5 h-5 text-stone-800" />
                    )}
                  </motion.div>
                </div>

                <div className="p-8 text-center relative z-10">
                  <span
                    className={`uppercase tracking-[0.3em] text-[10px] font-semibold mb-6 block opacity-80 ${theme.textColor}`}
                  >
                    Davetlisiniz
                  </span>
                  <h2 className={`text-4xl mb-1 ${theme.font} ${theme.textColor}`}>Ayşe</h2>
                  <span className={`text-xl mb-1 block py-1 opacity-70 ${theme.textColor}`}>&</span>
                  <h2 className={`text-4xl mb-8 ${theme.font} ${theme.textColor}`}>Emre</h2>

                  <div
                    className={`h-[1px] w-12 mx-auto mb-8 opacity-20 bg-current ${theme.textColor}`}
                  ></div>

                  <p
                    className={`text-xs font-semibold tracking-[0.2em] uppercase mb-2 ${theme.textColor}`}
                  >
                    24 Ağustos 2026
                  </p>
                  <p className={`text-[11px] mb-8 font-medium opacity-90 ${theme.textColor}`}>
                    Saat 19:30 • Çırağan Sarayı
                  </p>

                  <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-stone-700 text-[10px] tracking-widest uppercase font-semibold rounded-sm border border-stone-200 shadow-sm mb-4 hover:bg-stone-50 transition-colors">
                    <MapPin className="w-4 h-4" /> Haritada Görüntüle
                  </button>
                </div>
              </div>

              {/* Bottom sticky bar */}
              <div
                className={`absolute bottom-0 inset-x-0 flex shadow-[0_-10px_30px_rgba(0,0,0,0.15)] z-20 ${theme.accent}`}
              >
                <button
                  className="flex-1 py-4 text-[10px] tracking-[0.15em] uppercase font-semibold hover:brightness-110 transition-all border-r border-white/10"
                  onClick={() => setActiveScreen("rsvp")}
                >
                  LCV Bildir
                </button>
                <button
                  className="flex-1 py-4 text-[10px] tracking-[0.15em] uppercase font-semibold hover:brightness-110 transition-all"
                  onClick={() => setActiveScreen("gallery")}
                >
                  Canlı Galeri
                </button>
              </div>
            </motion.div>
          )}

          {activeScreen === "rsvp" && (
            <motion.div
              key="rsvp"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 bg-white flex flex-col z-30"
            >
              <div className="px-4 py-4 border-b border-stone-100 flex items-center bg-white z-10 sticky top-0 mt-6">
                <button
                  onClick={() => setActiveScreen("invite")}
                  className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-stone-500" />
                </button>
                <h3 className="font-semibold text-sm ml-2 text-stone-800">LCV (RSVP)</h3>
              </div>
              <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
                <p className="text-[13px] text-stone-500 mb-8 leading-relaxed">
                  Lütfen 15 Ağustos'a kadar katılım durumunuzu bildiriniz. Geri dönüşünüz bizim için
                  çok değerli.
                </p>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      className="w-full border-b border-stone-200 py-2.5 text-sm focus:outline-none focus:border-stone-800 bg-transparent transition-colors placeholder:text-stone-300"
                      placeholder="Örn: Burak Sezer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                      Telefon (İsteğe Bağlı)
                    </label>
                    <input
                      type="tel"
                      className="w-full border-b border-stone-200 py-2.5 text-sm focus:outline-none focus:border-stone-800 bg-transparent transition-colors placeholder:text-stone-300"
                      placeholder="0555 555 55 55"
                    />
                  </div>
                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-3">
                      Katılım Durumu
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        className={`py-3 rounded-sm text-xs font-semibold shadow-sm transition-colors ${theme.accent}`}
                      >
                        Katılıyorum
                      </button>
                      <button className="py-3 border border-stone-200 rounded-sm text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors">
                        Katılamıyorum
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-stone-100 bg-white">
                <button
                  className={`w-full py-3.5 text-[11px] tracking-[0.2em] uppercase font-bold rounded-sm flex items-center justify-center gap-2 hover:brightness-110 transition-colors shadow-md ${theme.accent}`}
                  onClick={() => setActiveScreen("invite")}
                >
                  <Send className="w-3.5 h-3.5" /> Formu Gönder
                </button>
              </div>
            </motion.div>
          )}

          {activeScreen === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 bg-stone-50 flex flex-col z-30"
            >
              <div className="px-4 py-4 border-b border-stone-200 bg-white flex items-center justify-between sticky top-0 z-10 mt-6">
                <div className="flex items-center">
                  <button
                    onClick={() => setActiveScreen("invite")}
                    className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-stone-500" />
                  </button>
                  <h3 className="font-semibold text-sm ml-1 text-stone-800">Canlı Galeri</h3>
                </div>
                <button
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform ${theme.accent}`}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 no-scrollbar bg-stone-100/50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[4/5] bg-stone-200 rounded-md overflow-hidden relative shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300"
                      className="w-full h-full object-cover"
                      alt="Wedding guest"
                    />
                  </div>
                  <div className="aspect-[4/5] bg-stone-200 rounded-md overflow-hidden relative shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=300"
                      className="w-full h-full object-cover"
                      alt="Cake"
                    />
                  </div>
                  <div className="aspect-[4/5] bg-stone-200 rounded-md overflow-hidden animate-pulse flex items-center justify-center border border-dashed border-stone-300">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center p-6 bg-white rounded-lg border border-stone-200 shadow-sm mx-2 mb-4">
                  <div className="w-10 h-10 bg-stone-50 rounded-full mx-auto flex items-center justify-center mb-3 text-stone-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-700 mb-1">Yeni Anılar Ekleyin</h4>
                  <p className="text-[10px] text-stone-500">
                    Masadaki QR kodu okutarak çektiğiniz fotoğrafları anında yükleyebilirsiniz.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glass Glare Overlay for extra realism */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none z-50 rounded-[2rem]"></div>
      </div>
    </div>
  );
}
