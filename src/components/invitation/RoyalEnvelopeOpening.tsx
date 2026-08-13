import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import royalEnvelope from "@/assets/theme-royal-envelope.webp";

interface RoyalEnvelopeOpeningProps {
  partnerOne: string;
  partnerTwo: string;
  onComplete: () => void;
  date?: string;
}

export function RoyalEnvelopeOpening({
  partnerOne,
  partnerTwo,
  onComplete,
  date = "Save the Date",
}: RoyalEnvelopeOpeningProps) {
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
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.08, filter: "blur(10px)" }}
      transition={{ duration: reduceMotion ? 0.25 : 1.15, ease: [0.65, 0, 0.2, 1] }}
      className="fixed inset-0 z-50 overflow-hidden bg-[#03100c] text-[#F7F0E3]"
    >
      <motion.img
        src={royalEnvelope}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-md"
        exit={{ scale: reduceMotion ? 1.1 : 1.2, opacity: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 1.15 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,16,12,.02),rgba(3,16,12,.84))]" />

      <motion.img
        src={royalEnvelope}
        alt="Krem rengi, bordo mum mühürlü Royal Envelope düğün davetiyesi"
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_26px_65px_rgba(0,0,0,.65)]"
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.025 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.14 }}
        transition={{ duration: reduceMotion ? 0.25 : 1.1, ease: "easeOut" }}
      />

      <button
        type="button"
        onClick={open}
        data-royal-seal
        aria-label="Royal Envelope davetiyesini aç"
        className="group absolute left-1/2 top-[51.5%] size-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7E2AD] focus-visible:ring-offset-4 focus-visible:ring-offset-[#071F18] sm:size-28"
      >
        <span className="absolute inset-1 rounded-full border border-[#F4D58B]/45 opacity-0 shadow-[0_0_34px_rgba(244,213,139,.5)] transition group-hover:opacity-100 group-focus-visible:opacity-100" />
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-[#F4D58B]/55"
          animate={
            reduceMotion ? undefined : { opacity: [0.25, 0.8, 0.25], scale: [0.86, 1.08, 0.86] }
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 px-6 text-center drop-shadow-[0_3px_14px_rgba(0,0,0,.95)] sm:bottom-10">
        <p className="font-playfair text-lg tracking-wide sm:text-xl">
          {partnerOne} <span className="font-pinyon text-[#E6C280]">&</span> {partnerTwo}
        </p>
        <p className="mt-1 font-cinzel text-[8px] uppercase tracking-[.32em] text-[#E6C280]">
          {date || "Davetiyeyi açmak için mühre dokunun"}
        </p>
      </div>
    </motion.div>
  );
}
