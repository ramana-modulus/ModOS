"use client";

import { fmtQ } from "@/lib/format";
import type { ScEnquiryCard, ScEnquiriesView } from "@/features/subcontracts/api";
import { CatBanner, Code, TypePill } from "../ui-bits";

const INVITE_CFG: Record<string, { bg: string; fg: string; icon: string }> = {
  responded: { bg: "#EAF3DE", fg: "#3B6D11", icon: "✓" },
  pending: { bg: "#FAEEDA", fg: "#854F0B", icon: "⏳" },
  declined: { bg: "#FCEBEB", fg: "#A32D2D", icon: "✗" },
  no_response: { bg: "#F5F4F2", fg: "#9B9894", icon: "—" },
};

function Card({ c }: { c: ScEnquiryCard }) {
  return (
    <div
      className="mb-2 rounded-md bg-surface p-3.5"
      style={{ border: `0.5px solid ${c.isOpen ? "#0F766E" : "#E5E4E0"}`, borderLeft: `3px solid ${c.isOpen ? "#0F766E" : "#9B9894"}` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-t11 font-semibold text-ink">{c.enqId}</span>
          {c.isOpen ? (
            <span className="rounded-lg px-1.5 py-0.5 text-t9 font-semibold" style={{ background: "#E6F5F3", color: "#0F766E" }}>
              ⏳ OPEN
            </span>
          ) : (
            <span className="rounded-lg px-1.5 py-0.5 text-t9 font-medium" style={{ background: "#F5F4F2", color: "#6B6A68" }}>
              CLOSED
            </span>
          )}
          <Code>{c.code}</Code>
          <span className="text-t11 text-ink">{c.name}</span>
          <TypePill scType={c.scType} matNature={c.matNature} />
        </div>
        <div className="text-t10 text-muted">
          {fmtQ(c.totalQty)} {c.uom}
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-3.5 text-t10 text-muted">
        <div>
          <i className="ti ti-user" style={{ verticalAlign: -2 }} /> Floated by <strong className="text-ink">{c.floatedBy}</strong> on {c.floatedAt}
        </div>
        {c.isOpen ? (
          <div>
            <i className="ti ti-clock" style={{ verticalAlign: -2, color: "#0F766E" }} /> Deadline: <strong style={{ color: "#0F766E" }}>{c.deadline}</strong>
          </div>
        ) : (
          <div>
            <i className="ti ti-check" style={{ verticalAlign: -2, color: "#3B6D11" }} /> Closed: {c.closedAt} — {c.closedReason}
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="mb-1 text-t9 font-medium uppercase tracking-[0.4px] text-faint">Response Status ({c.invited.length} invited)</div>
        <div className="flex flex-wrap gap-2.5 text-t10">
          <span style={{ color: "#3B6D11" }}>
            <strong>{c.counts.responded}</strong> responded
          </span>
          {c.counts.pending > 0 && (
            <span style={{ color: "#854F0B" }}>
              <strong>{c.counts.pending}</strong> pending
            </span>
          )}
          {c.counts.declined > 0 && (
            <span style={{ color: "#A32D2D" }}>
              <strong>{c.counts.declined}</strong> declined
            </span>
          )}
          {c.counts.noResp > 0 && (
            <span className="text-faint">
              <strong>{c.counts.noResp}</strong> no response
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {c.invited.map((v) => {
          const cfg = INVITE_CFG[v.status] ?? INVITE_CFG.no_response!;
          return (
            <div key={v.code} className="flex min-w-[130px] flex-col gap-px rounded-md px-2.5 py-1.5 text-t10" style={{ background: cfg.bg }}>
              <div className="font-medium" style={{ color: cfg.fg }}>
                {cfg.icon} {v.name}
              </div>
              <div className="text-t9 text-muted">{v.detail}</div>
            </div>
          );
        })}
      </div>

      {c.notes && <div className="mt-2 rounded bg-[#FBF9F6] px-2.5 py-1.5 text-t10 italic text-muted">{c.notes}</div>}
    </div>
  );
}

function groupByCat(cards: ScEnquiryCard[]) {
  const order: string[] = [];
  const grp: Record<string, ScEnquiryCard[]> = {};
  for (const c of cards) {
    if (!order.includes(c.catId)) order.push(c.catId);
    (grp[c.catId] ??= []).push(c);
  }
  return order.map((catId) => ({ catId, label: grp[catId]![0]!.cat, cards: grp[catId]! }));
}

export function EnquiriesTab({ data }: { data: ScEnquiriesView }) {
  const openGroups = groupByCat(data.open);
  const closedGroups = groupByCat(data.closed);

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-3 rounded-md px-3 py-2.5" style={{ background: "#E6F5F3", border: "0.5px solid #0F766E" }}>
        <i className="ti ti-mail-fast" style={{ fontSize: 20, color: "#0F766E" }} />
        <div className="flex-1">
          <div className="text-t12 font-semibold" style={{ color: "#0F766E" }}>
            Works Enquiry Workflow
          </div>
          <div className="text-t10 text-muted">
            Float enquiry → invite subcontractors → record quotes → compare &amp; set L1. {data.open.length} open · {data.closed.length} closed.
          </div>
        </div>
      </div>

      {data.needAction.length > 0 && (
        <div className="mb-2.5 rounded-md px-3 py-2.5" style={{ background: "#FAEEDA", border: "0.5px solid #854F0B" }}>
          <div className="mb-1.5 text-t11 font-semibold" style={{ color: "#854F0B" }}>
            <i className="ti ti-alert-triangle" style={{ verticalAlign: -2 }} /> {data.needAction.length} package
            {data.needAction.length > 1 ? "s have" : " has"} no enquiry floated — action needed
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.needAction.map((p) => (
              <span
                key={p.code}
                className="rounded-[14px] bg-surface px-2.5 py-1 text-t10"
                style={{ border: "0.5px dashed #854F0B", color: "#854F0B" }}
              >
                <strong className="font-mono">{p.code}</strong> <span className="text-muted">{p.name.slice(0, 26)}{p.name.length > 26 ? "…" : ""}</span> ·{" "}
                <span className="text-ink">
                  {fmtQ(p.totalQty)} {p.uom}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {data.open.length > 0 && (
        <>
          <div className="mb-2 text-t11 font-semibold uppercase tracking-[0.4px]" style={{ color: "#0F766E" }}>
            <i className="ti ti-clock-play" style={{ verticalAlign: -2 }} /> Open Enquiries ({data.open.length})
          </div>
          {openGroups.map((g) => (
            <div key={g.catId}>
              <CatBanner label={g.label} count={g.cards.length} noun="enquiry" />
              {g.cards.map((c) => (
                <Card key={c.key} c={c} />
              ))}
            </div>
          ))}
        </>
      )}

      {data.closed.length > 0 && (
        <>
          <div className="mb-2 mt-3.5 text-t11 font-semibold uppercase tracking-[0.4px] text-muted">
            <i className="ti ti-archive" style={{ verticalAlign: -2 }} /> Closed Enquiries ({data.closed.length})
          </div>
          {closedGroups.map((g) => (
            <div key={g.catId}>
              <CatBanner label={g.label} count={g.cards.length} noun="enquiry" />
              {g.cards.map((c) => (
                <Card key={c.key} c={c} />
              ))}
            </div>
          ))}
        </>
      )}

      {data.open.length === 0 && data.closed.length === 0 && (
        <div className="rounded-lg bg-[#F5F4F2] p-8 text-center text-t11 text-faint">No enquiries floated yet for this sub-project.</div>
      )}
    </div>
  );
}
