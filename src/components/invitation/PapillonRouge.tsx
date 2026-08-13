import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";
import lueurButterfly from "@/assets/lueur-de-minuit-butterfly.webp";

export function LueurOpening({
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
    // Mount the invitation immediately behind this overlay. AnimatePresence
    // keeps the cover mounted while its two halves fold away, revealing the
    // real invitation instead of cutting to it after the animation.
    onComplete();
  }, [onComplete]);

  const panelDuration = reduceMotion ? 0.12 : 1.75;
  const coverFadeDelay = reduceMotion ? 0 : 1.58;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: reduceMotion ? 0.12 : 0.24, delay: coverFadeDelay },
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-[#07152f] text-[#f8f5ee]"
      style={{ perspective: "1400px" }}
    >
      <motion.div
        initial={{ rotateX: 0, y: "0%", opacity: 1 }}
        exit={{ rotateX: -92, y: "-12%", opacity: 0.12 }}
        transition={{ duration: panelDuration, ease: [0.7, 0, 0.2, 1] }}
        className="absolute inset-x-0 top-0 z-20 h-1/2 overflow-hidden border-b border-[#ead39d]/70 bg-gradient-to-b from-[#183662] via-[#0c2347] to-[#07152f] shadow-[0_22px_55px_rgba(0,4,14,.72)]"
        style={{ transformOrigin: "50% 100%", backfaceVisibility: "hidden" }}
      >
        <div className="lueur-emboss absolute inset-0 opacity-25" />
        <div className="absolute inset-x-[-15%] bottom-[-42%] h-[70%] rotate-6 border border-[#d6b878]/20 bg-[#0a1d3b]/35" />
      </motion.div>
      <motion.div
        initial={{ rotateX: 0, y: "0%", opacity: 1 }}
        exit={{ rotateX: 92, y: "12%", opacity: 0.12 }}
        transition={{ duration: panelDuration, ease: [0.7, 0, 0.2, 1] }}
        className="absolute inset-x-0 bottom-0 z-20 h-1/2 overflow-hidden border-t border-[#ead39d]/70 bg-gradient-to-t from-[#020817] via-[#06152d] to-[#0b2448] shadow-[0_-22px_55px_rgba(0,4,14,.62)]"
        style={{ transformOrigin: "50% 0%", backfaceVisibility: "hidden" }}
      >
        <div className="lueur-emboss absolute inset-0 opacity-20" />
        <div className="absolute inset-x-[-15%] top-[-42%] h-[70%] -rotate-6 border border-[#d6b878]/20 bg-[#081a36]/35" />
      </motion.div>

      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: reduceMotion ? 0.1 : 0.48, ease: "easeOut" }}
        className="relative z-30 flex min-h-dvh flex-col items-center justify-between px-6 py-10 text-center"
      >
        <div>
          <p className="font-pinyon text-4xl sm:text-5xl">Lueur de Minuit</p>
          <p className="mt-2 text-[9px] uppercase tracking-[0.42em] text-[#d6b878]">
            Gece yarısı ışıltısı
          </p>
        </div>

        <button
          type="button"
          onClick={open}
          className="group flex flex-col items-center"
          aria-label="Davetiyeyi aç"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            exit={{
              scale: 1.75,
              rotate: 10,
              opacity: 0,
              transition: { duration: reduceMotion ? 0.1 : 0.48, ease: "easeOut" },
            }}
            transition={{ duration: 2.8, repeat: Infinity }}
            className="relative h-52 w-64 drop-shadow-[0_22px_20px_rgba(0,0,0,.58)] sm:h-64 sm:w-80"
          >
            <img src={lueurButterfly} alt="" className="h-full w-full object-contain" />
          </motion.div>
          <span className="mt-5 rounded-full border border-[#d6b878]/45 bg-white/5 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] backdrop-blur-sm transition group-active:scale-95">
            Kelebeğe dokun
          </span>
        </button>

        <div>
          <p className="font-bodoni text-xl">
            {partnerOne || "Ayşe"} <span className="font-pinyon text-[#d6b878]">&</span>{" "}
            {partnerTwo || "Fatih"}
          </p>
          <p className="mt-2 text-[9px] uppercase tracking-[0.35em] text-white/55">
            Davetiyeyi açmak için dokunun
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LueurHero({ draft, lang }: { draft: InvitationDraft; lang: "tr" | "en" }) {
  const date = formatInviteDate(draft.date, lang);
  return (
    <section className="lueur-pearl relative flex min-h-dvh snap-start flex-col items-center justify-center overflow-hidden px-6 py-20 text-center text-[#07152f]">
      <div className="lueur-emboss absolute inset-0 opacity-50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1 }}
        className="relative z-10"
      >
        <div className="mx-auto mb-8 scale-75">
          <span className="papillon-line-butterfly" />
        </div>
        <h1 className="font-bodoni text-[clamp(3.5rem,18vw,7rem)] leading-[.82] tracking-[-.05em]">
          <span className="block">{draft.partnerOne || "Ayşe"}</span>
          <span className="my-3 block font-pinyon text-[.52em] font-normal text-[#b79a5d]">&</span>
          <span className="block">{draft.partnerTwo || "Fatih"}</span>
        </h1>
        <div className="mx-auto my-8 h-px w-24 bg-[#d6b878]/55" />
        <p className="text-[10px] font-semibold uppercase tracking-[.35em]">
          {date || "24 Ağustos 2026"}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[.28em] text-[#647086]">
          {draft.headline || "Düğünümüze davetlisiniz"}
        </p>
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-7 flex flex-col items-center gap-2 text-[#07152f]/50"
      >
        <span className="text-[8px] uppercase tracking-[.32em]">Aşağı kaydır</span>
        <ChevronDown className="size-4" />
      </motion.div>
    </section>
  );
}

export function LueurSection({
  active,
  tone = "paper",
  children,
}: {
  active: boolean;
  tone?: "paper" | "wine";
  children: React.ReactNode;
}) {
  if (!active) return <>{children}</>;
  return (
    <div className={tone === "wine" ? "lueur-night text-[#f8f5ee]" : "lueur-pearl text-[#07152f]"}>
      {children}
    </div>
  );
}
