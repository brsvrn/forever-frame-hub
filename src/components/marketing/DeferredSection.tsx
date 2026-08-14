import { useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredSectionProps {
  children: ReactNode;
  className?: string;
  minHeight?: string;
  placeholder?: ReactNode;
}

export function DeferredSection({
  children,
  className = "",
  minHeight = "70vh",
  placeholder,
}: DeferredSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldRender) return;

    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: shouldRender ? undefined : minHeight }}
    >
      {shouldRender
        ? children
        : (placeholder ?? <div className="h-full w-full" aria-hidden="true" />)}
    </div>
  );
}
