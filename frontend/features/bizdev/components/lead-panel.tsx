"use client";

import { useState, type ReactNode } from "react";
import { IconFileText } from "@tabler/icons-react";
import type { BdStage, LeadView } from "@/features/bizdev/types";
import { TechTag, TypePill, HeatPill } from "./tags";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b-[0.5px] border-line-soft py-1.5 text-t11 last:border-b-0">
      <span className="text-t10 text-faint">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}

const BTN = "rounded-md border-[0.5px] px-3 py-1.5 text-t10 font-medium disabled:opacity-50";
const PRIMARY = `${BTN} border-accent bg-accent text-white`;
const BACK = `${BTN} border-[#E8B86D] bg-[#FFF8EC] text-warn`;
const DANGER = `${BTN} border-input bg-surface text-danger`;

/** The lifecycle actions available on a lead, faithful to `openLP`'s stage buttons. */
function StageActions({ lead, onMove }: { lead: LeadView; onMove: (toStage: string) => Promise<void> | void }) {
  const [busy, setBusy] = useState(false);
  const go = async (s: string) => {
    setBusy(true);
    try {
      await onMove(s);
    } finally {
      setBusy(false);
    }
  };

  let actions: ReactNode = null;
  if (lead.status === "enquiry") {
    actions = (
      <button type="button" disabled={busy} className={PRIMARY + " w-full"} onClick={() => go("costing")}>
        → Convert to Deal
      </button>
    );
  } else if (lead.status === "costing") {
    if (lead.type === "B2G") {
      actions = <div className="rounded-md border-[0.5px] border-[#E0C8EA] bg-[#F3E9F5] px-3 py-2 text-t10 leading-relaxed text-[#7B1FA2]">B2G tender — costing is available to Contracts. Stage transitions are driven from Contracts, not here.</div>;
    } else if (lead.costingReceived) {
      actions = (
        <button type="button" disabled={busy} className={PRIMARY + " w-full"} onClick={() => go("proposal")}>
          📄 Generate Quote → Proposal
        </button>
      );
    } else {
      actions = <div className="rounded-md border-[0.5px] border-line bg-canvas px-3 py-2 text-t10 text-faint">📋 Requested for costing — awaiting Estimation. Due: {lead.dl || "Not set"}</div>;
    }
  } else if (lead.status === "proposal") {
    actions = lead.type === "B2G" ? (
      <div className="rounded-md border-[0.5px] border-[#E0C8EA] bg-[#F3E9F5] px-3 py-2 text-t10 text-[#7B1FA2]">B2G tender — stage moves are driven by Contracts (submission / award).</div>
    ) : (
      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={busy} className={PRIMARY} onClick={() => go("negotiation")}>Move to Negotiation →</button>
        <button type="button" disabled={busy} className={BACK} onClick={() => go("costing")}>← Back to Costing</button>
      </div>
    );
  } else if (lead.status === "negotiation") {
    actions = (
      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={busy} className={PRIMARY} onClick={() => go("won")}>Mark Won 🎉</button>
        <button type="button" disabled={busy} className={DANGER} onClick={() => go("lost")}>Mark Lost</button>
        <button type="button" disabled={busy} className={BACK} onClick={() => go("proposal")}>← Back to Proposal</button>
        <button type="button" disabled={busy} className={BACK} onClick={() => go("costing")}>← Back to Costing</button>
      </div>
    );
  } else {
    actions = <div className="rounded-md border-[0.5px] border-line bg-canvas px-3 py-2 text-t10 text-muted">Deal closed — {lead.status === "won" ? "Won 🎉 (project created)" : lead.status === "lost" ? "Lost" : "Not participated"}.</div>;
  }

  return (
    <div className="mb-3 rounded-lg border-[0.5px] border-line bg-subtle p-3">
      <div className="mb-2 text-t9 font-medium uppercase tracking-[0.8px] text-faint">Stage action</div>
      {actions}
    </div>
  );
}

/** Lead detail slide-over (`openLP`). */
export function LeadPanel({
  lead,
  stages,
  onMove,
}: {
  lead: LeadView;
  stages: BdStage[];
  onMove?: (toStage: string) => Promise<void> | void;
}) {
  const stageLabel = (id: string) => stages.find((s) => s.id === id)?.label ?? id;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {lead.tech.map((t) => (
          <TechTag key={t} tech={t} />
        ))}
        <TypePill kind={lead.type} />
        <HeatPill heat={lead.lt} />
      </div>

      <div className="mb-3 text-t11 text-muted">{lead.desc}</div>

      {onMove && <StageActions lead={lead} onMove={onMove} />}

      <div className="mb-1 border-t-[0.5px] border-line pt-3 text-t9 font-medium uppercase tracking-[0.8px] text-faint">Details</div>
      <Row label="Company / Project" value={lead.co} />
      <Row label="Estimated value" value={lead.ev ? `₹${(lead.ev / 100000).toFixed(1)}L` : "—"} />
      <Row label="Area" value={`${lead.area.toLocaleString("en-IN")} sqft`} />
      <Row label="Chance" value={`${lead.ch}%`} />
      <Row label="Owner" value={lead.owner} />
      <Row label="Source" value={lead.src} />
      <Row label="Enquiry date" value={lead.date} />
      {lead.dl && <Row label="Deadline" value={lead.dl} />}
      {lead.tr && <Row label="Tender ref" value={<span className="font-mono text-t10">{lead.tr}</span>} />}

      {lead.docs.length > 0 && (
        <>
          <div className="mb-1 mt-3 border-t-[0.5px] border-line pt-3 text-t9 font-medium uppercase tracking-[0.8px] text-faint">Documents</div>
          <div className="space-y-1">
            {lead.docs.map((d) => (
              <div key={d} className="flex items-center gap-2 rounded-md border-[0.5px] border-line bg-surface px-2.5 py-1.5 text-t10 text-ink-soft">
                <IconFileText size={12} className="text-warn" />
                {d}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mb-1 mt-3 border-t-[0.5px] border-line pt-3 text-t9 font-medium uppercase tracking-[0.8px] text-faint">Stage history</div>
      <div className="relative ml-1.5 border-l-[1.5px] border-line pl-4">
        {lead.stageHistory.map((h, i) => (
          <div key={i} className="relative mb-2.5 last:mb-0">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full" style={{ background: i === lead.stageHistory.length - 1 ? "#C84B2F" : "#C0BEBA" }} />
            <div className="text-t11 font-medium text-ink">{stageLabel(h.stage)}</div>
            <div className="text-t9 text-faint">entered {h.enteredAt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
