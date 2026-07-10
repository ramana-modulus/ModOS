import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "default" | "ghost" | "danger" | "subtle";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

const variants: Record<ButtonVariant, string> = {
  primary: "border-[0.5px] border-accent bg-accent text-white hover:opacity-90",
  default: "border-[0.5px] border-input bg-surface text-muted hover:bg-canvas",
  ghost: "border-[0.5px] border-transparent bg-transparent text-muted hover:bg-canvas",
  danger: "border-[0.5px] border-danger/40 bg-danger-soft text-danger hover:bg-danger/10",
  subtle: "border-[0.5px] border-line bg-canvas text-ink hover:bg-line-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-t10",
  md: "px-[9px] py-[5px] text-t11",
};

/** Shared class string — reuse on `next/link` when a link should look like a button. */
export function buttonClasses(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  const { variant = "default", size = "md", className } = opts ?? {};
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", size = "md", type = "button", className, ...props },
  ref
) {
  return (
    <button ref={ref} type={type} className={buttonClasses({ variant, size, className })} {...props} />
  );
});
