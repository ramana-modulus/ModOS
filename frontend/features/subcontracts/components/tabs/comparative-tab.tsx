"use client";

import { useState } from "react";
import { fmtC, fmtQ } from "@/lib/format";
import type { ScComparativeItem, ScComparativeView, ScQuoteCard } from "@/features/subcontracts/api";
import { Chip, Code, TypePill } from "../ui-bits";

function QuoteCard({ q, uom, wo }: { q: ScQuoteCard; uom: string; wo: ScComparativeItem["wo"] }) {
  const vCol = q.variancePct <= 0 ? ["#EAF3DE", "#3B6D11"] : Math.abs(q.variancePct) < 12 ? ["#FEF6E7", "#854F0B"] : ["#FCEBEB", "#A32D2D"];
  return (
    <div
      className="relative rounded-md p-3"
      style={{
        border: `0.5px solid ${q.selected ? "#0F766E" : q.isL1 ? "#3B6D11" : "#E5E4E0"}`,
        background: q.selected ? "#F0FAF8" : "#fff",
      }}
    >
      {q.selected && (
        <div className="absolute right-2 top-2">
          <span className="pill" style={{ background: "#0F766E", color: "#fff", padding: "3px 8px", fontSize: 9 }}>
            ✓ Selected
          </span>
        </div>
      )}
      <div className="mb-1 text-t9 font-semibold tracking-[0.5px] text-faint">
        L{q.rank} {q.isL1 ? "· LOWEST" : ""}
      </div>
      <div className="mb-0.5 text-t12 font-semibold text-ink">
        {q.subbieName}
        {q.subbieStatus === "onboarding" && (
          <span className="pill ml-1" style={{ background: "#FEF6E7", color: "#854F0B", fontSize: 8 }}>
            new
          </span>
        )}
        {!q.compliant && (
          <span className="pill ml-1" style={{ background: "#FCEBEB", color: "#A32D2D", fontSize: 8 }}>
            compliance
          </span>
        )}
      </div>
      <div className="mb-2 font-mono text-t9 text-faint">{q.subbie}</div>
      <div className="mb-1.5 flex items-baseline gap-1">
        <span className="text-t20 font-semibold text-ink">₹{q.rate}</span>
        <span className="text-t10 text-muted">/ {uom}</span>
      </div>
      <div className="mb-1 text-t10 text-ink-soft">
        <i className="ti ti-clock" style={{ fontSize: 10, verticalAlign: -1 }} /> {q.leadDays} day lead time
      </div>
      {q.payTerms && (
        <div className="mb-1 text-t10 text-ink-soft">
          <i className="ti ti-cash" style={{ fontSize: 10, verticalAlign: -1 }} /> {q.payTerms}
        </div>
      )}
      <div className="mb-1.5 text-t10 text-ink-soft">
        <i className="ti ti-coin" style={{ fontSize: 10, verticalAlign: -1 }} /> Total: ₹{fmtC(q.total)}
      </div>
      <div className="mb-2">
        <span className="pill" style={{ background: vCol[0], color: vCol[1], fontSize: 9 }}>
          {q.variancePct > 0 ? "+" : ""}
          {q.variancePct.toFixed(1)}% vs budget
        </span>
      </div>
      {q.note && <div className="mb-2 text-t9 italic text-muted">{q.note}</div>}
      {q.selected && wo && (
        <div className="rounded p-1.5 text-center text-t10" style={{ background: "#EAF3DE", color: "#3B6D11" }}>
          WO: <strong>{wo.woNo}</strong>
        </div>
      )}
      {q.selected && !wo && (
        <div className="rounded p-1.5 text-center text-t10" style={{ background: "#E6F5F3", color: "#0F766E" }}>
          L1 selected · WO pending
        </div>
      )}
    </div>
  );
}

export function ComparativeTab({ data }: { data: ScComparativeView }) {
  const items = data.items;
  const defaultItem =
    items.find((p) => p.quotes.length > 0 && !p.wo) ?? items.find((p) => p.quotes.length > 0) ?? items[0];
  const [selCode, setSelCode] = useState<string | undefined>(defaultItem?.code);
  const p = items.find((x) => x.code === selCode) ?? defaultItem;

  if (!p) return <div className="p-6 text-t12 text-muted">No subcontract packages for this sub-project.</div>;

  const sorted = p.quotes;

  return (
    <div className="grid items-start gap-3" style={{ gridTemplateColumns: "240px 1fr" }}>
      {/* Sidebar */}
      <div>
        <div className="mb-1.5 px-1 text-t10 font-medium uppercase tracking-[0.6px] text-faint">Packages ({items.length})</div>
        <div className="max-h-[560px] overflow-y-auto rounded-md border-[0.5px] border-line bg-surface">
          {items.map((x) => {
            const active = x.code === p.code;
            return (
              <div
                key={x.code}
                onClick={() => setSelCode(x.code)}
                className="cursor-pointer border-b-[0.5px] border-[#F0EFEB] px-2.5 py-2"
                style={{ background: active ? "#F0FAF8" : "#fff", borderLeft: `2px solid ${active ? "#0F766E" : "transparent"}` }}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <Code>{x.code}</Code>
                  <span className="text-t9 font-semibold" style={{ color: x.sidebarBadge.color }}>
                    {x.sidebarBadge.label}
                  </span>
                </div>
                <div className="mt-0.5 text-t10 leading-tight text-ink-soft">{x.name}</div>
                <div className="mt-0.5 text-t9 text-faint">
                  {fmtQ(x.totalQty)} {x.uom}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main panel */}
      <div className="rounded-lg border-[0.5px] border-line bg-surface p-3.5">
        <div className="mb-3 flex items-start justify-between gap-2.5 border-b-[0.5px] border-[#F0EFEB] pb-2.5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Code>{p.code}</Code>
              <span className="text-t13 font-semibold text-ink">{p.name}</span>
              <TypePill scType={p.scType} matNature={p.matNature} />
            </div>
            <div className="text-t10 text-muted">
              Qty{" "}
              <strong className="text-ink">
                {fmtQ(p.totalQty)} {p.uom}
              </strong>{" "}
              · Budget basis ₹{fmtC(p.basisRate)}/{p.uom} ·{" "}
              {p.scType === "manpower" ? "Labour-only — compare labour rates; MH supplies material." : "Composite — rates include subbie material."}
            </div>
          </div>
        </div>

        {/* Enquiry banner */}
        {p.rfq && p.rfq.isOpen && (
          <div className="mb-3 rounded-md px-3.5 py-3" style={{ background: "#E6F5F3", border: "0.5px solid #0F766E" }}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ti ti-mail-fast" style={{ fontSize: 14, color: "#0F766E" }} />
                <span className="text-t11 font-semibold" style={{ color: "#0F766E" }}>
                  Enquiry open — {p.rfq.enqId}
                </span>
              </div>
              <div className="text-t9 text-muted">
                Deadline: <strong>{p.rfq.deadline}</strong> · Floated by {p.rfq.floatedBy}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.rfq.invited.map((v) => {
                const cfg =
                  { responded: ["#EAF3DE", "#3B6D11", "✓"], pending: ["#FAEEDA", "#854F0B", "⏳"], declined: ["#FCEBEB", "#A32D2D", "✗"], no_response: ["#F5F4F2", "#9B9894", "—"] }[
                    v.status
                  ] ?? ["#F5F4F2", "#9B9894", "?"];
                return (
                  <span key={v.code} className="rounded-[10px] px-2 py-0.5 text-t9 font-medium" style={{ background: cfg[0], color: cfg[1] }} title={v.status}>
                    {cfg[2]} {v.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {p.rfq && !p.rfq.isOpen && (
          <div className="mb-2.5 flex items-center gap-2 rounded-md px-3 py-2 text-t10 text-muted" style={{ background: "#FBF9F6", border: "0.5px solid #E5E4E0" }}>
            <i className="ti ti-mail-check" style={{ fontSize: 12, color: "#3B6D11" }} />
            <span>
              <strong>{p.rfq.enqId}</strong> closed on {p.rfq.closedAt} — {p.rfq.closedReason}
            </span>
          </div>
        )}

        {/* Quote cards */}
        {sorted.length === 0 ? (
          <div className="rounded-md bg-[#F5F4F2] p-6 text-center text-t11 text-faint">
            <i className="ti ti-mail-question mb-2 block" style={{ fontSize: 24, color: "#D8D7D4" }} />
            {p.rfq ? "Enquiry floated — no quotes recorded yet." : "No enquiry floated yet."}
          </div>
        ) : (
          <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(sorted.length, 3)}, 1fr)` }}>
            {sorted.map((q) => (
              <QuoteCard key={q.subbie} q={q} uom={p.uom} wo={p.wo} />
            ))}
          </div>
        )}

        {p.wo && (
          <div className="flex items-center justify-between rounded-md px-3 py-2.5 text-t10" style={{ background: "#F5F9F2", border: "0.5px solid #3B6D11", color: "#3B6D11" }}>
            <div>
              <i className="ti ti-circle-check-filled" style={{ fontSize: 13, verticalAlign: -2 }} /> Work order {p.wo.woNo} raised to {p.wo.subbieName} ·{" "}
              <Chip label={p.wo.status === "released" ? "WO released" : "WO — pending approval"} bg="#EAF3DE" fg="#3B6D11" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
