import { FadeIn, SlideUp } from "@/components/motion";
import { usePhone } from "@/contexts/PhoneContext";
import { trackProductMoment } from "@/lib/analytics/analytics";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PhoneMockup } from "./PhoneMockup";

type ProductMoment = "before" | "wedding_day" | "after";

const moments = [
  {
    id: "before" as const,
    label: "Düğünden önce",
    title: "Davet et ve LCV topla",
    description:
      "Temanızı seçin, bağlantınızı paylaşın; misafirler programı ve konumu görüp katılım yanıtını versin.",
    screen: "invite" as const,
  },
  {
    id: "wedding_day" as const,
    label: "Düğün günü",
    title: "QR ile anıları biriktir",
    description:
      "Misafirler masa kartındaki QR kodu okutup fotoğraf ve videolarını uygulama indirmeden yüklesin.",
    screen: "gallery" as const,
  },
  {
    id: "after" as const,
    label: "Düğünden sonra",
    title: "Albümü yönet ve indir",
    description:
      "Toplanan içerikleri tek panelde görüntüleyin, görünürlüğünü yönetin ve paket kapsamına göre indirin.",
    screen: "album" as const,
  },
];

export function InteractiveDemoContent() {
  const { setActiveScreen, setActiveSection } = usePhone();
  const [activeMoment, setActiveMoment] = useState<ProductMoment>("before");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  useEffect(() => {
    if (isInView) setActiveSection("demo");
  }, [isInView, setActiveSection]);

  const chooseMoment = (moment: (typeof moments)[number]) => {
    setActiveMoment(moment.id);
    setActiveScreen(moment.screen);
    trackProductMoment(moment.id);
  };

  return (
    <section
      id="demo"
      ref={ref}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden py-24 lg:py-32"
    >
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
          <SlideUp>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Aynı link, üç an
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Düğünden önce başlar,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                son fotoğrafa kadar devam eder.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-foreground/75">
              Üç ayrı araç yerine davetiye, LCV ve QR anı albümünü tek bir etkinlik deneyiminde
              kullanın.
            </p>
          </SlideUp>
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-12 lg:flex-row lg:gap-24">
          <div className="hidden w-[28rem] shrink-0 flex-col gap-5 lg:flex">
            {moments.map((moment, index) => {
              const selected = activeMoment === moment.id;
              return (
                <FadeIn
                  key={moment.id}
                  delay={0.1 * (index + 1)}
                  className={`cursor-pointer rounded-2xl border p-6 transition-all ${
                    selected
                      ? "scale-[1.02] border-primary/30 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md"
                      : "border-transparent hover:bg-white/45"
                  }`}
                  onClick={() => chooseMoment(moment)}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        {moment.label}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{moment.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-foreground/70">
                        {moment.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <div className="relative mt-8 flex w-full shrink-0 items-center justify-center lg:mt-0 lg:w-[350px]">
            <motion.div style={{ y }} className="z-30 h-[600px] w-[300px]">
              <PhoneMockup />
            </motion.div>
          </div>

          <div className="relative z-20 flex flex-wrap justify-center gap-2 px-4 pb-16 lg:hidden">
            {moments.map((moment) => (
              <button
                key={moment.id}
                type="button"
                onClick={() => chooseMoment(moment)}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeMoment === moment.id
                    ? "scale-105 border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {moment.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
