"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ScMatNature, ScType } from "@/features/subcontracts/types";

/** Inline status chip (bg/fg pair, matching the prototype's derived pills). */
export function Chip({ label, bg, fg, mono }: { label: string; bg: string; fg: string; mono?: boolean }) {
  return (
    <span
      className="inline-block whitespace-nowrap rounded-lg px-1.5 py-0.5 text-t9 font-semibold"
      style={{ background: bg, color: fg, fontFamily: mono ? "monospace" : undefined }}
    >
      {label}
    </span>
  );
}

/** scType pill — Composite / Machinery / Labour SC, with material nature. */
export function TypePill({ scType, matNature }: { scType: ScType; matNature: ScMatNature }) {
  if (scType === "lineitem")
    return (
      <span className="pill" style={{ background: "#E6F5F3", color: "#0F766E", border: "0.5px solid #99D6CC" }}>
        Composite SC
      </span>
    );
  if (scType === "machinery")
    return (
      <span className="pill" style={{ background: "#E0F2F1", color: "#0B5C52", border: "0.5px solid #80CBC4" }}>
        Machinery SC
      </span>
    );
  const nat = matNature === "engineered" ? " · engineered" : matNature === "boughtout" ? " · bought-out" : matNature === "freeissue" ? " · free-issue" : "";
  return (
    <span className="pill" style={{ background: "#FDF0E6", color: "#9A4B17", border: "0.5px solid #F0C9A8" }}>
      Labour SC{nat}
    </span>
  );
}

/** Mono code tag in the amber accent used across the SC tables. */
export function Code({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-t10 font-semibold" style={{ color: "#854F0B" }}>
      {children}
    </span>
  );
}

/** Category banner (dark bar) grouping rows by trade. */
export function CatBanner({ label, count, noun, right }: { label: string; count: number; noun: string; right?: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-3.5 py-[7px] text-t9 font-bold uppercase tracking-[0.6px] text-white"
      style={{ background: "#1A1917" }}
    >
      <span>
        {label}{" "}
        <span className="ml-1.5 text-t9 font-normal normal-case tracking-normal opacity-55">
          {count} {noun}
          {count === 1 ? "" : "s"}
        </span>
      </span>
      {right && <span className="flex items-center gap-3 text-t9 font-medium normal-case tracking-normal">{right}</span>}
    </div>
  );
}

/** Info/help banner strip. */
export function InfoBanner({ children, style, tone = "teal" }: { children: ReactNode; style?: CSSProperties; tone?: "teal" | "blue" | "amber" | "gray" }) {
  const tones: Record<string, CSSProperties> = {
    teal: { background: "#E6F5F3", borderLeft: "3px solid #0F766E", color: "#0B5C52" },
    blue: { background: "#E0F2FE", borderLeft: "3px solid #0EA5E9", color: "#075985" },
    amber: { background: "#FAEEDA", border: "0.5px solid #854F0B", color: "#854F0B" },
    gray: { background: "#FBF9F6", border: "0.5px solid #E5E4E0", color: "#6B6A68" },
  };
  return (
    <div className="mb-2.5 rounded px-2.5 py-2 text-t10" style={{ ...tones[tone], ...style }}>
      {children}
    </div>
  );
}

/** Variance % pill vs budget (green ≤5, amber ≤12, red beyond). */
export function VarPill({ value }: { value: number | null }) {
  if (value == null) return <span style={{ fontSize: 9, color: "#C8C6C2" }}>—</span>;
  if (Math.abs(value) < 0.5)
    return <Chip label="±0%" bg="#EAF3DE" fg="#3B6D11" />;
  const [bg, fg] = Math.abs(value) <= 5 ? ["#EAF3DE", "#3B6D11"] : Math.abs(value) <= 12 ? ["#FEF6E7", "#854F0B"] : ["#FCEBEB", "#A32D2D"];
  return <Chip label={`${value > 0 ? "+" : ""}${value.toFixed(1)}%`} bg={bg} fg={fg} />;
}
