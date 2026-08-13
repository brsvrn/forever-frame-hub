import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";

interface RoyalEnvelopeOpeningProps {
  partnerOne: string;
  partnerTwo: string;
  onComplete: () => void;
  date?: string;
}

type OpeningStage = "sealed" | "opening" | "card" | "reveal";

export function RoyalEnvelopeOpening({
  partnerOne,
  partnerTwo,
  onComplete,
  date = "Save the Date",
}: RoyalEnvelopeOpeningProps) {
  const [stage, setStage] = useState<OpeningStage>("sealed");
  const completed = useRef(false);
  const timers = useRef<number[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const open = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    window.dispatchEvent(new CustomEvent("memorywedding:user-opened-invitation"));

    setStage("opening");
    timers.current.push(
      window.setTimeout(() => setStage("card"), reduceMotion ? 120 : 560),
      window.setTimeout(() => setStage("reveal"), reduceMotion ? 460 : 1900),
      window.setTimeout(onComplete, reduceMotion ? 900 : 3000),
    );
  }, [onComplete, reduceMotion]);

  const hasOpened = stage !== "sealed";
  const cardIsRising = stage === "card" || stage === "reveal";
  const isRevealing = stage === "reveal";

  return (
    <motion.div
      data-royal-stage={stage}
      data-reduced-motion={reduceMotion ? "true" : "false"}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.18 : 0.45 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#04130f] text-[#F7F0E3]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(32,91,68,.52),transparent_38%),linear-gradient(135deg,#020b08,#0b2a20_48%,#020b08)]" />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 opacity-45"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "repeating-linear-gradient(118deg,transparent 0 18px,rgba(240,215,160,.035) 19px 20px,transparent 21px 42px)",
          backgroundSize: "180% 180%",
        }}
      />
      <div className="absolute inset-5 border border-[#D8B973]/16 sm:inset-8" />

      <div
        className="relative h-[240px] w-[340px] max-w-[88vw] sm:h-[300px] sm:w-[440px]"
        style={{ perspective: "1600px" }}
      >
        <motion.div
          data-royal-envelope-back
          className="absolute inset-0 z-10 rounded-sm border border-[#C9A96E]/80 bg-[#D6C3A3] shadow-[0_24px_70px_rgba(0,0,0,.55)]"
          animate={isRevealing ? { opacity: 0, y: 120, scale: 0.9 } : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.22 : 0.8, ease: "easeInOut" }}
        />

        <motion.div
          data-royal-card
          className="absolute inset-x-5 top-4 z-20 h-[210px] overflow-hidden rounded-sm border border-[#C9A96E] bg-[#F7F0E3] text-center text-[#173127] shadow-[0_20px_55px_rgba(0,0,0,.48)] sm:inset-x-7 sm:h-[260px]"
          initial={{ y: 18, scale: 0.92 }}
          animate={
            isRevealing
              ? { y: -55, scale: 3.15, zIndex: 60 }
              : cardIsRising
                ? { y: -170, scale: 1.08, zIndex: 20 }
                : { y: 18, scale: 0.92, zIndex: 20 }
          }
          transition={{
            duration: reduceMotion ? 0.25 : isRevealing ? 1.05 : 1.25,
            ease: [0.65, 0, 0.2, 1],
          }}
        >
          <span className="absolute left-3 top-3 size-8 border-l border-t border-[#C9A96E]/70" />
          <span className="absolute right-3 top-3 size-8 border-r border-t border-[#C9A96E]/70" />
          <span className="absolute bottom-3 left-3 size-8 border-b border-l border-[#C9A96E]/70" />
          <span className="absolute bottom-3 right-3 size-8 border-b border-r border-[#C9A96E]/70" />
          <div className="flex h-full flex-col items-center justify-center px-8">
            <p className="font-cinzel text-[7px] uppercase tracking-[.38em] text-[#A97B34]">
              Royal Envelope
            </p>
            <h2 className="mt-5 font-playfair text-2xl leading-tight sm:text-3xl">
              {partnerOne}
              <span className="mx-2 font-pinyon text-[#9A651F]">&</span>
              {partnerTwo}
            </h2>
            <div className="my-4 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />
            <p className="font-cinzel text-[8px] uppercase tracking-[.25em] text-[#6B6255]">
              {date || "Save the Date"}
            </p>
          </div>
        </motion.div>

        <motion.div
          data-royal-envelope-pocket
          className="pointer-events-none absolute inset-0 z-30"
          animate={isRevealing ? { opacity: 0, y: 120, scale: 0.9 } : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.22 : 0.8, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-y-0 left-0 z-30 w-[61%] bg-[linear-gradient(135deg,#F7EEDC,#D8C09B)]"
            style={{ clipPath: "polygon(0 0,100% 50%,0 100%)" }}
          />
          <div
            className="absolute inset-y-0 right-0 z-30 w-[61%] bg-[linear-gradient(225deg,#F4E9D5,#D2B78D)]"
            style={{ clipPath: "polygon(100% 0,0 50%,100% 100%)" }}
          />
          <div
            className="absolute inset-0 z-[31] bg-[linear-gradient(0deg,#E8D6B7,#F8EFDE)]"
            style={{ clipPath: "polygon(0 100%,50% 34%,100% 100%)" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[32] bg-[#C9A96E]"
            style={{ clipPath: "polygon(0 99.4%,50% 33.3%,100% 99.4%,100% 100%,50% 35%,0 100%)" }}
          />
        </motion.div>

        <motion.div
          data-royal-flap
          data-royal-flap-layer={hasOpened ? "behind-card" : "above-card"}
          className="absolute inset-x-0 top-0 h-[62%] origin-top bg-[linear-gradient(180deg,#FBF3E4,#D8C19B)] shadow-[0_8px_18px_rgba(79,50,20,.18)]"
          style={{
            zIndex: hasOpened ? 15 : 40,
            clipPath: "polygon(0 0,100% 0,50% 100%)",
            backfaceVisibility: "visible",
            transformStyle: "preserve-3d",
          }}
          animate={
            isRevealing
              ? { rotateX: 180, opacity: 0, y: 120, scale: 0.9 }
              : { rotateX: hasOpened ? 180 : 0, opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: reduceMotion ? 0.25 : 0.85, ease: [0.65, 0, 0.2, 1] }}
        >
          <span
            className="absolute inset-0 bg-[#C9A96E]"
            style={{
              clipPath: "polygon(0 0,100% 0,50% 100%,50% 97%,99% 1%,1% 1%,50% 97%,50% 100%)",
            }}
          />
        </motion.div>

        <motion.button
          type="button"
          onClick={open}
          data-royal-seal
          aria-label="Royal Envelope davetiyesini aç"
          className="absolute left-1/2 top-1/2 z-50 grid size-[72px] -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-[#E3B767]/70 bg-[radial-gradient(circle_at_32%_28%,#B13B38,#7C1719_55%,#4C0C0E)] shadow-[0_8px_22px_rgba(38,5,7,.5),inset_0_0_0_5px_rgba(69,5,9,.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7E2AD] focus-visible:ring-offset-4 focus-visible:ring-offset-[#071F18] sm:size-20"
          animate={hasOpened ? { opacity: 0, scale: 1.35 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <span className="absolute inset-2 rounded-full border border-[#E8C47B]/50" />
          <span className="relative font-pinyon text-xl text-[#F1D28C] drop-shadow sm:text-2xl">
            {partnerOne?.[0] || "A"}&{partnerTwo?.[0] || "D"}
          </span>
        </motion.button>
      </div>

      <motion.p
        className="absolute bottom-8 font-cinzel text-[8px] uppercase tracking-[.32em] text-[#D8BE83] sm:bottom-10"
        animate={hasOpened ? { opacity: 0 } : { opacity: [0.35, 0.95, 0.35] }}
        transition={{ duration: 2.1, repeat: hasOpened ? 0 : Infinity }}
      >
        Mühre dokun · Davetiyeyi aç
      </motion.p>
    </motion.div>
  );
}

export function RoyalEnvelopeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#04130f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(39,105,79,.48),transparent_36%),linear-gradient(145deg,#020b08,#0b2a20_52%,#020b08)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(118deg,transparent 0 18px,rgba(240,215,160,.035) 19px 20px,transparent 21px 42px)",
        }}
      />
      <div className="absolute inset-5 border border-[#D8B973]/15 sm:inset-8" />
    </div>
  );
}

export function RoyalEnvelopeHero({ draft, lang }: { draft: InvitationDraft; lang: "tr" | "en" }) {
  const date = formatInviteDate(draft.date, lang);

  return (
    <section className="relative flex min-h-dvh snap-start items-center justify-center overflow-hidden px-5 py-24 text-center text-[#173127] sm:px-8 sm:py-28">
      <motion.div
        data-royal-invitation-card
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.2, 1] }}
        className="relative flex min-h-[68dvh] w-full max-w-xl flex-col items-center justify-center overflow-hidden border border-[#C9A96E] bg-[#F7F0E3] px-7 py-14 shadow-[0_32px_90px_rgba(0,0,0,.55)] sm:min-h-[72dvh] sm:px-12"
      >
        <span className="absolute left-4 top-4 size-12 border-l border-t border-[#C9A96E]/75 sm:left-6 sm:top-6 sm:size-16" />
        <span className="absolute right-4 top-4 size-12 border-r border-t border-[#C9A96E]/75 sm:right-6 sm:top-6 sm:size-16" />
        <span className="absolute bottom-4 left-4 size-12 border-b border-l border-[#C9A96E]/75 sm:bottom-6 sm:left-6 sm:size-16" />
        <span className="absolute bottom-4 right-4 size-12 border-b border-r border-[#C9A96E]/75 sm:bottom-6 sm:right-6 sm:size-16" />
        <div className="absolute inset-3 border border-[#C9A96E]/18 sm:inset-4" />

        <p className="font-cinzel text-[8px] uppercase tracking-[.42em] text-[#A97B34] sm:text-[9px]">
          {draft.headline || (lang === "tr" ? "Davetlisiniz" : "You are invited")}
        </p>
        <h1 className="mt-8 font-playfair text-[clamp(3rem,15vw,6rem)] leading-[.88]">
          <span className="block">{draft.partnerOne || "Azra"}</span>
          <span className="my-3 block font-pinyon text-[.58em] font-normal text-[#9A651F]">&</span>
          <span className="block">{draft.partnerTwo || "Demir"}</span>
        </h1>
        <div className="my-8 h-px w-28 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

        <div className="flex flex-col items-center justify-center gap-3 font-cinzel text-[9px] uppercase tracking-[.2em] text-[#5D594F] sm:flex-row sm:gap-6">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-3.5 text-[#A97B34]" aria-hidden="true" />
            {date || (lang === "tr" ? "Tarih belirlenecek" : "Date to be announced")}
          </span>
          <span className="hidden size-1 rounded-full bg-[#C9A96E] sm:block" />
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 text-[#A97B34]" aria-hidden="true" />
            {draft.city || draft.venue || (lang === "tr" ? "Mekân belirlenecek" : "Venue TBA")}
          </span>
        </div>

        {draft.message?.trim() ? (
          <p className="mt-8 max-w-sm font-playfair text-sm italic leading-relaxed text-[#625A4E] sm:text-base">
            “{draft.message.trim()}”
          </p>
        ) : null}
      </motion.div>

      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 z-10 text-[#D8BE83]"
      >
        <ChevronDown className="size-5" aria-hidden="true" />
      </motion.div>
    </section>
  );
}
