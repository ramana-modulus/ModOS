"use client";

import type { ReactNode } from "react";
import { Pill } from "@/components/ui/badge";
import type { DrwStatus, EngStatusLike, StageStatus } from "@/features/engineering/types";

type PillCls = "pg" | "pa" | "pr" | "pb" | "pgr" | "pac";

/** Per-drawing state-machine → pill class + label. */
export const DRW_STATUS_META: Record<DrwStatus, { pill: PillCls; label: string; color: string }> = {
  pending: { pill: "pgr", label: "Pending", color: "#9B9894" },
  in_progress: { pill: "pa", label: "In Progress", color: "#854F0B" },
  submitted: { pill: "pb", label: "Submitted", color: "#185FA5" },
  in_approval: { pill: "pa", label: "In Approval", color: "#854F0B" },
  rework: { pill: "pr", label: "Rework", color: "#A32D2D" },
  site_query: { pill: "pr", label: "Site Query", color: "#A32D2D" },
  approved: { pill: "pg", label: "Approved", color: "#3B6D11" },
};

/** BOQ line status → pill class + label. */
export const ENG_STATUS_META: Record<EngStatusLike, { pill: PillCls; label: string }> = {
  pending: { pill: "pgr", label: "Pending" },
  in_progress: { pill: "pa", label: "In Progress" },
  submitted: { pill: "pb", label: "Submitted" },
  in_approval: { pill: "pa", label: "In Approval" },
  rework: { pill: "pr", label: "Rework" },
  approved: { pill: "pg", label: "Approved" },
};

/** Legacy drawings-tracker cell status → pill + colour. */
export const STAGE_STATUS_META: Record<StageStatus, { pill: PillCls; label: string; color: string }> = {
  pending: { pill: "pgr", label: "Pending", color: "#9B9894" },
  in_review: { pill: "pa", label: "In Review", color: "#854F0B" },
  approved: { pill: "pg", label: "Approved", color: "#3B6D11" },
  not_submitted: { pill: "pgr", label: "Not Submitted", color: "#9B9894" },
  submitted: { pill: "pa", label: "Submitted", color: "#854F0B" },
  vetted: { pill: "pg", label: "Vetted ✓", color: "#3B6D11" },
  rejected: { pill: "pr", label: "Rejected", color: "#A32D2D" },
};

export const STAGE_META: Record<string, { label: string; sub: string }> = {
  preliminary: { label: "Preliminary", sub: "Concept & scheme" },
  gfc: { label: "GFC", sub: "Good for Construction" },
  detailed: { label: "Detailed", sub: "Fabrication / shop dwgs" },
  vetting: { label: "External Vetting", sub: "IIT proof check" },
};

export function DrwStatusPill({ status }: { status: DrwStatus }) {
  const m = DRW_STATUS_META[status];
  return <Pill cls={m.pill}>{m.label}</Pill>;
}

export function EngStatusPill({ status }: { status: EngStatusLike }) {
  const m = ENG_STATUS_META[status] ?? ENG_STATUS_META.pending;
  return <Pill cls={m.pill}>{m.label}</Pill>;
}

/** Small uppercase section label used above tables/lists. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-t9 font-medium uppercase tracking-[0.5px] text-faint">{children}</div>;
}

/** Empty-state card. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-subtle px-8 py-8 text-center text-t11 text-faint">{children}</div>
  );
}

/** Info banner (accent tint). */
export function InfoBanner({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "info" }) {
  const cls = tone === "info" ? "bg-info-soft text-info" : "border-[0.5px] border-line bg-surface text-muted";
  return <div className={`mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-t10 ${cls}`}>{children}</div>;
}
