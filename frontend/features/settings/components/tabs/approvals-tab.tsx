"use client";

import { Button } from "@/components/ui/button";
import type { SetApproval, SetRole } from "@/features/settings/types";

const MODULE_META: Record<string, { color: string; bg: string; label: string }> = {
  procurement: { color: "#854F0B", bg: "#FAEEDA", label: "Procurement" },
  engineering: { color: "#185FA5", bg: "#E6F1FB", label: "Engineering" },
  billing: { color: "#0F766E", bg: "#D9F2EF", label: "Billing" },
  finance: { color: "#5C2E91", bg: "#F0EBF9", label: "Finance" },
  estimation: { color: "#3B6D11", bg: "#EAF3DE", label: "Estimation" },
  ops: { color: "#C84B2F", bg: "#FAE9E4", label: "Operations" },
  qaqc: { color: "#0F766E", bg: "#D9F2EF", label: "QA/QC" },
};
const ROW = "60px 1fr 1.2fr 110px 1fr 30px";

export function ApprovalsTab({ approvals, roles }: { approvals: SetApproval[]; roles: SetRole[] }) {
  const byModule = new Map<string, SetApproval[]>();
  approvals.forEach((a) => (byModule.get(a.module) ?? byModule.set(a.module, []).get(a.module)!).push(a));

  return (
    <>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-t11 text-muted"><strong>{approvals.length}</strong> approval rules across <strong>{byModule.size}</strong> modules</div>
        <div className="flex gap-1.5">
          <Button variant="default" size="sm">↓ Export Rules</Button>
          <Button variant="primary" size="sm">+ New Approval Rule</Button>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {[...byModule.entries()].map(([mod, rules]) => {
          const meta = MODULE_META[mod] ?? { color: "#9B9894", bg: "#F5F4F2", label: mod };
          return (
            <div key={mod} className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3">
              <div className="mb-2.5 flex items-center gap-2 border-b-[0.5px] border-[#F0EFEB] pb-2">
                <span className="rounded px-2 py-[3px] text-t10 font-semibold" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                <span className="text-t10 text-faint">{rules.length} rule{rules.length > 1 ? "s" : ""}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {rules.map((rule) => {
                  const names = rule.approvers.map((rid) => roles.find((x) => x.id === rid)?.name ?? rid);
                  return (
                    <div key={rule.id} className="grid items-center gap-2.5 rounded bg-[#FBF9F6] px-2.5 py-2" style={{ gridTemplateColumns: ROW }}>
                      <span className="font-mono text-t10 font-medium text-ink">{rule.id}</span>
                      <span className="text-t11 text-ink">{rule.trigger}</span>
                      <span className="text-t10 text-ink-soft">
                        <span className="text-t9 uppercase tracking-[0.5px] text-faint">Approvers</span><br />
                        {names.map((n, i) => <span key={i} className="mr-[3px] inline-block rounded border-[0.5px] border-input bg-white px-1.5 py-px text-t9">{i > 0 ? "→ " : ""}{n}</span>)}
                      </span>
                      <span className="text-t10 text-muted"><span className="text-t9 uppercase tracking-[0.5px] text-faint">SLA</span><br />{rule.slaHrs}h</span>
                      <span className="text-t10 text-muted"><span className="text-t9 uppercase tracking-[0.5px] text-faint">Escalation</span><br />{rule.escalation || "none"}</span>
                      <span className="cursor-pointer text-center text-t14 text-faint">⋯</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3 py-2 text-t10 text-muted">
        <strong>How approvals work:</strong> When a trigger condition is met, MOD OS auto-routes to the listed approvers in sequence. Approvers get notified via Gmail + WhatsApp + in-app. SLA timer starts on routing; items escalate per rule. Audit trail recorded for every approval.
      </div>
    </>
  );
}
