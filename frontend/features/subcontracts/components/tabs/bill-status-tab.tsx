"use client";

import { fmtC } from "@/lib/format";
import type { ScBillStatusGroup } from "@/features/subcontracts/api";

const ST_META: Record<string, { pill: string; label: string }> = {
  matched: { pill: "pa", label: "Matched — awaiting forward" },
  forwarded_to_finance: { pill: "pb", label: "Sent to Finance" },
  paid: { pill: "pg", label: "Paid" },
  awaiting: { pill: "pgr", label: "Awaiting bill" },
  query: { pill: "pr", label: "Under query" },
  discrepancy: { pill: "pr", label: "Under query" },
};

export function BillStatusTab({ data }: { data: ScBillStatusGroup[] }) {
  return (
    <div>
      <div className="mb-2.5 rounded-md px-3 py-2 text-t9 text-muted" style={{ background: "#EFF5FB", border: "0.5px solid #BBD4EC" }}>
        <i className="ti ti-info-circle" style={{ verticalAlign: -1 }} /> <b>Bill pass gate.</b> Measurement is run by the Billing desk (the billing
        engineer measures &amp; certifies each subbie&rsquo;s RA). Certified (matched) SC bills are <b>passed to Finance from here</b> — forward each
        subbie&rsquo;s net (after retention/TDS).
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg bg-[#FBF9F6] p-6 text-center text-t11 text-faint">No subcontractor RA bills raised yet for this sub-project.</div>
      ) : (
        data.map((g) => (
          <div key={g.sub} className="mb-2 rounded-lg border-[0.5px] border-line bg-surface px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="text-t12 font-bold text-ink">{g.sub}</div>
              <div className="text-t10 text-muted">
                {g.count} RA bill(s) · ₹{fmtC(g.total)} gross · <span style={{ color: "#3B6D11" }}>₹{fmtC(g.paid)} paid</span>
              </div>
            </div>
            {g.rows.map((b) => {
              const sm = ST_META[b.status] ?? ST_META.awaiting!;
              return (
                <div key={b.billId} className="flex items-center gap-2 border-t-[0.5px] border-[#F0EFEB] py-1.5 text-t10">
                  <span className="font-mono text-t9" style={{ color: "#854F0B" }}>
                    {b.billId}
                  </span>
                  <span className="text-faint">
                    RA-{String(b.raNo).padStart(2, "0")} · to {b.periodTo}
                  </span>
                  <span className={"pill " + sm.pill} style={{ fontSize: 8.5, padding: "1px 7px" }}>
                    {sm.label}
                  </span>
                  <span className="ml-auto font-semibold">₹{fmtC(b.gross)}</span>
                  {b.status === "matched" && (
                    <span className="ml-2 rounded px-2 py-0.5 text-t9 text-white" style={{ background: "#0F766E" }}>
                      Forward ↗
                    </span>
                  )}
                  {b.status === "forwarded_to_finance" && (
                    <span className="ml-2 rounded px-1.5 py-0.5 text-t9" style={{ background: "#EAF1F9", color: "#185FA5", border: "0.5px solid #BBD4EC" }}>
                      ↗ Finance AP
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
