import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";

const valueTone: Record<StatusTone, string> = {
  success: "text-success",
  warn: "text-warn",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-ink",
  accent: "text-accent",
};

/** Responsive KPI grid (`.kr`). Override columns via `className`. */
export function KpiGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mb-2.5 grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface KpiCardProps {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tone?: StatusTone;
  className?: string;
}

/** Single KPI panel (`.kp` / `.kl` / `.kv` / `.ks`). */
export function KpiCard({ label, value, sub, tone = "neutral", className }: KpiCardProps) {
  return (
    <div className={cn("rounded-lg bg-canvas px-[11px] py-2", className)}>
      <div className="mb-0.5 text-t9 uppercase tracking-[0.6px] text-faint">{label}</div>
      <div className={cn("text-t18 font-bold leading-[1.15]", valueTone[tone])}>{value}</div>
      {sub != null && <div className="mt-px text-t9 leading-tight text-faint">{sub}</div>}
    </div>
  );
}
