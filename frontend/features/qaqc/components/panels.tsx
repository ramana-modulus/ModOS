"use client";

import type { CheckResult, InspectionView, Itp } from "@/features/qaqc/types";
import { fmtQ } from "@/lib/format";

const R_ICON: Record<string, string> = { pass: "✓", fail: "✗", partial: "◐", na: "—", pending: "…" };
const R_COL: Record<string, string> = { pass: "#3B6D11", fail: "#A32D2D", partial: "#854F0B", na: "#9B9894", pending: "#9B9894" };

const STAGE_META: Record<string, { lbl: string; bg: string; col: string }> = {
  incoming: { lbl: "Incoming", bg: "#FAEEDA", col: "#854F0B" },
  wip: { lbl: "WIP / In-process", bg: "#EFF5FB", col: "#185FA5" },
  final: { lbl: "Final / Erection", bg: "#F3E9FA", col: "#7B1FA2" },
};

/** Read-only inspection detail (port of `openQcInspectionDetail`). */
export function InspectionDetail({ insp, itp }: { insp: InspectionView; itp: Itp | null }) {
  const sm = itp ? STAGE_META[itp.stage] ?? { lbl: itp.stage, bg: "#F2F1EE", col: "#6B6A68" } : null;
  const gate = itp?.holdPoint ? "Hold point" : itp?.witnessPoint ? "Witness point" : null;
  const critFor = (check: string, idx: number) =>
    itp ? itp.checks.find((c) => c.check === check) ?? itp.checks[idx] : undefined;

  return (
    <div>
      {/* meta row */}
      <div className="mb-2 flex flex-wrap gap-x-3.5 gap-y-1 text-t10 text-muted">
        <span>
          For: <b className="font-mono text-ink">{insp.bomCode}</b>
        </span>
        <span>
          Date: <b className="text-ink">{insp.date}</b>
        </span>
        <span>
          Inspector: <b className="text-ink">{insp.inspector ?? "—"}</b>
        </span>
        {insp.grnRef && (
          <span>
            GRN: <b className="font-mono text-ink">{insp.grnRef}</b>
          </span>
        )}
        <span>
          Scope: <b className="text-ink">{insp.cabinLabel}</b>
        </span>
      </div>

      {/* ITP banner */}
      {itp && sm && (
        <div className="mb-2.5 flex items-center gap-2 rounded-md border-[0.5px] border-line bg-canvas px-2.5 py-2">
          <div className="flex-1">
            <div className="text-t10 font-semibold text-ink">
              {insp.itpRef ?? "ITP"} · {itp.name}
            </div>
            <div className="text-t9 text-faint">
              Per the {sm.lbl} ITP for {insp.bomCode} · {itp.checks.length} check{itp.checks.length > 1 ? "s" : ""}
            </div>
          </div>
          <span className="rounded-lg px-[7px] py-px text-[8.5px] font-semibold" style={{ background: sm.bg, color: sm.col }}>
            {sm.lbl}
          </span>
          {gate && (
            <span
              className="rounded-lg px-[7px] py-px text-[8.5px] font-semibold"
              style={{ background: itp.holdPoint ? "#FCEBEB" : "#EFF5FB", color: itp.holdPoint ? "#A32D2D" : "#185FA5" }}
            >
              {gate}
            </span>
          )}
        </div>
      )}

      {/* check results */}
      <div className="mb-1 text-t9 font-medium uppercase tracking-[0.5px] text-faint">Check results</div>
      <div className="mb-2.5 rounded-md border-[0.5px] border-line px-2.5">
        {insp.checkResults.length === 0 && <div className="py-2.5 text-t10 text-faint">No checks recorded yet — inspection pending.</div>}
        {insp.checkResults.map((c, idx) => {
          const crit = critFor(c.check, idx);
          const res = (c.result ?? "pending") as NonNullable<CheckResult>;
          return (
            <div key={idx} className="flex items-start gap-2 border-b-[0.5px] border-line-soft py-1.5 last:border-b-0">
              <span className="w-3.5 font-bold" style={{ color: R_COL[res] ?? "#9B9894" }}>
                {R_ICON[res] ?? "…"}
              </span>
              <div className="flex-1">
                <div className="text-t10 text-ink">{c.check}</div>
                {crit?.criteria && (
                  <div className="text-t9 text-faint">
                    {crit.criteria} <span className="text-faint">· {crit.method}</span>
                  </div>
                )}
                {c.note && <div className="text-t9 italic text-muted">&ldquo;{c.note}&rdquo;</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* overall note */}
      {insp.note && <div className="rounded-md bg-canvas px-2.5 py-1.5 text-t10 text-ink-soft">{insp.note}</div>}

      {/* NCR / RTV */}
      {insp.ncrTriggered ? (
        <div className="mt-2 rounded-md border-[0.5px] px-2.5 py-1.5 text-t10" style={{ color: "#A32D2D", background: "#FBF3F3", borderColor: "#E8C9C9" }}>
          ⚠ NCR raised: <b className="font-mono">{insp.ncrId}</b>
        </div>
      ) : insp.type === "IMIR" && insp.status === "failed" ? (
        <div className="mt-2 rounded-md border-[0.5px] px-2.5 py-1.5 text-t10" style={{ color: "#A32D2D", background: "#FBF3F3", borderColor: "#E8C9C9" }}>
          ↺ Rejected at incoming inspection — handled as a material non-conformance via Return-to-Vendor (Procurement).
        </div>
      ) : null}

      {/* hold point */}
      {insp.isHoldPoint && (
        <div
          className="mt-2 rounded-md border-[0.5px] px-2.5 py-[7px] text-t10"
          style={
            insp.hpState === "awaiting_release"
              ? { color: "#A32D2D", background: "#FCEBEB", borderColor: "#E8C9C9" }
              : insp.hpState === "released" || insp.hpState === "released_conditional"
                ? { color: "#3B6D11", background: "#EAF3DE", borderColor: "#CFE3B5" }
                : { color: "#A32D2D", background: "#FBF3F3", borderColor: "#E8C9C9" }
          }
        >
          ✋ Hold point —{" "}
          {insp.hpState === "awaiting_release"
            ? "awaiting QC release. Releasing authorises work/stock to proceed past this point."
            : insp.hpState === "released" || insp.hpState === "released_conditional"
              ? `released by ${insp.hpRelease?.by ?? "—"} on ${insp.hpRelease?.at ?? ""}`
              : "on hold — rework / re-inspect."}
        </div>
      )}

      {insp.orderedQty != null && (
        <div className="mt-2 text-t9 text-faint">
          Ordered {fmtQ(insp.orderedQty)} · received {fmtQ(insp.receivedQty)} {insp.uom}
        </div>
      )}
    </div>
  );
}
