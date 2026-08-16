import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  neutral: "bg-white/5 text-muted border-white/10",
  violet: "bg-accent-violet/10 text-violet-300 border-accent-violet/20",
  cyan: "bg-accent-cyan/10 text-cyan-300 border-accent-cyan/20",
  emerald: "bg-accent-emerald/10 text-emerald-300 border-accent-emerald/20",
} as const;

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
