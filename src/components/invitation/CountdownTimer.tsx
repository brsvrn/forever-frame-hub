import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalMs: number;
}

function calculateTimeLeft(dateStr?: string | null, timeStr?: string | null): TimeLeft | null {
  if (!dateStr) return null;

  // Format: YYYY-MM-DD and HH:mm
  const timePart = timeStr && /^\d{1,2}:\d{2}/.test(timeStr) ? timeStr.slice(0, 5) : "19:00";
  const targetIso = `${dateStr}T${timePart}:00`;
  const target = new Date(targetIso);

  // Fallback if invalid date
  if (isNaN(target.getTime())) {
    const simpleTarget = new Date(dateStr);
    if (isNaN(simpleTarget.getTime())) return null;
    const diff = simpleTarget.getTime() - Date.now();
    return {
      days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((diff / 1000 / 60) % 60)),
      seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
      isPast: diff <= 0,
      totalMs: diff,
    };
  }

  const diff = target.getTime() - Date.now();
  const isPast = diff <= 0;

  return {
    days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
    hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
    minutes: Math.max(0, Math.floor((diff / 1000 / 60) % 60)),
    seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
    isPast,
    totalMs: diff,
  };
}

export function CountdownTimer({
  eventDate,
  eventTime,
  theme,
  lang = "tr",
  title,
}: {
  eventDate?: string | null;
  eventTime?: string | null;
  theme: ThemeConfig;
  lang?: "tr" | "en";
  title?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(eventDate, eventTime)
  );

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(eventDate, eventTime));
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDate, eventTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  if (!eventDate || !timeLeft) return null;

  const sectionTitle =
    title ||
    (lang === "tr" ? "Büyük Kutlamaya Son" : "Countdown to Celebration");

  const pad = (n: number) => n.toString().padStart(2, "0");

  const units = [
    { label: lang === "tr" ? "Gün" : "Days", value: timeLeft.days.toString() },
    { label: lang === "tr" ? "Saat" : "Hours", value: pad(timeLeft.hours) },
    { label: lang === "tr" ? "Dakika" : "Minutes", value: pad(timeLeft.minutes) },
    { label: lang === "tr" ? "Saniye" : "Seconds", value: pad(timeLeft.seconds) },
  ];

  return (
    <section className="relative flex min-h-[45dvh] snap-start flex-col items-center justify-center px-6 py-20 text-center sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl"
      >
        {/* Section Header */}
        <div className="mb-10 flex items-center justify-center gap-3 sm:mb-12">
          <span className="h-px w-10 sm:w-16 bg-white/20" aria-hidden="true" />
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
            {sectionTitle}
          </p>
          <span className="h-px w-10 sm:w-16 bg-white/20" aria-hidden="true" />
        </div>

        {timeLeft.isPast ? (
          <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <Sparkles className="mx-auto mb-3 size-8 text-amber-300 animate-pulse" />
            <p className="font-serif text-2xl text-white sm:text-3xl">
              {lang === "tr" ? "Büyük Gün Geldi!" : "The Big Day is Here!"}
            </p>
            <p className="mt-2 text-sm text-white/70">
              {lang === "tr"
                ? "Sizleri aramızda görmekten mutluluk duyuyoruz."
                : "We are thrilled to celebrate with you."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5 sm:gap-5">
            {units.map((unit, idx) => (
              <motion.div
                key={unit.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-white/15 bg-black/30 p-3.5 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/10"
              >
                <span className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light leading-none tracking-tight text-white tabular-nums">
                  {unit.value}
                </span>
                <span className="mt-2.5 text-[9px] sm:text-[11px] uppercase tracking-[0.2em] font-medium text-white/60 group-hover:text-white/80 transition-colors">
                  {unit.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
