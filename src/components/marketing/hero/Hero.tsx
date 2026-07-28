import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideUp } from "@/components/motion";
import { PhoneMockup } from "../interactive-demo/PhoneMockup";
import { PlayCircle, ArrowRight, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-28 pb-16 overflow-hidden">
      {/* Premium Cinematic Background */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/4 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[80px] opacity-40 -translate-x-1/3 translate-y-1/3 z-0 pointer-events-none"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] dark:[mask-image:linear-gradient(to_bottom,white,transparent)] dark:opacity-20 z-0"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* Left Content - Typography & CTA */}
          <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 pt-8 lg:pt-0">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
                Düğün organizasyonunda yeni standart
              </div>
            </FadeIn>

            <SlideUp delay={0.2}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.15]">
                Düğününüz, <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50">
                  Kusursuz
                </span>{" "}
                Bir Deneyim.
              </h1>
            </SlideUp>

            <SlideUp delay={0.3}>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                Misafirleriniz için büyüleyici bir dijital davetiye, sizin için stressiz bir LCV
                yönetimi ve masalardaki QR kartlarla anında fotoğraf toplama sistemi.
              </p>
            </SlideUp>

            <SlideUp
              delay={0.4}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button
                size="lg"
                asChild
                className="rounded-full w-full sm:w-auto h-14 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all group"
              >
                <Link to="/olustur">
                  Ücretsiz Başla{" "}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full w-full sm:w-auto h-14 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-muted transition-all group border-border"
              >
                <a href="#demo" className="flex items-center cursor-pointer">
                  <PlayCircle className="mr-2 w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  Sistemi Keşfet
                </a>
              </Button>
            </SlideUp>

            <FadeIn
              delay={0.6}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}&backgroundColor=f8fafc`}
                      alt={`Mutlu Çift ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center sm:items-start pl-2">
                <div className="flex text-amber-400 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span>
                  <strong className="text-foreground font-semibold">10.000+</strong> mutlu çiftin
                  tercihi
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Product Experience (Phone Mockup) */}
          <FadeIn
            delay={0.4}
            duration={0.8}
            className="relative lg:ml-auto w-full max-w-sm mx-auto mt-12 lg:mt-0"
          >
            {/* Ambient Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[400px] bg-primary/30 rounded-full blur-[80px] -z-10"></div>

            {/* Live Product Preview */}
            <PhoneMockup className="rotate-[-2deg] hover:rotate-0 transition-transform duration-700 hover:shadow-2xl hover:shadow-primary/20 scale-[0.9] sm:scale-100 origin-bottom lg:origin-center">
              {/* Dummy Live Preview Content (Simulating a real theme) */}
              <div className="w-full h-full bg-[#FAF9F6] flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 mt-8">
                  <span className="uppercase tracking-[0.3em] text-[10px] font-semibold text-stone-400 mb-6 block">
                    Davetlisiniz
                  </span>
                  <h2 className="font-serif text-5xl text-stone-800 italic mb-1">Ece</h2>
                  <span className="text-2xl text-stone-300 italic mb-1">&</span>
                  <h2 className="font-serif text-5xl text-stone-800 italic mb-10">Kaan</h2>

                  <div className="h-[1px] w-12 bg-stone-300 mx-auto mb-8"></div>

                  <p className="text-stone-600 text-xs tracking-widest uppercase mb-3 font-medium">
                    24 Ağustos 2026
                  </p>
                  <p className="text-stone-500 text-[11px] font-light">Çırağan Sarayı, İstanbul</p>
                </div>

                {/* Simulated Swipe up button */}
                <div className="h-20 bg-stone-900 text-white flex flex-col items-center justify-center w-full z-10 cursor-pointer hover:bg-black transition-colors pb-4 pt-2">
                  <div className="w-10 h-1 bg-white/20 rounded-full mb-3"></div>
                  <span className="font-medium text-[10px] tracking-widest uppercase">
                    Detayları Gör
                  </span>
                </div>
              </div>
            </PhoneMockup>

            {/* Floating feature chips - Demonstrating SaaS value */}
            <div className="absolute top-[20%] -right-4 md:-right-12 bg-background border shadow-xl rounded-2xl p-3 flex items-center gap-3 animate-[bounce_4s_infinite] backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="text-sm pr-2">
                <p className="font-semibold text-foreground text-xs">LCV Onaylandı</p>
                <p className="text-[10px] text-muted-foreground">Kaan & Ece (+2 Kişi)</p>
              </div>
            </div>

            <div className="absolute bottom-[25%] -left-4 md:-left-12 bg-background border shadow-xl rounded-2xl p-3 flex items-center gap-3 animate-[bounce_5s_infinite_0.5s] backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
              <div className="text-sm pr-2">
                <p className="font-semibold text-foreground text-xs">Yeni Fotoğraf</p>
                <p className="text-[10px] text-muted-foreground">Masadaki QR'dan eklendi</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
