import { Pill } from "@/components/ui/badge";
import { TECH_TAGS } from "@/features/bizdev/data/stages";
import type { LeadHeat, StageId, StageThreshold } from "@/features/bizdev/types";

export function TechTag({ tech }: { tech: string }) {
  return <span className={`tech-tag ${TECH_TAGS[tech] ?? "tech-prefab"}`}>{tech}</span>;
}

export function TypePill({ kind }: { kind: string }) {
  return kind === "B2G" ? (
    <Pill cls="pb" className="text-[8.5px]">B2G</Pill>
  ) : (
    <Pill cls="pac" className="text-[8.5px]">B2B</Pill>
  );
}

export function HeatPill({ heat }: { heat: LeadHeat }) {
  const map = { Hot: "pr", Warm: "pa", Tender: "pb", Cold: "pgr" } as const;
  return <Pill cls={map[heat] ?? "pgr"}>{heat}</Pill>;
}

/** Stage-age pill (`getStageAgePill`) — colour driven by warn/stale thresholds. */
export function StageAgePill({
  status,
  days,
  stageLabel,
  threshold,
  short = false,
}: {
  status: StageId;
  days: number;
  stageLabel: string;
  threshold?: StageThreshold;
  short?: boolean;
}) {
  let bg = "#F0EFED";
  let fg = "#6B6A68";
  let border = "transparent";
  if (threshold) {
    if (days >= threshold.stale) {
      bg = "#FCEBEB";
      fg = "#A32D2D";
      border = "#F0C4C4";
    } else if (days >= threshold.warn) {
      bg = "#FFF8EC";
      fg = "#854F0B";
      border = "#F0D4A0";
    } else {
      bg = "#EAF3DE";
      fg = "#3B6D11";
      border = "#C0DD97";
    }
  }
  const title = threshold
    ? `In ${stageLabel} · warn @ ${threshold.warn}d · stale @ ${threshold.stale}d`
    : `In ${stageLabel}`;
  void status;
  return (
    <span
      title={title}
      className="inline-flex items-center gap-[3px] rounded-[10px] border-[0.5px] px-1.5 py-px text-t9 font-medium"
      style={{ background: bg, color: fg, borderColor: border }}
    >
      ⏱ {short ? `${days}d` : `${days}d in ${stageLabel}`}
    </span>
  );
}

export function CostingBadge({ received }: { received: boolean }) {
  return received ? (
    <span className="costing-received-badge">
      <span className="pulse" />
      Costing received
    </span>
  ) : (
    <span className="costing-needed-badge">⚡ Costing needed</span>
  );
}
