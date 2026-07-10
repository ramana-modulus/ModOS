import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";

const toneClasses: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-soft text-faint",
  accent: "bg-accent-soft text-accent",
};

export interface BadgeProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

/** Pill badge (`.pill` + tone). */
export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[10px] px-1.5 py-0.5 text-t9 font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Raw design-system pill (`.pill .pg/.pa/.pr/.pb/.pgr/.pac`) — used where the
 * port must match the wireframe's exact pill class rather than a semantic tone.
 */
export function Pill({
  cls,
  children,
  className,
  title,
}: {
  cls: "pg" | "pa" | "pr" | "pb" | "pgr" | "pac";
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span className={cn("pill", cls, className)} title={title}>
      {children}
    </span>
  );
}

/** Monospace item-code tag (`.ict`). `steel` variant tints it accent. */
export function CodeTag({
  children,
  steel = false,
  className,
}: {
  children: ReactNode;
  steel?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "m-px inline-flex items-center rounded border-[0.5px] px-1.5 py-0.5 font-mono text-t9 font-medium",
        steel
          ? "border-accent/30 bg-accent-tint text-accent"
          : "border-line bg-neutral-soft text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
