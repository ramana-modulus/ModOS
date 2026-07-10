"use client";

import { useState } from "react";
import { fmtC, fmtQ } from "@/lib/format";
import { Pill } from "@/components/ui/badge";
import type { BillingView, RaSubcGroup, ScBill } from "@/features/billing/types";
import { RouteBar } from "../route-bar";

function RaGroup({ group }: { group: RaSubcGroup }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-3 overflow-hidden rounded-lg border-[0.5px] border-line" style={{ borderLeft: `2.5px solid ${group.accent}` }}>
      <div className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5" style={{ background: "#FAFAF8" }} onClick={() => setOpen((o) => !o)}>
        <span className="text-faint">{open ? "▾" : "▸"}</span>
        <span className="text-t13 font-semibold text-ink">{group.cycle}</span>
        <Pill cls={group.pill}>{group.statusLabel}</Pill>
        <span className="text-t9 text-faint">
          {group.subbies.length} line-item SC{group.subbies.length === 1 ? "" : "s"}
        </span>
        <span className="ml-auto text-t12 font-semibold text-ink">
          ₹{fmtC(group.net)}
          <span className="text-t9 font-normal text-faint"> net payable</span>
        </span>
      </div>
      {open && (
        <>
          {group.subbies.length === 0 ? (
            <div className="border-t-[0.5px] border-[#F0EFEB] px-3 py-2.5 text-t10 text-faint">
              No line-item subcontractor scopes in this RA.
            </div>
          ) : (
            group.subbies.map((b) => (
              <div key={b.subbie} className="border-t-[0.5px] border-[#F0EFEB] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-t11 text-ink">
                    {b.name}
                    <span className="ml-1.5 rounded-[3px] px-1.5 py-px text-t8 font-semibold" style={{ color: "#185FA5", background: "#185FA51A" }}>
                      Line-item SC
                    </span>
                    <span className="text-t9 text-faint"> · {b.scopes.filter((s) => s.mode === "lineitem").length} scope(s)</span>
                  </span>
                  <span className="text-t11 font-semibold text-ink">₹{fmtC(b.lineGross)}</span>
                </div>
                {b.scopes
                  .filter((s) => s.mode === "lineitem")
                  .map((s, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 pl-4 text-t10 text-muted">
                      <span className="min-w-[74px] font-mono">{s.code}</span>
                      <span className="flex-1">
                        {s.scope} · {fmtQ(s.qty || 0)} {s.uom} × ₹{fmtC(s.rate || 0)}
                      </span>
                      <span className="font-medium text-ink">₹{fmtC(s.value)}</span>
                    </div>
                  ))}
              </div>
            ))
          )}
          {group.manTotal > 0 && (
            <div className="border-t-[0.5px] border-[#F0EFEB] px-3 py-2 text-t9" style={{ background: "#FBF9F6", color: "#854F0B" }}>
              ⏳ <b>Manpower SC</b> — ₹{fmtC(group.manTotal)} across {group.manCount} subcontractor{group.manCount === 1 ? "" : "s"} is <b>pending the Subcontracts-dept build</b>; not yet payable here.
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3.5 border-t-[0.5px] border-[#F0EFEB] px-3 py-2.5" style={{ background: "#FAFAF8" }}>
            <span className="text-t10 text-muted">Gross <strong className="text-ink">₹{fmtC(group.gross)}</strong></span>
            <span className="text-t10 text-muted">Retention 5% <strong style={{ color: "#A32D2D" }}>−₹{fmtC(group.retention)}</strong></span>
            <span className="text-t10 text-muted">TDS 1% <strong style={{ color: "#A32D2D" }}>−₹{fmtC(group.tds)}</strong></span>
            <span className="text-t10 text-muted">GST 18% <strong className="text-ink">+₹{fmtC(group.gst)}</strong></span>
            <span className="text-t10 text-muted">Net payable <strong className="text-ink">₹{fmtC(group.net)}</strong></span>
            <span className="ml-auto text-t9 text-faint">3-way: WO ↔ measurement ↔ claim · line-item SC only</span>
          </div>
        </>
      )}
    </div>
  );
}

const SC_STATUS: Record<ScBill["status"], { pill: "pg" | "pa" | "pb"; label: string }> = {
  paid: { pill: "pg", label: "Paid" },
  forwarded_to_finance: { pill: "pb", label: "Forwarded to Finance" },
  matched: { pill: "pa", label: "Certified — 3-way matched" },
};

function ScBillCard({ bill }: { bill: ScBill }) {
  const retention = Math.round(bill.gross * (bill.retentionPct / 100));
  const tds = Math.round(bill.gross * (bill.tdsPct / 100));
  const gst = Math.round((bill.gross - retention) * (bill.gstPct / 100));
  const net = bill.gross - retention - tds + gst;
  const meta = SC_STATUS[bill.status];
  return (
    <div className="mb-2.5 overflow-hidden rounded-lg border-[0.5px] border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b-[0.5px] border-[#F0EFEB] px-3 py-2.5" style={{ background: "#FAFAF8" }}>
        <span className="font-mono text-t10 text-muted">{bill.billId}</span>
        <span className="text-t12 font-semibold text-ink">{bill.subbie}</span>
        <span className="text-t9 text-faint">{bill.cycle} · to {bill.periodTo}</span>
        <Pill cls={meta.pill} className="ml-auto">{meta.label}</Pill>
      </div>
      {bill.lines.map((l, i) => (
        <div key={i} className="flex items-center gap-2 border-b-[0.5px] border-[#F0EFEB] px-3 py-1.5 text-t10">
          <span className="min-w-[74px] font-mono text-muted">{l.code}</span>
          <span className="flex-1 text-ink-soft">
            {fmtQ(l.certQty)} × ₹{fmtC(l.rate)} <span className="text-faint">(WO ₹{fmtC(l.woRate)} · {l.matchWO})</span>
          </span>
          <span className="font-medium text-ink">₹{fmtC(l.amount)}</span>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3.5 px-3 py-2 text-t10 text-muted">
        <span>Gross <strong className="text-ink">₹{fmtC(bill.gross)}</strong></span>
        <span>Retention {bill.retentionPct}% <strong style={{ color: "#A32D2D" }}>−₹{fmtC(retention)}</strong></span>
        <span>TDS {bill.tdsPct}% <strong style={{ color: "#A32D2D" }}>−₹{fmtC(tds)}</strong></span>
        <span>GST {bill.gstPct}% <strong className="text-ink">+₹{fmtC(gst)}</strong></span>
        <span>Net <strong className="text-ink">₹{fmtC(net)}</strong></span>
      </div>
      {bill.note && <div className="border-t-[0.5px] border-[#F0EFEB] px-3 py-1.5 text-t9 text-faint">{bill.note}</div>}
    </div>
  );
}

export function SubcRaTab({ data }: { data: BillingView }) {
  const [view, setView] = useState<"measurement" | "bills">("measurement");
  const seg = (id: "measurement" | "bills", label: string) => {
    const active = view === id;
    return (
      <button
        type="button"
        onClick={() => setView(id)}
        className="cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11"
        style={{ borderColor: active ? "var(--ac)" : "#D8D7D4", background: active ? "var(--ac-lt)" : "#fff", color: active ? "var(--ac)" : "#6B6A68" }}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <RouteBar
        inherit="Measurement spine — execution face (SC scopes)"
        route="Finance — consolidated AP / payment run"
        note="3-way match: WO ↔ measurement ↔ claim"
      />
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-t10 font-medium uppercase tracking-[0.5px] text-faint">Subcontractor RA:</span>
        <div className="flex gap-1.5">
          {seg("measurement", "Measurement (RA)")}
          {seg("bills", "SC Bills")}
        </div>
      </div>

      {view === "measurement" ? (
        data.raSubc.length === 0 ? (
          <div className="rounded-lg border-[0.5px] border-dashed border-line bg-white py-7 text-center text-t11 text-faint">
            No subcontractor RA in the spine yet.
          </div>
        ) : (
          data.raSubc.map((g) => <RaGroup key={g.cycle} group={g} />)
        )
      ) : data.scBills.length === 0 ? (
        <div className="rounded-lg border-[0.5px] border-dashed border-line bg-white py-7 text-center text-t11 text-faint">
          No subcontractor bills raised yet.
        </div>
      ) : (
        data.scBills.map((b) => <ScBillCard key={b.billId} bill={b} />)
      )}
    </>
  );
}
