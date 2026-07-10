"use client";

import { useState } from "react";
import { fmtC } from "@/lib/format";
import type { ArOutstandingRow, ArReceiptRow, FinanceArView } from "@/features/finance/types";

type ArFilter = "outstanding" | "reconciled";

const OUT_COLS = "80px 1fr 120px 110px 100px 100px";
const REC_COLS = "90px 110px 110px 130px 110px 90px 1fr";

function Outstanding({ rows }: { rows: ArOutstandingRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg bg-[#F5F4F2] p-[30px] text-center text-t11 text-faint">
        No outstanding invoices. ✓
      </div>
    );
  }
  return (
    <div className="tw">
      <div className="th" style={{ gridTemplateColumns: OUT_COLS }}>
        <span>RA</span>
        <span>Invoice · Client</span>
        <span>Invoice Date</span>
        <span>Days Outstanding</span>
        <span>Amount</span>
        <span>Status</span>
      </div>
      {rows.map((b) => (
        <div key={b.id} className="tr" style={{ gridTemplateColumns: OUT_COLS }}>
          <span className="font-mono text-t10 font-medium text-ink">{b.id}</span>
          <span>
            <div className="text-t11 font-medium text-ink">{b.invoiceNo}</div>
            <div className="text-[9px] text-faint">{b.client}</div>
          </span>
          <span className="text-t10 text-muted">{b.invoicedOn ?? "—"}</span>
          <span
            className="text-t10"
            style={{ color: b.overdue ? "#A32D2D" : "#1A1917", fontWeight: b.overdue ? 600 : 400 }}
          >
            {b.daysOutstanding} days{b.overdue ? " ⚠" : ""}
          </span>
          <span>
            <div className="text-t11 font-semibold text-ink">₹{fmtC(b.finalPayable)}</div>
            {b.receivedToDate > 0 && (
              <div className="text-[9px] text-[#3B6D11]">
                ₹{fmtC(b.receivedToDate)} received · ₹{fmtC(b.balance)} balance
              </div>
            )}
          </span>
          <span>
            <span className="pill pa" style={{ fontSize: 9 }}>
              {b.partPaid ? "Part-paid" : "Awaiting"}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function Reconciled({ rows }: { rows: ArReceiptRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg bg-[#F5F4F2] p-[30px] text-center text-t11 text-faint">
        No receipts reconciled yet.
      </div>
    );
  }
  return (
    <div className="tw">
      <div className="th" style={{ gridTemplateColumns: REC_COLS }}>
        <span>Receipt ID</span>
        <span>Date</span>
        <span>Bill Ref</span>
        <span>Invoice No</span>
        <span>Amount</span>
        <span>Via</span>
        <span>Reconciled · Note</span>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="tr" style={{ gridTemplateColumns: REC_COLS }}>
          <span className="font-mono text-t10 font-medium text-ink">{r.id}</span>
          <span className="text-t10 text-ink">{r.date}</span>
          <span className="font-mono text-t10 text-[#854F0B]">{r.clientBillRef}</span>
          <span className="font-mono text-t10 text-[#185FA5]">{r.invoiceNo}</span>
          <span className="text-t11 font-semibold text-[#3B6D11]">₹{fmtC(r.amount)}</span>
          <span className="text-t10 text-muted">
            {r.receivedVia}
            <div className="font-mono text-[9px] text-faint">{r.refNo}</div>
          </span>
          <span className="text-t10 text-muted">
            {r.reconciledOn ? "✓ " + r.reconciledOn : "pending"}
            <div className="text-[9px] text-faint">{r.note}</div>
          </span>
        </div>
      ))}
    </div>
  );
}

export function ArTab({ ar }: { ar: FinanceArView }) {
  const [filter, setFilter] = useState<ArFilter>("outstanding");

  const meta: Record<ArFilter, { label: string; count: number }> = {
    outstanding: { label: "Outstanding Invoices", count: ar.outstandingCount },
    reconciled: { label: "Reconciled Receipts", count: ar.reconciledCount },
  };
  const order: ArFilter[] = ["outstanding", "reconciled"];

  return (
    <>
      <div className="mb-3 flex items-center gap-1.5 rounded-md border-[0.5px] border-[#E5E4E0] bg-surface px-2.5 py-1.5">
        {order.map((f) => {
          const active = filter === f;
          const m = meta[f];
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11 " +
                (active ? "border-ink bg-ink font-medium text-white" : "border-input bg-surface text-muted")
              }
            >
              {m.label} {m.count > 0 ? `(${m.count})` : ""}
            </button>
          );
        })}
        <span className="ml-auto text-t10 text-faint">
          Invoices arrive after Billing raises tax invoice
        </span>
      </div>

      {filter === "outstanding" ? <Outstanding rows={ar.outstanding} /> : <Reconciled rows={ar.reconciled} />}

      <div className="mt-3 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3 py-2 text-t10 text-muted">
        <strong>AR workflow:</strong> Billing raises tax invoice → Finance tracks ageing → Follow-up if
        &gt;30 days → Receipt recorded against invoice → Reconciled in bank statement → Tally entry posted.
      </div>
    </>
  );
}
