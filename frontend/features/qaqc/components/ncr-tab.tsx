"use client";

import { useState } from "react";
import { Pill } from "@/components/ui/badge";
import { fmtQ } from "@/lib/format";
import type { NcrBucket, NcrStatus, NcrView } from "@/features/qaqc/types";

const DISPO_LABEL: Record<string, string> = {
  rework: "Rework",
  repair: "Repair",
  use_as_is: "Use-as-is (concession)",
  reject: "Reject / Scrap",
};

const STATUS_META: Record<NcrStatus, { pill: "pg" | "pa" | "pr" | "pb" | "pgr" | "pac"; label: string; step: string }> = {
  open: { pill: "pr", label: "Open", step: "Raised" },
  rca_pending: { pill: "pa", label: "RCA pending", step: "RCA" },
  rca_review: { pill: "pb", label: "RCA in review", step: "Review" },
  action_planned: { pill: "pa", label: "Action Planned", step: "Approved" },
  action_taken: { pill: "pa", label: "Verify changes from Ops", step: "Fixed" },
  verified: { pill: "pb", label: "Action Taken", step: "Verified" },
  closed: { pill: "pg", label: "Closed", step: "Closed" },
};

const SEV_META: Record<string, { color: string; label: string }> = {
  minor: { color: "#854F0B", label: "Minor" },
  major: { color: "#A32D2D", label: "Major" },
  critical: { color: "#5C2E91", label: "CRITICAL" },
};

function IsoBox({ label, value, by }: { label: string; value?: string | null; by?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-md border-[0.5px] border-line bg-canvas px-2.5 py-2">
      <div className="mb-0.5 text-t9 font-semibold uppercase tracking-[0.4px] text-faint">{label}</div>
      <div className="text-t10 leading-[1.4] text-ink-soft">{value}</div>
      {by && <div className="mt-0.5 text-t9 text-faint">{by}</div>}
    </div>
  );
}

const FILTERS: [NcrBucket | "all", string, string][] = [
  ["all", "All", "#1A1917"],
  ["awaiting", "Awaiting", "#A32D2D"],
  ["rework", "In rework", "#854F0B"],
  ["cleared", "Cleared", "#3B6D11"],
];

export function NcrTab({ ncrs }: { ncrs: NcrView[] }) {
  const [filter, setFilter] = useState<NcrBucket | "all">("all");
  const shown = filter === "all" ? ncrs : ncrs.filter((n) => n.bucket === filter);

  return (
    <div>
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <button type="button" className="rounded-md border-[0.5px] border-accent bg-accent px-2.5 py-1 text-t10 font-medium text-white">
          + Raise NCR
        </button>
        <button type="button" className="rounded-md border-[0.5px] border-line bg-surface px-2.5 py-1 text-t10 text-muted">
          ↓ Download NCR Register
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="mr-0.5 text-t9 uppercase tracking-[0.5px] text-faint">Show</span>
          {FILTERS.map(([f, lbl, col]) => {
            const cnt = f === "all" ? ncrs.length : ncrs.filter((n) => n.bucket === f).length;
            const a = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="cursor-pointer rounded-[12px] border-[0.5px] px-[9px] py-[3px] text-t10"
                style={{ borderColor: a ? col : "#D8D7D4", background: a ? col + "14" : "#fff", color: a ? col : "#6B6A68", fontWeight: a ? 600 : 400 }}
              >
                {lbl}
                {cnt > 0 ? ` (${cnt})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-lg bg-subtle p-[30px] text-center text-t11 text-faint">
          {ncrs.length === 0 ? "No NCRs raised for this sub-project. ✓" : "No NCRs match this filter."}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {shown.map((n) => {
            const sm = STATUS_META[n.status] ?? STATUS_META.open;
            const sev = SEV_META[n.severity] ?? SEV_META.minor!;
            const stages: NcrStatus[] =
              n.disposition === "use_as_is"
                ? ["open", "action_planned", "closed"]
                : ["open", "rca_pending", "rca_review", "action_planned", "action_taken", "verified", "closed"];
            const curIdx = stages.indexOf(n.status);
            const hasDetail = n.disposition || n.rootCause || n.correctiveAction || n.actionPlan || n.actionTaken;
            return (
              <div key={n.id} className="rounded-lg border-[0.5px] bg-surface p-3.5" style={{ borderColor: n.status === "closed" ? "#3B6D11" : "#E5E4E0" }}>
                {/* header */}
                <div className="mb-2.5 border-b-[0.5px] border-line-soft pb-2.5">
                  <div className="mb-[3px] flex flex-wrap items-center gap-2">
                    <span className="font-mono text-t13 font-semibold text-ink">{n.id}</span>
                    <span className="rounded-sm px-2 py-0.5 text-t9 font-semibold" style={{ background: sev.color + "20", color: sev.color }}>
                      {sev.label}
                    </span>
                    <Pill cls={sm.pill}>{sm.label}</Pill>
                    {n.source === "FIR" && (
                      <span className="rounded-sm px-2 py-0.5 text-t9 font-semibold" style={{ background: "#F3E8FB", color: "#7B1FA2" }}>
                        Field audit
                      </span>
                    )}
                    {n.source === "manual" && (
                      <span className="rounded-sm px-2 py-0.5 text-t9 font-semibold" style={{ background: "#E6F1FB", color: "#185FA5" }}>
                        Manual
                      </span>
                    )}
                    {n.qty ? (
                      <span className="rounded-sm px-2 py-0.5 text-t9 font-semibold" style={{ background: "#FBF1E0", color: "#854F0B" }}>
                        {fmtQ(n.qty)}
                        {n.uom ? " " + n.uom : ""} affected
                      </span>
                    ) : null}
                    {n.status !== "closed" &&
                      (n.blocks ? (
                        <span className="rounded-sm px-2 py-0.5 text-t9 font-semibold" style={{ background: "#FAE9E4", color: "#A32D2D" }}>
                          Holds RA
                        </span>
                      ) : (
                        <span className="rounded-sm px-2 py-0.5 text-t9 font-semibold" style={{ background: "#F0EFEB", color: "#6B6A68" }}>
                          Observation
                        </span>
                      ))}
                  </div>
                  <div className="mb-1 text-t11 leading-[1.5] text-ink-soft">{n.defect}</div>
                  {n.inspNote && (
                    <div className="mb-1.5 rounded-sm border-l-2 border-line bg-canvas px-2.5 py-1.5 text-t10 leading-[1.45] text-muted">
                      <b style={{ color: "#854F0B" }}>Inspector note:</b> {n.inspNote}
                    </div>
                  )}
                  <div className="text-t9 text-faint">
                    For <span className="font-mono" style={{ color: "#854F0B" }}>{n.forCode}</span> · raised by {n.raisedBy} on {n.raisedAt}
                    {n.cabin != null && ` · Cabin ${String(n.cabin).padStart(2, "0")}`}
                    {n.linkedInspection && (
                      <>
                        {" "}
                        · linked to <span className="font-mono" style={{ color: "#185FA5" }}>{n.linkedInspection}</span>
                      </>
                    )}
                    {n.opsIndent && (
                      <>
                        {" "}
                        · Ops indent <span className="font-mono" style={{ color: "#A32D2D" }}>{n.opsIndent}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* stepper */}
                <div className="mb-3 flex items-center">
                  {stages.map((s, i) => {
                    const done = i <= curIdx;
                    const isCur = i === curIdx;
                    const sl = STATUS_META[s]?.step ?? s;
                    return (
                      <div key={s} className="flex flex-1 items-center">
                        <div
                          className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-t9 font-semibold text-white"
                          style={{ background: done ? (n.status === "closed" ? "#3B6D11" : "var(--ac)") : "#E5E4E0" }}
                        >
                          {done ? "✓" : i + 1}
                        </div>
                        <div className="ml-[5px] text-t9" style={{ color: done || isCur ? "#1A1917" : "#9B9894", fontWeight: isCur ? 600 : 400 }}>
                          {sl}
                        </div>
                        {i < stages.length - 1 && <div className="mx-[5px] h-[1.5px] flex-1" style={{ background: i < curIdx ? "var(--ac)" : "#E5E4E0" }} />}
                      </div>
                    );
                  })}
                </div>

                {/* disposition + ISO */}
                {hasDetail ? (
                  <div className="mb-2">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-t9">
                      {n.disposition && (
                        <span className="rounded-sm border-[0.5px] px-2 py-0.5 font-semibold" style={{ background: "#EEF1FB", borderColor: "#C9D3EC", color: "#3A4D7A" }}>
                          Disposition: {DISPO_LABEL[n.disposition] ?? n.disposition}
                        </span>
                      )}
                      {n.responsibleParty && (
                        <span className="text-muted">
                          Owner: <b className="text-ink-soft">{n.responsibleParty}</b>
                        </span>
                      )}
                      {n.targetDate && (
                        <span className="text-muted">
                          Target: <b className="text-ink-soft">{n.targetDate}</b>
                        </span>
                      )}
                      {n.opsNotifiedAt && (
                        <span className="rounded-sm border-[0.5px] px-2 py-0.5 font-semibold" style={{ background: "#EAF3DE", borderColor: "#cfe0b8", color: "#3B6D11" }}>
                          🔔 {n.opsNotifiedTo ?? "Ops team"} notified · {n.opsNotifiedAt}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <IsoBox label="Root Cause" value={n.rootCause} />
                      <IsoBox label="Correction (immediate)" value={n.correction} />
                      <IsoBox
                        label="Corrective / Preventive Action"
                        value={n.correctiveAction ?? n.actionPlan}
                        by={n.actionPlanBy ? `by ${n.actionPlanBy} · ${n.actionPlanAt}` : undefined}
                      />
                      <IsoBox label="Fix by Ops" value={n.actionTaken} by={n.actionTakenBy ? `by ${n.actionTakenBy} · ${n.actionTakenAt}` : undefined} />
                    </div>
                    {n.verifyNote && (
                      <div className="mt-2 rounded border-[0.5px] px-2.5 py-2 text-t10" style={{ background: "#EAF3DE", borderColor: "#cfe0b8", color: "#3B6D11" }}>
                        <b>Verification of effectiveness:</b> {n.verifyNote}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-2 rounded bg-subtle px-2.5 py-2 text-t10 italic text-faint">
                    No disposition yet — open the CAR to record root cause &amp; corrective action.
                  </div>
                )}

                {/* closure / attachments */}
                {n.status === "closed" ? (
                  <div className="flex items-center justify-between rounded border-[0.5px] px-2.5 py-2 text-t10" style={{ background: "#EAF3DE", borderColor: "#3B6D11", color: "#3B6D11" }}>
                    <span>
                      ✓ Closed on {n.closedAt} by {n.closedBy}
                      {n.verifiedAt ? ` · verified ${n.verifiedAt}` : ""}
                    </span>
                    {n.attachments?.length ? <span className="text-t9 text-muted">{n.attachments.length} attachment{n.attachments.length > 1 ? "s" : ""}</span> : null}
                  </div>
                ) : (
                  n.attachments?.length ? (
                    <div className="text-t9 text-faint">
                      📎 {n.attachments.length} attachment{n.attachments.length > 1 ? "s" : ""}: {n.attachments.join(", ")}
                    </div>
                  ) : null
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
