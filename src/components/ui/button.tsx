import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-accent-violet to-accent-cyan text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_-8px_rgba(139,92,246,0.55)] hover:brightness-110 active:brightness-95",
  secondary:
    "bg-white/[0.06] text-foreground border border-white/10 hover:bg-white/[0.1]",
  ghost: "text-muted hover:text-foreground hover:bg-white/5",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
