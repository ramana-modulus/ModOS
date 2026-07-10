"use client";

import type { OpsPayload } from "@/features/ops/api";
import type { SnagStatus } from "@/features/ops/types";

const STAGES = [
  { id: "snag_walk", label: "Snag Walk", desc: "Joint walk with client to identify defects" },
  { id: "snag_closure", label: "Snag Closure", desc: "Rectification + photo evidence" },
  { id: "fac_pending", label: "FAC Sign-off", desc: "Final Acceptance Certificate from client" },
  { id: "fac_signed", label: "Handed Over", desc: "Project closure + DLP begins" },
];

const SNAG_META: Record<SnagStatus, { pill: string; label: string }> = {
  open: { pill: "pa", label: "Open" },
  rectified: { pill: "pb", label: "Rectified — verify" },
  verified: { pill: "pg", label: "Verified" },
};

export function HandoverTab({ data }: { data: OpsPayload }) {
  const h = data.handover;
  if (!h) return <div className="text-t11 text-faint">No handover record for this sub-project.</div>;

  const stageIdx = STAGES.findIndex((s) => s.id === h.facStatus);
  const notStarted = h.facStatus === "not_started";

  return (
    <div className="max-w-[780px]">
      {notStarted && (
        <div className="mb-3.5 flex items-center gap-3 rounded-lg border-[0.5px] border-line bg-[#FBF9F6] p-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#F0EFEB", color: "#9B9894" }}>
            ⏳
          </div>
          <div className="flex-1">
            <div className="mb-0.5 text-t12 font-medium text-ink">Handover not yet started</div>
            <div className="text-t10 text-muted">{h.note}</div>
          </div>
        </div>
      )}

      {/* Stage stepper */}
      <div className="mb-2 text-t10 font-medium uppercase tracking-[0.6px] text-faint">Handover Workflow</div>
      <div className="mb-3.5 flex items-stretch rounded-lg border-[0.5px] border-line bg-surface p-3.5">
        {STAGES.map((s, i) => {
          const done = i <= stageIdx;
          const active = i === stageIdx + 1;
          return (
            <div key={s.id} className="flex flex-1 items-start gap-2">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-t10 font-semibold"
                style={{
                  background: done ? "var(--ac)" : active ? "#fff" : "#E5E4E0",
                  border: `1.5px solid ${done || active ? "var(--ac)" : "#E5E4E0"}`,
                  color: done ? "#fff" : active ? "var(--ac)" : "#9B9894",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <div className="flex-1">
                <div className="text-t11" style={{ fontWeight: active || done ? 600 : 400, color: done || active ? "#1A1917" : "#9B9894" }}>
                  {s.label}
                </div>
                <div className="mt-px text-t9 leading-snug text-faint">{s.desc}</div>
              </div>
              {i < STAGES.length - 1 && (
                <div className="flex w-6 items-center">
                  <div className="h-[1.5px] flex-1" style={{ background: i < stageIdx ? "var(--ac)" : "#E5E4E0" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#EFF5FB] px-3 py-2 text-t9 text-muted">
        Snags are raised by QA/QC on the joint walk. Rectify each with evidence → QA verifies → once all are cleared
        and the client signs the FAC, the final handover claim is released.
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {/* Snag list */}
        <div className="rounded-md border-[0.5px] border-line bg-surface p-3">
          <div className="mb-1.5 text-t11 font-semibold text-ink">
            Snag List <span className="text-t10 font-normal text-faint">({h.snagList.length})</span>
          </div>
          {h.snagList.length === 0 ? (
            <div className="rounded bg-[#F5F4F2] p-3.5 text-center text-t10 text-faint">
              No snags raised yet — QA logs them on the joint walk.
            </div>
          ) : (
            h.snagList.map((s) => {
              const meta = SNAG_META[s.status];
              return (
                <div key={s.id} className="border-b-[0.5px] border-line py-1.5 text-t10 last:border-none">
                  <div className="flex items-start gap-1.5">
                    <span className={`pill ${meta.pill}`} style={{ fontSize: 8.5, whiteSpace: "nowrap" }}>
                      {meta.label}
                    </span>
                    <div className="flex-1">
                      <div className="text-ink">{s.desc}</div>
                      {s.area && (
                        <div className="text-t9 text-faint">
                          {s.area}
                          {s.lineCode ? ` · ${s.lineCode}` : ""}
                        </div>
                      )}
                      {s.evidence && (
                        <div className="text-t9" style={{ color: "#185FA5" }}>
                          📎 {s.evidence}
                        </div>
                      )}
                    </div>
                    <span
                      className="whitespace-nowrap text-[8.5px]"
                      style={{ color: s.status === "open" ? "#854F0B" : s.status === "rectified" ? "#185FA5" : "#3B6D11" }}
                    >
                      {s.status === "open" ? "with Ops" : s.status === "rectified" ? "awaiting QA" : "✓ verified"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* As-builts */}
        <div className="rounded-md border-[0.5px] border-line bg-surface p-3">
          <div className="mb-1.5 text-t11 font-semibold text-ink">
            As-built Drawings <span className="text-t10 font-normal text-faint">({h.asBuilts.length})</span>
          </div>
          {h.asBuilts.length === 0 ? (
            <div className="rounded bg-[#F5F4F2] p-3.5 text-center text-t10 text-faint">As-builts compiled at FAC stage</div>
          ) : (
            <ul className="list-disc pl-5 text-t10">
              {h.asBuilts.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-md border-[0.5px] border-line bg-[#FBF9F6] p-3 text-t10 leading-relaxed text-muted">
        <strong className="text-ink">Once handover is initiated</strong> (typically post structural erection + cladding
        completion, ~Day 95 for Oragadam): snag walk with client → defects logged → rectification with photo evidence →
        FAC sign-off triggers project closure. DLP (Defect Liability Period, usually 12 months) begins post-FAC.
        {h.projectedCompletion ? ` Ops forecast finish: ${h.projectedCompletion}.` : ""}
      </div>
    </div>
  );
}
