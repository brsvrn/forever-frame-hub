import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeSilk } from "@/components/landing/motion-primitives";

export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: readonly { id: string; label: string; desc: string }[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.id} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "relative w-full min-w-[8.5rem] rounded-2xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-gold/50 bg-accent/50"
                  : "border-border hover:bg-accent/30",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold",
                    done || active
                      ? "bg-gradient-to-r from-rose to-gold text-background"
                      : "border border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <span className="truncate text-sm font-medium">{step.label}</span>
              </span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">{step.desc}</span>
              {active ? (
                <motion.span
                  layoutId="step-underline"
                  transition={{ duration: 0.45, ease: easeSilk }}
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-rose to-gold"
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
