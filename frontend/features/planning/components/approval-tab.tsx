"use client";

import type { ApprovalView } from "@/features/planning/types";

/**
 * WBS Approval tab — Maker → COO → CEO → Client tracker + stage action card +
 * approval history. Faithful (read-only) port of renderPlanningApproval (~19940).
 */
export function ApprovalTab({ approval }: { approval: ApprovalView }) {
  const { nodes, status, fullyScheduled, planner, cooName, ceoName, subProjectName } = approval;

  return (
    <div className="max-w-[780px]">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-t12 font-semibold text-ink">WBS Approval — {subProjectName}</div>
        <div className="text-t10 text-faint">Maker → COO → CEO → Client</div>
      </div>

      {/* 4-node tracker */}
      <div className="wf-tracker">
        {nodes.map((n, i) => (
          <div key={n.role} className={`wf-node ${n.state}`}>
            <div className="wf-node-role">{n.role}</div>
            <div className="wf-node-person">{n.person}</div>
            <div className="wf-node-status">{n.status}</div>
            {i < nodes.length - 1 && <div className="wf-arr-overlay">›</div>}
          </div>
        ))}
      </div>

      {/* Stage action card (read-only: current demo state is Draft) */}
      {status === "draft" &&
        (!fullyScheduled ? (
          <div className="mb-3.5 rounded-lg border-[0.5px] border-line bg-canvas p-3.5">
            <div className="mb-0.5 text-t12 font-medium text-muted">
              <i className="ti ti-progress align-[-2px]" style={{ color: "#854F0B" }} /> WBS not yet complete
            </div>
            <div className="text-t10 text-faint">
              Finish scheduling every line item across its required departments, then {planner} can lock &amp; send the
              WBS for approval from the <strong>Work Breakdown</strong> tab.
            </div>
          </div>
        ) : (
          <div className="mb-3.5 flex items-center justify-between gap-3 rounded-lg border-[0.5px] border-accent bg-accent-soft p-3.5">
            <div>
              <div className="mb-0.5 text-t12 font-medium text-ink">WBS ready for approval</div>
              <div className="text-t10 text-muted">
                All items scheduled. Lock the baseline and route to {cooName} (COO) → {ceoName} (CEO).
              </div>
            </div>
          </div>
        ))}

      {/* Approval history */}
      <div className="mb-2 mt-3.5 text-t10 uppercase tracking-[0.6px] text-faint">Approval History</div>
      {approval.history.length === 0 ? (
        <div
          className="rounded-md px-3.5 py-3.5 text-center text-t11 text-faint"
          style={{ background: "#F5F4F2" }}
        >
          No approval activity yet
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {approval.history
            .slice()
            .reverse()
            .map((h, i) => {
              const dot =
                { submitted: "#854F0B", approved: "#3B6D11", rejected: "#A32D2D", reopened: "#6B6A68" }[h.status] ??
                "#9B9894";
              return (
                <div key={i} className="flex gap-2.5 rounded-md border-[0.5px] border-line bg-surface px-3 py-2.5">
                  <div className="mt-[5px] h-2 w-2 flex-shrink-0 rounded-full" style={{ background: dot }} />
                  <div className="flex-1">
                    <div className="mb-0.5 flex items-baseline gap-2">
                      <span className="text-t11 font-semibold text-ink">{h.stage}</span>
                      <span className="text-t10 capitalize" style={{ color: dot }}>
                        {h.status}
                      </span>
                      <span className="text-t10 text-faint">{h.by}</span>
                      <span className="ml-auto text-t10 text-faint">{h.at}</span>
                    </div>
                    <div className="text-t10 leading-[1.5] text-muted">{h.note}</div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
