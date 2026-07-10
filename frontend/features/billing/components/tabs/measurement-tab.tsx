"use client";

import { useMemo, useState } from "react";
import { fmtQ, fmtC } from "@/lib/format";
import type { BillingView, MeasCardView, MeasStatus } from "@/features/billing/types";
import { measRowQty } from "@/features/billing/domain";
import { RouteBar } from "../route-bar";

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Awaiting approval" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Returned" },
  { key: "billed", label: "Billed" },
];

function inTab(status: MeasStatus, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "approved") return status === "approved" || status === "billed";
  return status === filter;
}

function StatusPill({ card }: { card: MeasCardView }) {
  const { statusMeta, meas } = card;
  return (
    <span
      className="ml-1.5 rounded-[3px] px-1.5 py-px text-t8 font-semibold"
      style={{ color: statusMeta.color, background: statusMeta.bg }}
    >
      {statusMeta.label}
      {meas.measVersion ? ` · ${meas.measVersion}` : ""}
    </span>
  );
}

function MeasurementSheet({ card }: { card: MeasCardView }) {
  const { meas, mode, modeMeta } = card;
  const fieldHdr: Record<string, string> = {
    no: "No",
    L: "L (m)",
    B: "B (m)",
    H: "H (m)",
    unitWt: "Unit wt",
    portion: "Portion",
  };
  const cols = `1fr ${modeMeta.fields.map(() => "58px").join(" ")} 74px`;
  return (
    <div className="my-2 overflow-hidden rounded-[5px] border-[0.5px] border-line">
      <div className="px-[7px] pb-0.5 pt-[5px] text-t9 font-medium uppercase tracking-[0.5px] text-faint">
        Measurement sheet · {modeMeta.label} · qty = {modeMeta.formula}
      </div>
      <div className="grid px-[7px] py-[3px] text-t8 text-muted" style={{ gridTemplateColumns: cols, background: "#F0EFEB" }}>
        <span>Description</span>
        {modeMeta.fields.map((f) => (
          <span key={f} className="text-right">
            {fieldHdr[f]}
          </span>
        ))}
        <span className="text-right">Qty ({meas.uom})</span>
      </div>
      {(meas.measurements || []).map((r) => (
        <div
          key={r.id}
          className="grid items-center border-b-[0.5px] border-[#F0EFEB] px-[7px] py-[3px] text-t9"
          style={{ gridTemplateColumns: cols }}
        >
          <span className="text-ink-soft">{r.desc}</span>
          {modeMeta.fields.map((f) => {
            const val = (r as unknown as Record<string, number | undefined>)[f];
            return (
              <span key={f} className="text-right text-muted">
                {val != null ? fmtQ(val) : "—"}
              </span>
            );
          })}
          <span className="text-right font-semibold text-ink">{fmtQ(measRowQty(mode as Parameters<typeof measRowQty>[0], r))}</span>
        </div>
      ))}
      <div className="flex items-center justify-between px-[7px] py-[5px] text-t10 text-muted" style={{ background: "#FBF9F6" }}>
        <span>
          Measured total: <b className="text-ink">{fmtQ(meas.measuredQty)} {meas.uom}</b>{" "}
          <span className="text-faint">(derives the line)</span>
        </span>
      </div>
    </div>
  );
}

function WorkflowBanner({ card }: { card: MeasCardView }) {
  const { meas } = card;
  const base = "mb-2 rounded-[5px] border-[0.5px] px-[9px] py-[7px] text-t10";
  if (meas.status === "rejected") {
    return (
      <div className={base} style={{ background: "#FCEBEB", borderColor: "#E8C9C9", color: "#A32D2D" }}>
        <b>↩ Returned by {meas.rejectedBy}{meas.rejectedOn ? ` on ${meas.rejectedOn}` : ""}:</b>{" "}
        {meas.rejectReason || "Re-measure required."}
      </div>
    );
  }
  if (meas.status === "submitted") {
    return (
      <div className={base} style={{ background: "#FBF1E0", borderColor: "#E5C9A0", color: "#854F0B" }}>
        ⏳ Submitted by {meas.submittedBy}{meas.submittedOn ? ` on ${meas.submittedOn}` : ""} — awaiting Site Manager approval.
      </div>
    );
  }
  if (meas.status === "approved") {
    return (
      <div className={base} style={{ background: "#EAF3DE", borderColor: "#C5DDA8", color: "#3B6D11" }}>
        ✓ Approved by {meas.approvedBy}{meas.approvedOn ? ` on ${meas.approvedOn}` : ""} — billable in the next RA.
      </div>
    );
  }
  if (meas.status === "billed") {
    return (
      <div className={base} style={{ background: "#E6F1FB", borderColor: "#BBD4EC", color: "#185FA5" }}>
        🔒 Billed{meas.billedOn ? ` on ${meas.billedOn}` : ""} — issued to the client on this RA.
      </div>
    );
  }
  return (
    <div className={base} style={{ background: "#F7F6F3", borderColor: "#E5E4E0", color: "#6B6A68" }}>
      Measured by the Billing Engineer. Draft — ready to send for approval.
    </div>
  );
}

function Card({ card }: { card: MeasCardView }) {
  const [open, setOpen] = useState(false);
  const { meas, category, scType, clientValue, reconcileIssues } = card;
  return (
    <div className="border-b-[0.5px] border-[#F0EFED] bg-white">
      <div className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5" onClick={() => setOpen((o) => !o)}>
        <span className="flex-shrink-0 text-muted">{open ? "▾" : "▸"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-mono text-t11 font-semibold text-ink">{meas.code}</span>
            <span className="text-t11 text-ink-soft">{meas.name}</span>
            <StatusPill card={card} />
            <span className="ml-1.5 rounded-[3px] px-1.5 py-px text-t8 font-semibold" style={{ color: "#5B5A57", background: "#F0EFEB" }}>
              {category.label}
            </span>
            {scType && (
              <span className="ml-1.5 rounded-[3px] px-1.5 py-px text-t8 font-semibold" style={{ color: scType.fg, background: scType.bg }}>
                {scType.label}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-t10">
            <span className="font-semibold text-ink">Measured {fmtQ(meas.measuredQty)} {meas.uom}</span>
            {clientValue > 0 && <span className="text-faint"> · client value ₹{fmtC(clientValue)}</span>}
          </div>
        </div>
      </div>
      {open && (
        <div className="border-t-[0.5px] border-dashed border-line px-3 pb-2 pl-9" style={{ background: "#FBF9F6" }}>
          <div className="py-1.5 text-t9 text-faint">
            {meas.cycle} · cleared by {meas.clearedBy || "QC"} · measured by {meas.measuredBy || "—"}
            {meas.approvedBy ? ` · ✓ approved by ${meas.approvedBy}` : ""}
          </div>
          {reconcileIssues.length > 0 && (
            <div className="mb-2 rounded-[5px] border-[0.5px] px-[9px] py-[7px] text-t10" style={{ background: "#FBF3F3", borderColor: "#E8C9C9", color: "#A32D2D" }}>
              ⚠ {reconcileIssues.join("; ")}
            </div>
          )}
          <WorkflowBanner card={card} />
          <MeasurementSheet card={card} />
        </div>
      )}
    </div>
  );
}

export function MeasurementTab({ data }: { data: BillingView }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [raFilter, setRaFilter] = useState("all");

  const cycles = useMemo(() => data.measurement.map((g) => g.cycle), [data.measurement]);

  const groups = data.measurement
    .filter((g) => raFilter === "all" || g.cycle === raFilter)
    .map((g) => ({ ...g, cards: g.cards.filter((c) => inTab(c.meas.status, statusFilter)) }))
    .filter((g) => g.cards.length > 0);

  return (
    <>
      <RouteBar
        inherit="Ops DPR (cum-done) + QA/QC clearance"
        route="Client RA (AR) · Subcontractor RA (AP)"
        note="the spine — measured qty is the single parent of both faces"
      />

      {/* Approval header */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border-[0.5px] border-line bg-[#FBF9F6] px-3.5 py-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md" style={{ background: "var(--ac-lt)", color: "var(--ac)" }}>
          <span className="text-lg">📏</span>
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="text-t12 font-semibold text-ink">Measurement Book — site measurement &amp; approval</div>
          <div className="text-t10 text-muted">
            {data.measEngineer} measures each approved line and submits it; {data.measApprover} approves it into the RA (read-only in this port).
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-t9 uppercase tracking-[0.5px] text-faint">RA</span>
          <select value={raFilter} onChange={(e) => setRaFilter(e.target.value)} className="cursor-pointer rounded-md border-[0.5px] border-input bg-white px-2 py-1 text-t11">
            <option value="all">All RAs</option>
            {cycles.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className={`pill ${data.measurementPending > 0 ? "pa" : "pgr"}`}>{data.measurementPending} pending</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatusFilter(s.key)}
                className="cursor-pointer rounded-[12px] border-[0.5px] px-2 py-0.5 text-t9"
                style={{
                  borderColor: active ? "var(--ac)" : "#D8D7D4",
                  background: active ? "var(--ac-lt)" : "#fff",
                  color: active ? "var(--ac)" : "#6B6A68",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="py-6 text-center text-t11 text-faint">No measured lines in this view.</div>
      ) : (
        groups.map((g) => {
          const accent = g.upcoming ? "#E5C9A0" : "#BBD4EC";
          const accBg = g.upcoming ? "#FBF6EE" : "#EEF4FB";
          const accFg = g.upcoming ? "#854F0B" : "#185FA5";
          const summary = Object.entries(g.statusCounts)
            .map(([s, n]) => `${n} ${s}`)
            .join(" · ");
          return (
            <div key={g.cycle} className="mb-2.5 overflow-hidden rounded-lg border-[0.5px]" style={{ borderColor: accent }}>
              <div className="flex items-center gap-2 border-b-[0.5px] px-3 py-2" style={{ background: accBg, borderColor: accent }}>
                <span className="text-t12 font-bold" style={{ color: accFg }}>{g.cycle}</span>
                <span className="text-t10 text-muted">{g.cards.length} line{g.cards.length === 1 ? "" : "s"}</span>
                <span className="ml-auto text-t9 text-faint">{summary}</span>
                <span className="rounded-[3px] border-[0.5px] bg-white px-1.5 py-px text-t8 font-semibold" style={{ color: accFg, borderColor: accent }}>
                  {g.upcoming ? "UPCOMING RA" : "BILLED"}
                </span>
              </div>
              {g.cards.map((c) => (
                <Card key={c.meas.id} card={c} />
              ))}
            </div>
          );
        })
      )}
    </>
  );
}
