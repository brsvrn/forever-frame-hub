import { useState } from "react";
import { FadeIn, SlideUp } from "@/components/motion";
import { PhoneMockup } from "../interactive-demo/PhoneMockup";
import { Palette, LayoutTemplate } from "lucide-react";

const THEMES = [
  {
    id: "classic",
    name: "Klasik Zarafet",
    category: "Klasik",
    bgColor: "bg-[#FAF9F6]",
    textColor: "text-stone-800",
    accent: "bg-stone-300",
    font: "font-serif",
    desc: "Zamana meydan okuyan, zarif ve aristokratik tasarım çizgisi.",
  },
  {
    id: "modern",
    name: "Modern Minimal",
    category: "Minimal",
    bgColor: "bg-zinc-50",
    textColor: "text-zinc-900",
    accent: "bg-zinc-300",
    font: "font-sans",
    desc: "Temiz çizgiler, geniş boşluklar ve tipografi odaklı çağdaş görünüm.",
  },
  {
    id: "boho",
    name: "Bohem Rüyası",
    category: "Bohem",
    bgColor: "bg-[#F4ECE6]",
    textColor: "text-[#5C4D43]",
    accent: "bg-[#D9C5B2]",
    font: "font-serif",
    desc: "Doğal tonlar, yumuşak geçişler ve sıcak toprak renklerinin uyumu.",
  },
  {
    id: "dark",
    name: "Gece Mavisi",
    category: "Premium",
    bgColor: "bg-slate-900",
    textColor: "text-slate-100",
    accent: "bg-slate-700",
    font: "font-sans tracking-wide",
    desc: "Gece düğünleri için tasarlanmış, asil, karanlık ve vurucu konsept.",
  },
];

export function ThemeGallery() {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);

  return (
    <section className="py-24 bg-neutral-50 relative overflow-hidden border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 max-w-6xl mx-auto">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <SlideUp>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-6 shadow-sm">
                <Palette className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Tarzınızı Yansıtan
                <br />
                <span className="text-primary">Premium Temalar</span>
              </h2>
              <p className="text-lg text-muted-foreground font-light mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Her aşk hikayesi benzersizdir. Düğün konseptinize en uygun temayı seçin, renkleri ve
                fontları dilediğiniz gibi özelleştirin.
              </p>
            </SlideUp>

            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              {THEMES.map((theme, idx) => (
                <FadeIn key={theme.id} delay={idx * 0.1}>
                  <button
                    onClick={() => setActiveTheme(theme)}
                    className={`w-full text-left p-5 rounded-2xl transition-all border ${
                      activeTheme.id === theme.id
                        ? "bg-white border-primary/20 shadow-md scale-105"
                        : "bg-transparent border-transparent hover:bg-white/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-foreground text-lg">{theme.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {theme.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      {theme.desc}
                    </p>

                    {/* Color palette preview bubbles */}
                    <div className="flex items-center gap-2 mt-4">
                      <div
                        className={`w-6 h-6 rounded-full border border-black/10 shadow-sm ${theme.bgColor}`}
                      ></div>
                      <div
                        className={`w-6 h-6 rounded-full border border-black/10 shadow-sm ${theme.accent}`}
                      ></div>
                      <div
                        className={`w-6 h-6 rounded-full border border-white/10 shadow-sm bg-current ${theme.textColor}`}
                      ></div>
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right Content - Phone Preview */}
          <FadeIn delay={0.3} duration={0.8} className="shrink-0 relative">
            {/* Background glow matching active theme */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] rounded-full blur-[100px] -z-10 opacity-40 transition-colors duration-1000 ${activeTheme.bgColor}`}
            ></div>

            <PhoneMockup className="shadow-2xl">
              <div
                className={`w-full h-full relative flex flex-col items-center justify-center p-8 text-center transition-colors duration-1000 ${activeTheme.bgColor} ${activeTheme.textColor}`}
              >
                {activeTheme.id === "modern" && (
                  <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
                )}

                <div className="relative z-10 w-full">
                  <span className="uppercase tracking-[0.3em] text-[9px] font-semibold opacity-50 mb-8 block">
                    Düğünümüze Davetlisiniz
                  </span>

                  <h2
                    className={`${activeTheme.font} text-5xl mb-2 ${activeTheme.id === "classic" || activeTheme.id === "boho" ? "italic" : "font-bold tracking-tight"}`}
                  >
                    Ece
                  </h2>
                  <span className="text-xl opacity-40 italic mb-2 block">&</span>
                  <h2
                    className={`${activeTheme.font} text-5xl mb-12 ${activeTheme.id === "classic" || activeTheme.id === "boho" ? "italic" : "font-bold tracking-tight"}`}
                  >
                    Kaan
                  </h2>

                  <div className={`h-[1px] w-12 mx-auto mb-10 ${activeTheme.accent}`}></div>

                  <div className="space-y-3 mb-12">
                    <p className="text-[11px] tracking-[0.2em] uppercase font-semibold">
                      24 Ağustos 2026
                    </p>
                    <p className="text-[11px] opacity-70">19:30 • Çırağan Sarayı</p>
                  </div>

                  <button
                    className={`w-full py-4 text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm transition-all shadow-sm ${activeTheme.id === "dark" ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-stone-900 text-white hover:bg-black"}`}
                  >
                    LCV Bildir
                  </button>
                </div>
              </div>
            </PhoneMockup>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
