import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={id}
        className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </label>
      {children(id)}
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("field-base min-h-11", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("field-base resize-none", props.className)} />;
}
