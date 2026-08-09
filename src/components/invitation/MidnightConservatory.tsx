import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, KeyRound, Sparkles } from "lucide-react";
import conservatoryAisle from "@/assets/theme-midnight-conservatory-aisle.webp";
import conservatoryDinner from "@/assets/theme-midnight-conservatory-dinner.webp";
import conservatoryDoors from "@/assets/theme-midnight-conservatory-doors.webp";
import conservatoryHero from "@/assets/theme-midnight-conservatory.webp";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";

export function MidnightConservatoryOpening({
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

  const doorDuration = reduceMotion ? 1.8 : 3.1;
  const fadeDelay = reduceMotion ? 1.65 : 2.85;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, delay: fadeDelay } }}
      className="fixed inset-0 z-50 overflow-hidden text-[#f4e9cf]"
      style={{ perspective: "1600px" }}
    >
      <motion.div
        exit={{ x: "-104%", rotateY: -13 }}
        transition={{ duration: doorDuration, ease: [0.72, 0, 0.18, 1] }}
        className="absolute inset-y-0 left-0 z-20 w-1/2 border-r border-[#d6b96f]/70 shadow-[30px_0_80px_rgba(0,0,0,.78)]"
        style={{
          backgroundImage: `linear-gradient(rgba(1,10,12,.12),rgba(1,10,12,.2)),url(${conservatoryDoors})`,
          backgroundPosition: "left center",
          backgroundSize: "200% 100%",
          transformOrigin: "left center",
          backfaceVisibility: "hidden",
        }}
      />
      <motion.div
        exit={{ x: "104%", rotateY: 13 }}
        transition={{ duration: doorDuration, ease: [0.72, 0, 0.18, 1] }}
        className="absolute inset-y-0 right-0 z-20 w-1/2 border-l border-[#d6b96f]/70 shadow-[-30px_0_80px_rgba(0,0,0,.78)]"
        style={{
          backgroundImage: `linear-gradient(rgba(1,10,12,.12),rgba(1,10,12,.2)),url(${conservatoryDoors})`,
          backgroundPosition: "right center",
          backgroundSize: "200% 100%",
          transformOrigin: "right center",
          backfaceVisibility: "hidden",
        }}
      />

      <motion.div
        exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }}
        transition={{ duration: reduceMotion ? 0.45 : 0.8 }}
        className="relative z-30 flex min-h-dvh flex-col items-center justify-between px-6 py-12 text-center"
      >
        <div>
          <div className="mx-auto mb-3 h-px w-20 bg-gradient-to-r from-transparent via-[#d6b96f] to-transparent" />
          <p className="font-cinzel text-[9px] uppercase tracking-[0.5em] text-[#d6b96f]">
            Midnight Conservatory
          </p>
        </div>

        <button
          type="button"
          onClick={open}
          className="group flex flex-col items-center"
          aria-label="Davetiyeyi aç"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(214,185,111,.16)",
                "0 0 55px rgba(214,185,111,.42)",
                "0 0 20px rgba(214,185,111,.16)",
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity }}
            className="relative grid size-28 place-items-center rounded-full border border-[#d6b96f]/55 bg-[#031612]/80 backdrop-blur-md sm:size-32"
          >
            <span className="absolute inset-2 rounded-full border border-[#d6b96f]/20" />
            <KeyRound
              className="size-8 text-[#e8ce8b] transition-transform duration-500 group-hover:rotate-12"
              strokeWidth={1.2}
            />
          </motion.div>
          <span className="mt-6 rounded-full border border-[#d6b96f]/40 bg-[#010b0c]/65 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.32em] backdrop-blur-lg">
            Bahçenin kapısını aç
          </span>
        </button>

        <div>
          <p className="font-cinzel-decorative text-2xl tracking-[0.08em] sm:text-3xl">
            {partnerOne || "Ece"} <span className="font-pinyon text-[#d6b96f]">&</span>{" "}
            {partnerTwo || "Kaan"}
          </p>
          <p className="mt-3 text-[8px] uppercase tracking-[0.4em] text-[#c9d6ca]/65">
            Gece bahçesi sizi bekliyor
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MidnightConservatoryHero({
  draft,
  lang,
}: {
  draft: InvitationDraft;
  lang: "tr" | "en";
}) {
  const date = formatInviteDate(draft.date, lang);
  return (
    <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center overflow-hidden px-6 py-20 text-center text-[#f4e9cf]">
      <img src={conservatoryHero} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(1,10,12,.12),rgba(1,8,11,.78)_76%)]" />
      <div className="pointer-events-none absolute inset-3 border border-[#d6b96f]/30 sm:inset-5" />
      <div className="pointer-events-none absolute inset-6 border border-[#d6b96f]/12 sm:inset-9" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.35, delay: 0.25 }}
        className="relative z-10"
      >
        <div className="mb-8 flex items-center justify-center gap-3 text-[#d6b96f]">
          <span className="h-px w-12 bg-current/60" />
          <Sparkles className="size-4" strokeWidth={1.2} />
          <span className="h-px w-12 bg-current/60" />
        </div>
        <p className="mb-8 font-cinzel text-[9px] uppercase tracking-[0.48em] text-[#d6b96f]">
          Birlikte yeni bir hayata
        </p>
        <h1 className="font-cinzel-decorative text-[clamp(3.6rem,17vw,7.4rem)] leading-[.84] tracking-[-.035em]">
          <span className="block">{draft.partnerOne || "Ece"}</span>
          <span className="my-4 block font-pinyon text-[.48em] font-normal text-[#d6b96f]">&</span>
          <span className="block">{draft.partnerTwo || "Kaan"}</span>
        </h1>
        <div className="mx-auto my-9 h-px w-28 bg-gradient-to-r from-transparent via-[#d6b96f] to-transparent" />
        <p className="font-cinzel text-[10px] uppercase tracking-[.34em] text-[#f4e9cf]">
          {date || "24 Ağustos 2026"}
        </p>
        <p className="mt-4 text-[9px] uppercase tracking-[.28em] text-[#c9d6ca]">
          {draft.city || "İstanbul"}
        </p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-[#f4e9cf]/55"
      >
        <span className="text-[8px] uppercase tracking-[.36em]">Bahçede ilerle</span>
        <ChevronDown className="size-4" />
      </motion.div>
    </section>
  );
}

export type MidnightScene = "hero" | "aisle" | "dinner";

const sceneImages: Record<MidnightScene, string> = {
  hero: conservatoryHero,
  aisle: conservatoryAisle,
  dinner: conservatoryDinner,
};

export function MidnightConservatorySection({
  active,
  scene,
  children,
}: {
  active: boolean;
  scene: MidnightScene;
  children: React.ReactNode;
}) {
  if (!active) return <>{children}</>;

  return (
    <div className="relative isolate overflow-hidden bg-[#010b0d] text-[#f4e9cf]">
      <img
        src={sceneImages[scene]}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-[#010b0d]/50 backdrop-saturate-[.86]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(1,12,14,.22),rgba(1,8,10,.74)_82%)]" />
      <div className="pointer-events-none absolute inset-x-3 inset-y-2 z-20 border-x border-[#d6b96f]/16 sm:inset-x-5" />
      {children}
    </div>
  );
}
