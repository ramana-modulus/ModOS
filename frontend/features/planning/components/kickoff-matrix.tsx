"use client";

import { fmtQ } from "@/lib/format";
import { CodeTag } from "@/components/ui/badge";
import type { KickoffMatrixView, ScType } from "@/features/planning/types";

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

const DEPT_SHORT: Record<string, string> = {
  engg: "Eng",
  proc: "Proc",
  subcontracts: "SubC",
  ops: "Ops",
  qa: "QA",
};

/** Kickoff decision matrix — Line items (Y) × execution decision (X). Read-only. */
export function KickoffMatrix({ matrix }: { matrix: KickoffMatrixView }) {
  return (
    <div className="max-w-[920px]">
      {/* Signoff banner + progress */}
      <div
        className="mb-3 flex items-center gap-3 rounded-lg border-[0.5px] px-3 py-2.5"
        style={{ borderColor: "#C0DD97", background: "#EAF3DE" }}
      >
        <i className="ti ti-lock-check text-[16px]" style={{ color: "#3B6D11" }} />
        <div className="flex-1">
          <div className="text-t12 font-semibold" style={{ color: "#3B6D11" }}>
            Kickoff decisions signed off ({matrix.decided}/{matrix.total} · {matrix.pct}%)
          </div>
          <div className="text-t10 text-muted">
            Signed by {matrix.signedBy} · {matrix.signedOn}
          </div>
        </div>
        <div className="flex gap-3 text-t10 text-muted">
          <span>
            <strong style={{ color: "#C84B2F" }}>{matrix.counts.manpower}</strong> Manpower
          </span>
          <span>
            <strong style={{ color: "#6B6A68" }}>{matrix.counts.lineitem}</strong> Line-item
          </span>
          <span>
            <strong style={{ color: "#A32D2D" }}>{matrix.counts.engineered}</strong> Engineered
          </span>
          <span>
            <strong style={{ color: "#3B6D11" }}>{matrix.counts.boughtout}</strong> Bought-out
          </span>
        </div>
      </div>

      <div className="tw">
        <div
          className="th"
          style={{ display: "grid", gridTemplateColumns: "70px 1fr 90px 130px 120px 1fr" }}
        >
          <span>Code</span>
          <span>Line Item</span>
          <span>Per-unit</span>
          <span>Subcontract</span>
          <span>Material</span>
          <span>Routes through</span>
        </div>
        {matrix.cats.map((cat) => (
          <div key={cat.catId}>
            <div
              className="px-2.5 py-1.5 text-t9 font-bold uppercase tracking-[0.5px] text-white"
              style={{ background: "#1A1917" }}
            >
              {cat.cat}
            </div>
            {cat.items.map((it) => {
              const sc = SC_META[it.decision.scType];
              const nat = it.decision.matNature ? NAT_LABEL[it.decision.matNature] : null;
              return (
                <div
                  key={it.code}
                  className="tr items-center"
                  style={{ display: "grid", gridTemplateColumns: "70px 1fr 90px 130px 120px 1fr" }}
                >
                  <span>
                    <CodeTag steel={it.code.startsWith("SS")}>{it.code}</CodeTag>
                  </span>
                  <span className="tn truncate">{it.name}</span>
                  <span className="ts">
                    {fmtQ(it.qtyPerUnit)} {it.uom}
                  </span>
                  <span>
                    <span
                      className="inline-flex items-center gap-[3px] rounded-[10px] px-[7px] py-[2px] text-t9 font-semibold"
                      style={{ color: sc.color, background: sc.bg }}
                    >
                      <i className={`ti ${sc.icon} text-[10px]`} />
                      {sc.label}
                    </span>
                  </span>
                  <span>
                    {nat ? (
                      <span
                        className="inline-flex items-center rounded-[10px] px-[7px] py-[2px] text-t9 font-semibold"
                        style={{ color: nat.color, background: nat.color + "14" }}
                      >
                        {nat.label}
                      </span>
                    ) : (
                      <span className="ts">—</span>
                    )}
                  </span>
                  <span className="flex flex-wrap gap-[3px]">
                    {it.route.map((d) => (
                      <span key={d} className="rounded-[8px] bg-neutral-soft px-[5px] py-px text-[8px] font-semibold text-muted">
                        {DEPT_SHORT[d]}
                      </span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
