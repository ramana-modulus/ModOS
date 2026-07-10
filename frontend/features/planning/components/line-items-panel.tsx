"use client";

import { fmtQ } from "@/lib/format";
import { CodeTag } from "@/components/ui/badge";
import type { Dept, ScType, WbsItem } from "@/features/planning/types";

type DeptMeta = Record<Dept, { label: string; color: string; bg: string }>;

const SC_META: Record<ScType, { label: string; color: string; bg: string; icon: string }> = {
  self: { label: "Self-perform", color: "#185FA5", bg: "#E6F1FB", icon: "ti-tool" },
  manpower: { label: "Manpower SC", color: "#C84B2F", bg: "#FFF3DF", icon: "ti-users-group" },
  lineitem: { label: "Line-item SC", color: "#6B6A68", bg: "#F0EFED", icon: "ti-businessplan" },
  machinery: { label: "Machinery SC", color: "#0E7490", bg: "#E0F7FA", icon: "ti-truck" },
};

const NAT_LABEL: Record<string, { label: string; color: string }> = {
  engineered: { label: "Engineered", color: "#A32D2D" },
  boughtout: { label: "Bought-out", color: "#3B6D11" },
  freeissue: { label: "Free-issue", color: "#854F0B" },
};

const CHIP: Record<Dept, { short: string; color: string }> = {
  engg: { short: "Eng", color: "#185FA5" },
  proc: { short: "Proc", color: "#854F0B" },
  subcontracts: { short: "SubC", color: "#0F766E" },
  ops: { short: "Ops", color: "#C84B2F" },
  qa: { short: "QA", color: "#3B6D11" },
};

/** Read-only line-items side panel (right of the gantt). */
export function LineItemsPanel({ items }: { items: WbsItem[]; deptMeta: DeptMeta }) {
  return (
    <div className="wbs-sidebar">
      <div className="wbs-panel-hdr">
        <div className="mb-0.5 text-t11 font-semibold text-ink">📦 Line Items</div>
        <div className="text-t9 text-faint">Approved BOQ · per-unit quantities</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => {
          const sc = SC_META[item.decision.scType];
          const nat = item.decision.matNature ? NAT_LABEL[item.decision.matNature] : null;
          const depleted = item.fullyScheduled;
          return (
            <div
              key={item.code}
              className="border-b-[0.5px] px-2.5 py-2"
              style={{ borderColor: "#F0EFED", background: depleted ? "#FBFCF9" : "#fff" }}
            >
              <div className="mb-[3px] flex items-center justify-between">
                <CodeTag steel={item.code.startsWith("SS")}>{item.code}</CodeTag>
                <span
                  className="text-t9 font-semibold"
                  style={{ color: depleted ? "#3B6D11" : item.remaining < item.totalQty * 0.2 ? "#A32D2D" : "#854F0B" }}
                >
                  {depleted ? "✓ Done" : `${fmtQ(item.remaining)} ${item.uom} left`}
                </span>
              </div>
              <div className="mb-[3px] text-t11 font-medium leading-[1.3] text-ink">{item.name}</div>

              {/* Exec / material / billing badges */}
              <div className="mb-[5px] flex flex-wrap gap-1">
                <span
                  className="inline-flex items-center gap-[3px] rounded-[10px] px-[7px] py-[2px] text-t9 font-semibold"
                  style={{ color: sc.color, background: sc.bg }}
                >
                  <i className={`ti ${sc.icon} text-[10px]`} />
                  {sc.label}
                </span>
                {nat && (
                  <span
                    className="inline-flex items-center rounded-[10px] px-[7px] py-[2px] text-t9 font-semibold"
                    style={{ color: nat.color, background: nat.color + "14" }}
                  >
                    {nat.label}
                  </span>
                )}
                <span
                  className="inline-flex items-center gap-[3px] rounded-[10px] px-[7px] py-[2px] text-t9 font-semibold"
                  style={{ color: "#0EA5E9", background: "#E0F2FE" }}
                >
                  <i className="ti ti-receipt text-[10px]" />
                  BOQ
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-1 h-[3px] overflow-hidden rounded-[3px]" style={{ background: "#E8E7E4" }}>
                <div
                  className="h-full"
                  style={{ width: `${item.overallPct}%`, background: depleted ? "#3B6D11" : "var(--ac)" }}
                />
              </div>
              <div className="mb-1 text-t9 text-faint">
                {item.overallPct}% scheduled · Per-unit: {fmtQ(item.totalQty)} {item.uom}
              </div>

              {/* Dept progress chips */}
              <div className="flex flex-wrap gap-[3px]">
                {item.deptProgress.map((p) => {
                  const c = CHIP[p.dept];
                  return (
                    <span
                      key={p.dept}
                      title={`${c.short}: ${fmtQ(p.scheduled)}/${fmtQ(p.total)} ${item.uom}`}
                      className="inline-flex items-center gap-[2px] rounded-[8px] px-[5px] py-px text-[8px] font-semibold"
                      style={{
                        background: p.done ? c.color : c.color + "14",
                        color: p.done ? "#fff" : c.color,
                        border: `0.5px solid ${c.color}40`,
                      }}
                    >
                      {p.done ? "✓" : `${p.pct}%`} {c.short}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
