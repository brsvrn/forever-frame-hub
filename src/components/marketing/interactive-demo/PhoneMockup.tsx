import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative mx-auto border-neutral-900 bg-neutral-900 border-[14px] rounded-[2.5rem] shadow-2xl overflow-hidden",
        "h-[600px] w-[300px] shrink-0", // Default mobile size, can be overridden via className or scale
        "ring-1 ring-white/10", // Subtile edge highlight for premium feel
        className,
      )}
    >
      {/* Notch / Dynamic Island area */}
      <div className="w-[120px] h-[25px] bg-neutral-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[1.2rem] z-30">
        <div className="absolute right-4 top-1.5 w-2 h-2 rounded-full bg-neutral-800/80"></div>
      </div>

      {/* Side buttons */}
      <div className="h-[32px] w-[3px] bg-neutral-800 absolute -left-[17px] top-[100px] rounded-l-md"></div>
      <div className="h-[46px] w-[3px] bg-neutral-800 absolute -left-[17px] top-[150px] rounded-l-md"></div>
      <div className="h-[46px] w-[3px] bg-neutral-800 absolute -left-[17px] top-[206px] rounded-l-md"></div>
      <div className="h-[64px] w-[3px] bg-neutral-800 absolute -right-[17px] top-[150px] rounded-r-md"></div>

      {/* Screen */}
      <div className="rounded-[1.5rem] overflow-hidden w-full h-full bg-white dark:bg-black relative z-10">
        {children}
      </div>

      {/* Internal Reflection / Glare effect */}
      <div className="absolute inset-0 z-20 pointer-events-none rounded-[1.5rem] bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-30"></div>
    </div>
  );
}
