"use client";

import type { EstSubProjectWf } from "@/features/estimation/types";

function Pill({ text, color, bg }: { text: string; color: string; bg: string }) {
  return <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 10, fontSize: 9, fontWeight: 600, color, background: bg }}>{text}</span>;
}

/**
 * Approval Workflow tab (`renderEstimationWorkflow`) — the Maker → Checker →
 * Approver → BD sign-off chain for a sub-project's costing. Controlled: the `wf`
 * state and mutations are owned by the Estimation page so Submit-for-Review (in
 * the Costing Sheet) and the Overview consolidation share the same source.
 */
export function EstWorkflowTab({
  wf,
  onSubmitTrade,
  onCheckerApprove,
  onApproverApprove,
}: {
  wf: EstSubProjectWf;
  onSubmitTrade: (tradeId: string) => void;
  onCheckerApprove: () => void;
  onApproverApprove: () => void;
}) {
  const submitTrade = onSubmitTrade;
  const checkerApprove = onCheckerApprove;
  const approverApprove = onApproverApprove;

  const allSubmitted = wf.trades.every((t) => t.status === "submitted");
  const anySubmitted = wf.trades.some((t) => t.status === "submitted");
  const checkerDone = wf.checkerStatus === "approved";
  const approverDone = wf.approverStatus === "approved";
  const submittedCount = wf.trades.filter((t) => t.status === "submitted").length;

  const nodes = [
    {
      role: "Maker",
      person: wf.trades.map((t) => t.assignee || "Unassigned").join(", "),
      status: allSubmitted ? "All submitted" : anySubmitted ? "Partial submitted" : "In progress",
      state: allSubmitted ? "done" : "active",
    },
    {
      role: "Checker",
      person: wf.checker || "Not assigned",
      status: checkerDone ? "Approved" : anySubmitted ? "Pending review" : "Waiting for makers",
      state: checkerDone ? "done" : anySubmitted ? "active" : "pending",
    },
    {
      role: "Approver",
      person: wf.approver || "Not assigned",
      status: approverDone ? "Approved" : checkerDone ? "Pending approval" : "Waiting",
      state: approverDone ? "done" : checkerDone ? "active" : "pending",
    },
  ];

  return (
    <div>
      <div className="wf-tracker">
        {nodes.map((n, i) => (
          <div key={n.role} className={`wf-node ${n.state}`}>
            <div className="wf-node-role">{n.role}</div>
            <div className="wf-node-person">{n.person}</div>
            <div className="wf-node-status">{n.state === "done" ? "✓ " : n.state === "active" ? "→ " : "○ "}{n.status}</div>
            {i < nodes.length - 1 && <div className="wf-arr-overlay">›</div>}
          </div>
        ))}
      </div>

      {anySubmitted && !checkerDone && (
        <div style={{ padding: "10px 12px", background: "#E6F1FB", borderRadius: 8, margin: "10px 0", border: "0.5px solid #B8D4F0" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#185FA5", marginBottom: 4 }}>⏳ Checker action needed — {wf.checker}</div>
          <div style={{ fontSize: 10, color: "#6B6A68", marginBottom: 8 }}>{submittedCount} of {wf.trades.length} trades submitted for review.</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="tbb p" style={{ fontSize: 10 }} onClick={checkerApprove}>Approve &amp; Forward to Approver →</button>
            <button type="button" className="tbb" style={{ fontSize: 10 }}>Request Revision</button>
          </div>
        </div>
      )}

      {checkerDone && !approverDone && (
        <div style={{ padding: "10px 12px", background: "#F3E8FB", borderRadius: 8, margin: "10px 0", border: "0.5px solid #D8B4F0" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#7B1FA2", marginBottom: 4 }}>⏳ Final Approval needed — {wf.approver}</div>
          <div style={{ fontSize: 10, color: "#6B6A68", marginBottom: 8 }}>Checker has approved. Final sign-off marks this sub-project as Submitted. Once all sub-projects are Submitted, Estimation Head can Consolidate &amp; send to BD.</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="tbb p" style={{ fontSize: 10 }} onClick={approverApprove}>Final Approve ✓</button>
            <button type="button" className="tbb" style={{ fontSize: 10 }}>Send Back for Revision</button>
          </div>
        </div>
      )}

      {approverDone && (
        <div style={{ padding: "10px 12px", background: "#EAF3DE", borderRadius: 8, margin: "10px 0", border: "0.5px solid #C0DD97" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3B6D11", marginBottom: 4 }}>✓ Sub-project Submitted</div>
          <div style={{ fontSize: 10, color: "#6B6A68" }}>This sub-project is locked. Return to Overview to check all sub-projects and Consolidate when all are Submitted.</div>
        </div>
      )}

      <div style={{ fontSize: 11, fontWeight: 600, color: "#1A1917", margin: "10px 0 8px" }}>Trade Submissions</div>
      {wf.trades.map((t) => {
        const cls = t.status === "submitted" ? "submitted" : t.status === "in_progress" ? "in-progress" : "pending";
        const pill =
          t.status === "submitted" ? <Pill text="Submitted ✓" color="#3B6D11" bg="#EAF3DE" /> :
          t.status === "in_progress" ? <Pill text="In Progress" color="#854F0B" bg="#FAEEDA" /> :
          <Pill text="Pending" color="#6B6A68" bg="#F0EFED" />;
        return (
          <div key={t.id} className={`trade-card ${cls}`}>
            <div className="trade-hdr">
              <div>
                <div className="trade-name">{t.name}</div>
                <div className="trade-assignee">Assigned to: <strong>{t.assignee || "Not yet assigned"}</strong>{t.submittedOn ? ` · Submitted: ${t.submittedOn}` : ""}</div>
              </div>
              {pill}
            </div>
            {t.sections.length > 0 && <div style={{ fontSize: 9, color: "#9B9894" }}>Sections: {t.sections.join(", ")}</div>}
            <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
              {t.status !== "submitted" ? (
                <button type="button" className="tbb p" style={{ fontSize: 9 }} onClick={() => submitTrade(t.id)}>Submit for Review →</button>
              ) : (
                <Pill text="Review submitted ✓" color="#3B6D11" bg="#EAF3DE" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
