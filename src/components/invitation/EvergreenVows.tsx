import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Leaf } from "lucide-react";
import evergreenGarden from "@/assets/theme-evergreen-vows.webp";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";

const emerald = "#0B3528";
const cream = "#F7F0E3";
const gold = "#C9A96E";

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

  return (
    <motion.div
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
      transition={{ duration: reduceMotion ? 0.25 : 0.9 }}
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden px-6 text-center"
      style={{ background: cream, color: emerald }}
    >
      <div className="absolute inset-3 border border-[#C9A96E]/45 sm:inset-6" />
      <div className="absolute -left-20 -top-20 size-64 rounded-full bg-[#0B3528]/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 size-72 rounded-full bg-[#C9A96E]/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md"
      >
        <div className="mx-auto mb-7 flex items-center justify-center gap-3 text-[#C9A96E]">
          <span className="h-px w-14 bg-current" />
          <Leaf className="size-5" strokeWidth={1.2} />
          <span className="h-px w-14 bg-current" />
        </div>
        <p className="font-cinzel text-[9px] uppercase tracking-[.5em] text-[#8E7346]">
          Evergreen Vows
        </p>
        <h1 className="mt-8 font-playfair text-[clamp(3rem,14vw,5.6rem)] leading-[.88]">
          {partnerOne || "Ece"}
          <span className="my-2 block font-pinyon text-[.62em] text-[#C9A96E]">&</span>
          {partnerTwo || "Kaan"}
        </h1>
        <button
          type="button"
          onClick={open}
          className="group mt-11 rounded-full border border-[#0B3528]/25 bg-[#0B3528] px-8 py-4 text-[10px] font-semibold uppercase tracking-[.32em] text-[#F7F0E3] shadow-[0_18px_45px_rgba(11,53,40,.22)] transition hover:bg-[#124936]"
        >
          Davetiyeyi aç
        </button>
        <p className="mt-5 text-[8px] uppercase tracking-[.34em] text-[#456657]">
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
        className="relative z-10 rounded-[999px_999px_2rem_2rem] border border-[#C9A96E]/35 bg-[#0B3528]/44 px-8 py-14 backdrop-blur-[3px] sm:px-14"
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
