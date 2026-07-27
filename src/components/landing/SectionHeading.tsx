import { cn } from "@/lib/utils";
import { Reveal } from "./motion-primitives";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-4xl leading-[1.08] sm:text-5xl md:text-6xl">{title}</h2>
      {subtitle ? (
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
