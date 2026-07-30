import { useState } from "react";
import { FadeIn, SlideUp } from "@/components/motion";
import { PhoneMockup } from "./PhoneMockup";
import { Music, MapPin, Camera, Image as ImageIcon, Send, ArrowLeft } from "lucide-react";

export function InteractiveDemo() {
  const [activeScreen, setActiveScreen] = useState<"envelope" | "invite" | "rsvp" | "gallery">(
    "envelope",
  );
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      id="demo"
      className="py-24 lg:py-32 bg-neutral-50  relative overflow-hidden border-t"
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Misafirlerinizin Gözünden
              <br />
              <span className="text-primary">Deneyimi Yaşayın</span>
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              MemoryWedding sadece bir link değil, uçtan uca düşünülmüş bir deneyimdir. Şarkı çalın,
              fotoğraf yükleyin, LCV gönderin.
            </p>
          </SlideUp>
        </div>

        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          {/* Left Context Controls (Desktop) */}
          <div className="hidden lg:flex flex-col gap-6 w-72 shrink-0">
            <FadeIn
              delay={0.1}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${activeScreen === "envelope" ? "bg-white  border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] scale-105" : "hover:bg-white/50  border-transparent"}`}
              onClick={() => setActiveScreen("envelope")}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeScreen === "envelope" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  1
                </span>
                Dijital Zarf
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Misafiriniz linke tıkladığında zarif bir açılış animasyonuyla karşılaşır.
              </p>
            </FadeIn>

            <FadeIn
              delay={0.2}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${activeScreen === "invite" ? "bg-white  border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] scale-105" : "hover:bg-white/50  border-transparent"}`}
              onClick={() => setActiveScreen("invite")}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeScreen === "invite" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  2
                </span>
                Davetiye & Müzik
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Arka planda çalan müziğiniz eşliğinde düğün mekanını ve saatini inceler.
              </p>
            </FadeIn>

            <FadeIn
              delay={0.3}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${activeScreen === "rsvp" ? "bg-white  border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] scale-105" : "hover:bg-white/50  border-transparent"}`}
              onClick={() => setActiveScreen("rsvp")}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeScreen === "rsvp" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  3
                </span>
                Hızlı LCV (RSVP)
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Tek tıklamayla katılım durumunu size bildirir, admin panelinize düşer.
              </p>
            </FadeIn>

            <FadeIn
              delay={0.4}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${activeScreen === "gallery" ? "bg-white  border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] scale-105" : "hover:bg-white/50  border-transparent"}`}
              onClick={() => setActiveScreen("gallery")}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeScreen === "gallery" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  4
                </span>
                Canlı Galeri
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Düğün günü masadaki QR'ı okutarak çektiği fotoğrafları anında yükler.
              </p>
            </FadeIn>
          </div>

          {/* Interactive Phone */}
          <FadeIn delay={0.2} duration={0.8} className="relative z-10 shrink-0 mx-auto">
            <PhoneMockup>
              {/* Screen Content Manager */}
              <div className="w-full h-full relative bg-white overflow-hidden">
                {/* Envelope Screen */}
                <div
                  className={`absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] bg-stone-100 flex flex-col items-center justify-center p-6 ${activeScreen === "envelope" ? "translate-y-0 opacity-100 z-20" : "-translate-y-full opacity-0 pointer-events-none"}`}
                >
                  <div
                    className="w-full aspect-[4/3] bg-white rounded-md shadow-xl flex items-center justify-center cursor-pointer border-2 border-stone-200 relative overflow-hidden group hover:scale-[1.02] transition-transform"
                    onClick={() => setActiveScreen("invite")}
                  >
                    {/* Envelope Flap Simulation */}
                    <div
                      className="absolute top-0 inset-x-0 h-[55%] bg-stone-50 origin-top transition-transform duration-500 border-b border-stone-200 z-10 shadow-sm"
                      style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                    ></div>
                    <span className="font-serif italic text-4xl text-stone-700 z-0 mt-8">
                      A & E
                    </span>
                  </div>
                  <p className="mt-12 text-stone-500 text-xs font-semibold tracking-[0.2em] uppercase animate-pulse">
                    Zarfı Açmak İçin Dokunun
                  </p>
                </div>

                {/* Invite Screen */}
                <div
                  className={`absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#FAF9F6] flex flex-col ${activeScreen === "invite" ? "translate-y-0 opacity-100 z-10" : activeScreen === "envelope" ? "translate-y-full opacity-0" : "-translate-x-full opacity-0 pointer-events-none"}`}
                >
                  <div className="flex-1 overflow-y-auto pb-20 no-scrollbar relative">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0 pointer-events-none"></div>
                    <div className="h-[280px] bg-stone-200 relative">
                      <img
                        src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80"
                        alt="Couple"
                        className="w-full h-full object-cover opacity-90 mix-blend-multiply"
                      />
                      <div
                        className="absolute bottom-4 right-4 bg-white/40 backdrop-blur-md rounded-full p-2.5 cursor-pointer shadow-lg hover:bg-white/60 transition-colors z-20"
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
                      </div>
                    </div>
                    <div className="p-8 text-center relative z-10">
                      <span className="uppercase tracking-[0.3em] text-[10px] font-semibold text-stone-400 mb-6 block">
                        Davetlisiniz
                      </span>
                      <h2 className="font-serif text-4xl text-stone-800 italic mb-1">Ayşe</h2>
                      <span className="text-xl text-stone-300 italic mb-1 block py-1">&</span>
                      <h2 className="font-serif text-4xl text-stone-800 italic mb-8">Emre</h2>

                      <div className="h-[1px] w-12 bg-stone-300 mx-auto mb-8"></div>

                      <p className="text-stone-700 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                        24 Ağustos 2026
                      </p>
                      <p className="text-stone-500 text-[11px] mb-8 font-light">
                        Saat 19:30 • Çırağan Sarayı
                      </p>

                      <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-stone-700 text-[10px] tracking-widest uppercase font-semibold rounded-sm border border-stone-200 shadow-sm mb-4 hover:bg-stone-50 transition-colors">
                        <MapPin className="w-4 h-4" /> Haritada Görüntüle
                      </button>
                    </div>
                  </div>

                  {/* Bottom sticky bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-primary text-white flex shadow-[0_-10px_30px_rgba(0,0,0,0.15)] z-20">
                    <button
                      className="flex-1 py-4 text-[10px] tracking-[0.15em] uppercase font-semibold hover:bg-black transition-colors border-r border-stone-800"
                      onClick={() => setActiveScreen("rsvp")}
                    >
                      LCV Bildir
                    </button>
                    <button
                      className="flex-1 py-4 text-[10px] tracking-[0.15em] uppercase font-semibold hover:bg-black transition-colors"
                      onClick={() => setActiveScreen("gallery")}
                    >
                      Canlı Galeri
                    </button>
                  </div>
                </div>

                {/* RSVP Screen */}
                <div
                  className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-white flex flex-col ${activeScreen === "rsvp" ? "translate-x-0 opacity-100 z-30" : "translate-x-full opacity-0 pointer-events-none"}`}
                >
                  <div className="px-4 py-4 border-b border-stone-100 flex items-center bg-white z-10 sticky top-0">
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
                      Lütfen 15 Ağustos'a kadar katılım durumunuzu bildiriniz. Geri dönüşünüz bizim
                      için çok değerli.
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
                          <button className="py-3 border-2 border-stone-900 rounded-sm text-xs font-semibold bg-primary text-white shadow-sm">
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
                      className="w-full py-3.5 bg-primary text-white text-[11px] tracking-[0.2em] uppercase font-bold rounded-sm flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-md"
                      onClick={() => setActiveScreen("invite")}
                    >
                      <Send className="w-3.5 h-3.5" /> Formu Gönder
                    </button>
                  </div>
                </div>

                {/* Gallery Screen */}
                <div
                  className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-stone-50 flex flex-col ${activeScreen === "gallery" ? "translate-x-0 opacity-100 z-30" : "translate-x-full opacity-0 pointer-events-none"}`}
                >
                  <div className="px-4 py-4 border-b border-stone-200 bg-white flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center">
                      <button
                        onClick={() => setActiveScreen("invite")}
                        className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-stone-500" />
                      </button>
                      <h3 className="font-semibold text-sm ml-1 text-stone-800">Canlı Galeri</h3>
                    </div>
                    <button className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
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
                      <div className="aspect-[4/5] bg-stone-200 rounded-md overflow-hidden relative shadow-sm">
                        <img
                          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=300"
                          className="w-full h-full object-cover"
                          alt="Venue"
                        />
                      </div>
                      <div className="aspect-[4/5] bg-stone-200 rounded-md overflow-hidden animate-pulse flex items-center justify-center border border-dashed border-stone-300">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 text-center p-6 bg-white rounded-lg border border-stone-200 shadow-sm mx-2 mb-4">
                      <div className="w-12 h-12 bg-stone-50 rounded-full mx-auto flex items-center justify-center mb-3 text-stone-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-stone-700 mb-1">
                        Yeni Anılar Ekleyin
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Masadaki QR kodu okutarak çektiğiniz fotoğrafları anında yükleyebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PhoneMockup>
          </FadeIn>

          {/* Mobile Context Controls */}
          <div className="flex lg:hidden flex-wrap justify-center gap-2 mt-8 px-4 relative z-20">
            <button
              onClick={() => setActiveScreen("envelope")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeScreen === "envelope" ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-background border-border text-muted-foreground"}`}
            >
              Zarf
            </button>
            <button
              onClick={() => setActiveScreen("invite")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeScreen === "invite" ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-background border-border text-muted-foreground"}`}
            >
              Davetiye
            </button>
            <button
              onClick={() => setActiveScreen("rsvp")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeScreen === "rsvp" ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-background border-border text-muted-foreground"}`}
            >
              LCV (RSVP)
            </button>
            <button
              onClick={() => setActiveScreen("gallery")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeScreen === "gallery" ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-background border-border text-muted-foreground"}`}
            >
              Galeri
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
