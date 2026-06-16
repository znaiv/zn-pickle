import { cn } from "@/lib/utils";
import Link from "next/link";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "court";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  target?: string;
  rel?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 active:scale-[0.98]",
  secondary:
    "border border-border-strong bg-surface-raised text-charcoal hover:bg-slate-50 active:scale-[0.98]",
  ghost: "text-charcoal hover:bg-slate-100",
  inverse:
    "bg-white text-ink shadow-lg shadow-black/10 hover:bg-slate-50 active:scale-[0.98]",
  court:
    "border border-border-strong bg-surface-raised text-charcoal hover:border-brand-500 hover:bg-brand-600 hover:text-white active:bg-brand-700 active:border-brand-700 active:scale-[0.98]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm font-medium",
  lg: "px-7 py-3.5 text-base font-semibold",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, target, rel, children, ...props }, ref) => {
    const classes = cn(baseClass, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link href={href} className={classes} target={target} rel={rel}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
