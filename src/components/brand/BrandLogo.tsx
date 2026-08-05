import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  to?: string | false;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  badge?: React.ReactNode;
}

export function BrandLogo({
  to = "/",
  className,
  imageClassName,
  textClassName,
  size = "md",
  badge,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { img: "w-6 h-6 rounded-md", text: "text-base" },
    md: { img: "w-8 h-8 rounded-lg", text: "text-xl" },
    lg: { img: "w-10 h-10 rounded-xl", text: "text-2xl" },
    xl: { img: "w-12 h-12 rounded-2xl", text: "text-3xl" },
  };

  const content = (
    <>
      <img
        src="/logo.jpg"
        alt="MemoryWedding Logo"
        className={cn(sizeMap[size].img, "object-cover shrink-0 shadow-sm", imageClassName)}
      />
      <span
        className={cn(
          "font-bold tracking-tight text-foreground transition-colors",
          sizeMap[size].text,
          textClassName,
        )}
      >
        MemoryWedding
      </span>
      {badge}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={cn("inline-flex items-center gap-2.5 select-none group", className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {content}
    </div>
  );
}
