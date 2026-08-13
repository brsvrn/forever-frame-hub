import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Leaf } from "lucide-react";
import evergreenGarden from "@/assets/theme-evergreen-vows.webp";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";

export function EvergreenVowsOpening({
  partnerOne,
  partnerTwo,
  onComplete,
}: {
  partnerOne: string;
  partnerTwo: string;
  onComplete: () => void;
}) {
  const completed = useRef(false);
  const reduceMotion = useReducedMotion();
  const open = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    window.dispatchEvent(new CustomEvent("memorywedding:user-opened-invitation"));
    onComplete();
  }, [onComplete]);

  const doorDuration = reduceMotion ? 0.45 : 2.8;
  const revealDelay = reduceMotion ? 0.25 : 2.45;

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.35, delay: revealDelay } }}
      className="fixed inset-0 z-50 overflow-hidden bg-[#071F18] text-center text-[#F7F0E3]"
      style={{ perspective: "1800px" }}
    >
      <img
        src={evergreenGarden}
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover"
      />
      <motion.div
        initial={{ opacity: 0.08, scaleX: 0.12 }}
        exit={{ opacity: [0.08, 0.95, 0.45], scaleX: [0.12, 2.8, 5.5], filter: "blur(18px)" }}
        transition={{ duration: doorDuration, ease: "easeOut" }}
        className="absolute inset-y-0 left-1/2 z-10 w-[18vw] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,244,205,.95),transparent)] mix-blend-screen"
      />

      <motion.div
        exit={{ x: "-102%", rotateY: -72 }}
        transition={{ duration: doorDuration, ease: [0.72, 0, 0.18, 1] }}
        className="absolute inset-y-0 left-0 z-20 w-1/2 border-r border-[#D7BC87]/70 shadow-[32px_0_70px_rgba(0,0,0,.55)]"
        style={{
          transformOrigin: "left center",
          backgroundColor: "#0B3528",
          backgroundImage:
            "radial-gradient(circle at 100% 50%,rgba(201,169,110,.2),transparent 34%),repeating-radial-gradient(ellipse at 0 100%,transparent 0 34px,rgba(201,169,110,.12) 35px 36px,transparent 37px 54px)",
        }}
      >
        <span className="absolute inset-5 border border-[#C9A96E]/25" />
        <span className="absolute right-5 top-1/2 size-3 -translate-y-1/2 rounded-full border border-[#F7F0E3]/80 bg-[#C9A96E] shadow-[0_0_24px_rgba(247,240,227,.7)]" />
      </motion.div>
      <motion.div
        exit={{ x: "102%", rotateY: 72 }}
        transition={{ duration: doorDuration, ease: [0.72, 0, 0.18, 1] }}
        className="absolute inset-y-0 right-0 z-20 w-1/2 border-l border-[#D7BC87]/70 shadow-[-32px_0_70px_rgba(0,0,0,.55)]"
        style={{
          transformOrigin: "right center",
          backgroundColor: "#0B3528",
          backgroundImage:
            "radial-gradient(circle at 0 50%,rgba(201,169,110,.2),transparent 34%),repeating-radial-gradient(ellipse at 100% 0,transparent 0 34px,rgba(201,169,110,.12) 35px 36px,transparent 37px 54px)",
        }}
      >
        <span className="absolute inset-5 border border-[#C9A96E]/25" />
        <span className="absolute left-5 top-1/2 size-3 -translate-y-1/2 rounded-full border border-[#F7F0E3]/80 bg-[#C9A96E] shadow-[0_0_24px_rgba(247,240,227,.7)]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}
        className="absolute inset-0 z-30 flex items-center justify-center px-6"
      >
        <button
          type="button"
          onClick={open}
          data-evergreen-seal
          aria-label="Davetiyeyi aç"
          className="group relative grid size-40 shrink-0 place-items-center rounded-full border border-[#E7D29D]/75 bg-[radial-gradient(circle_at_35%_30%,#DCC28A_0%,#AE8245_42%,#70471F_100%)] text-[#102E23] shadow-[0_20px_60px_rgba(0,0,0,.55),inset_0_0_0_5px_rgba(68,39,15,.22),inset_0_0_0_8px_rgba(247,240,227,.17)] transition duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7F0E3] sm:size-44"
        >
          <span className="absolute inset-3 rounded-full border border-[#4E3219]/55" />
          <span className="absolute inset-5 rounded-full border border-[#F7F0E3]/25" />
          <span className="relative flex flex-col items-center">
            <Leaf className="mb-2 size-5" strokeWidth={1.25} aria-hidden="true" />
            <span className="max-w-28 font-playfair text-xl leading-tight sm:text-2xl">
              {partnerOne?.[0] || "E"}
              <span className="mx-1 font-pinyon text-[#5C3718]">&</span>
              {partnerTwo?.[0] || "K"}
            </span>
            <span className="mt-2 font-cinzel text-[7px] uppercase tracking-[.28em]">
              Davetiyeyi aç
            </span>
          </span>
        </button>
        <p className="absolute bottom-8 text-[8px] uppercase tracking-[.34em] text-[#D8DFD4] sm:bottom-10">
          Daima yeşil · Daima birlikte
        </p>
      </motion.div>
    </motion.div>
  );
}

export function EvergreenVowsHero({ draft, lang }: { draft: InvitationDraft; lang: "tr" | "en" }) {
  const date = formatInviteDate(draft.date, lang);
  return (
    <section className="relative flex min-h-dvh snap-start items-center justify-center overflow-hidden px-6 py-20 text-center text-[#F7F0E3]">
      <img src={evergreenGarden} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,35,26,.55),rgba(6,35,26,.18)_42%,rgba(6,35,26,.72))]" />
      <div className="absolute inset-4 border border-[#C9A96E]/55 sm:inset-7" />
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="relative z-10 px-3 py-10 drop-shadow-[0_5px_28px_rgba(2,20,14,.85)]"
      >
        <p className="font-cinzel text-[9px] uppercase tracking-[.45em] text-[#D7BC87]">
          Bir ömür boyu
        </p>
        <h1 className="mt-8 font-playfair text-[clamp(3.4rem,16vw,7rem)] leading-[.82]">
          <span className="block">{draft.partnerOne || "Ece"}</span>
          <span className="my-4 block font-pinyon text-[.55em] font-normal text-[#D7BC87]">&</span>
          <span className="block">{draft.partnerTwo || "Kaan"}</span>
        </h1>
        <div className="mx-auto my-8 h-px w-28 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />
        <p className="font-cinzel text-[10px] uppercase tracking-[.3em]">
          {date || "24 Ağustos 2026"}
        </p>
        <p className="mt-3 text-[9px] uppercase tracking-[.28em] text-[#E3DFD2]">
          {draft.city || "İstanbul"}
        </p>
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="absolute bottom-7 z-10"
      >
        <ChevronDown className="size-5" />
      </motion.div>
    </section>
  );
}
