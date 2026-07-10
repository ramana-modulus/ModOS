"use client";

import type { ScopeParams, WorkflowItem } from "@/features/procurement/api/types";
import { procurementApi } from "@/features/procurement/api/client";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { Pill } from "@/components/ui/badge";
import { CatBanner } from "@/features/procurement/components/cat-banner";
import { fmtC, fmtQ } from "@/lib/format";

const AVATAR_COLORS = ["#185FA5", "#854F0B", "#3B6D11", "#7B1FA2", "#A32D2D", "#0F766E", "#C84B2F"];
const avatarColor = (name: string) => AVATAR_COLORS[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % AVATAR_COLORS.length]!;

const CHIP: Record<string, { bg: string; fg: string; icon: string }> = {
  approved: { bg: "#EAF3DE", fg: "#3B6D11", icon: "✓" },
  in_progress: { bg: "#FAEEDA", fg: "#854F0B", icon: "→" },
  pending: { bg: "#F5F4F2", fg: "#9B9894", icon: "○" },
  sent: { bg: "#EAF3DE", fg: "#3B6D11", icon: "✓" },
  acknowledged: { bg: "#EAF3DE", fg: "#3B6D11", icon: "✓" },
  partial: { bg: "#FAEEDA", fg: "#854F0B", icon: "◐" },
};
function Chip({ label, st }: { label: string; st: string }) {
  const m = CHIP[st] ?? CHIP.pending!;
  return <span className="rounded-[10px] px-2 py-0.5 text-t9 font-medium" style={{ background: m.bg, color: m.fg }}>{m.icon} {label}</span>;
}
const Arrow = () => <span className="text-[#D8D7D4]">→</span>;

function valueDisplay(v: number) {
  if (v <= 0) return "—";
  return "₹" + (v >= 100000 ? (v / 100000).toFixed(2) + "L" : fmtC(Math.round(v / 1000)) + "K");
}

function ItemCard({ i }: { i: WorkflowItem }) {
  const cls = i.wf.poStatus === "sent" ? "submitted" : i.wf.csStatus === "in_progress" || i.wf.leadStatus === "approved" ? "in-progress" : "pending";
  return (
    <div className={`trade-card ${cls}`}>
      <div className="trade-hdr">
        <div className="flex-1">
          <div className="trade-name flex items-center gap-2">
            <span className="font-mono text-t11 text-warn">{i.code}</span>
            <span>{i.name}</span>
          </div>
          <div className="trade-assignee">
            {fmtQ(i.qty)} {i.uom} · <strong className="text-ink">{valueDisplay(i.value)}</strong> · Approver: <strong className="text-ink">{i.approverName}</strong>{" "}
            <span className="text-faint">({i.thresholdLabel})</span>
            {i.vendor ? <> · Vendor: <strong>{i.vendor}</strong></> : ""}
          </div>
        </div>
        {i.poNumber ? <Pill cls="pg">{i.poNumber}</Pill> : <Pill cls="pgr">No PO yet</Pill>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip label={`CS ${i.wf.csStatus === "approved" ? "prepared" : i.wf.csStatus === "in_progress" ? "drafting" : "pending"}`} st={i.wf.csStatus} />
        <Arrow />
        <Chip label={`Lead ${i.wf.leadStatus === "approved" ? "reviewed" : "pending"}`} st={i.wf.leadStatus} />
        <Arrow />
        <Chip label={`${i.approverName} ${i.wf.approverStatus === "approved" ? "approved" : "pending"}`} st={i.wf.approverStatus} />
        <Arrow />
        <Chip label={`PO ${i.wf.poStatus === "sent" ? "sent" : "pending"}`} st={i.wf.poStatus} />
        <Arrow />
        <Chip label={`Vendor ${i.wf.vendorAckStatus === "acknowledged" ? "ack" : i.wf.vendorAckStatus === "partial" ? "partial" : "pending"}`} st={i.wf.vendorAckStatus} />
      </div>
    </div>
  );
}

const PROMPT_STYLE = {
  lead: { bg: "#E6F1FB", border: "#B8D4F0", fg: "#185FA5" },
  manager: { bg: "#FBF9F6", border: "#E5E4E0", fg: "#1A1917" },
  coo: { bg: "#F3E8FB", border: "#D8B4F0", fg: "#7B1FA2" },
  ceo: { bg: "#FCEBEB", border: "#F0BFBF", fg: "#A32D2D" },
} as const;

export function WorkflowTab({ scope }: { scope: ScopeParams }) {
  const { data, loading, error } = useQuery(() => procurementApi.getWorkflow(scope), [scope.project, scope.subProject]);
  if (loading || !data) return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading workflow…"}</div>;

  const { nodes, matrix, prompts, groups, leadName } = data;

  return (
    <div>
      {/* Tracker */}
      <div className="wf-tracker">
        {nodes.map((n, i) => (
          <div key={i} className={`wf-node ${n.state}`}>
            <div className="wf-node-role">{n.role}</div>
            <div className="wf-node-person">{n.person}</div>
            <div className="wf-node-status">{n.state === "done" ? "✓ " : n.state === "active" ? "→ " : "○ "}{n.status}</div>
            {i < nodes.length - 1 && <div className="wf-arr-overlay">›</div>}
          </div>
        ))}
      </div>

      {/* Approval matrix */}
      <div className="mb-3 rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface px-3.5 py-2.5">
        <div className="mb-2 text-t11 font-semibold text-ink">Value-Based Approval Matrix</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {matrix.map((a) => (
            <div key={a.roleKey} className="rounded-md border-[0.5px] border-line bg-subtle px-2.5 py-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-t9 font-semibold text-white" style={{ background: avatarColor(a.name) }}>{a.initials}</div>
                <div>
                  <div className="text-t11 font-semibold text-ink">{a.name}</div>
                  <div className="text-t9 text-faint">{a.role}</div>
                </div>
              </div>
              <div className="mt-1.5 text-t9 text-muted">Threshold: <strong>{a.thresholdLabel}</strong></div>
              <div className="mt-0.5 text-t11 font-medium" style={{ color: a.approved === a.count && a.count > 0 ? "#3B6D11" : "#854F0B" }}>{a.approved}/{a.count} approved</div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompts */}
      {prompts.lead.length > 0 && (
        <div className="mb-2.5 rounded-lg border-[0.5px] px-3 py-2.5" style={{ background: PROMPT_STYLE.lead.bg, borderColor: PROMPT_STYLE.lead.border }}>
          <div className="mb-1 text-t11 font-semibold" style={{ color: PROMPT_STYLE.lead.fg }}>⏳ Procurement Lead action — {leadName}</div>
          <div className="text-t10 text-muted">{prompts.lead.length} Comparative Statement(s) awaiting review: {prompts.lead.join(", ")}</div>
        </div>
      )}
      {(["manager", "coo", "ceo"] as const).map((role) => {
        const list = prompts[role];
        if (list.length === 0) return null;
        const s = PROMPT_STYLE[role];
        const m = matrix.find((x) => x.roleKey === role);
        return (
          <div key={role} className="mb-2.5 rounded-lg border-[0.5px] px-3 py-2.5" style={{ background: s.bg, borderColor: s.border }}>
            <div className="mb-1 text-t11 font-semibold" style={{ color: s.fg }}>⏳ Approval needed — {m?.name} ({m?.role} · {m?.thresholdLabel})</div>
            <div className="text-t10 text-muted">{list.length} item(s) awaiting approval{role !== "manager" ? "" : `: ${list.join(", ")}`}</div>
          </div>
        );
      })}

      {/* Per-item cards */}
      <div className="mb-2 mt-3.5 text-t11 font-semibold text-ink">Per-Item Approval Status</div>
      {groups.map((g) => (
        <div key={g.cat}>
          <CatBanner cat={g.cat} count={g.items.length} noun="item" />
          {g.items.map((i) => <ItemCard key={i.code} i={i} />)}
        </div>
      ))}
    </div>
  );
}
