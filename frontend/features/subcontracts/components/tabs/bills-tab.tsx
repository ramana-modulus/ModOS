"use client";

import { fmtC, fmtQ } from "@/lib/format";
import type { ScBillsView } from "@/features/subcontracts/api";
import { Code } from "../ui-bits";

const AWAIT_GRID = "170px 96px minmax(0,1.5fr) 150px";
const BILL_GRID = "128px 132px minmax(160px,1.3fr) 92px 100px 104px 92px 132px";

const STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  matched: { bg: "#E6F5F3", fg: "#0F766E", label: "Matched · Ready to Forward" },
  discrepancy: { bg: "#FCEBEB", fg: "#A32D2D", label: "⚠ Discrepancy · Held" },
  forwarded_to_finance: { bg: "#F3E8FB", fg: "#7B1FA2", label: "✓ Forwarded to Finance" },
  paid: { bg: "#EAF3DE", fg: "#3B6D11", label: "✓ Paid" },
};

export function BillsTab({ data }: { data: ScBillsView }) {
  const { sections, awaiting, kpis } = data;

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2 rounded-md px-3 py-2 text-t10 text-muted" style={{ background: "#FBF9F6", border: "0.5px solid #E5E4E0" }}>
        <i className="ti ti-info-circle" style={{ fontSize: 13, color: "#0F766E" }} />
        <span>
          <strong>Running-account bills.</strong> One bill per subcontractor per RA week, covering all the line items they progressed that week.
          Subcontracts applies retention + GST + TDS (194C) on the bill total, then forwards the net to Finance. Each claim is 3-way matched (claim
          rate vs WO, claim qty vs certified).
        </span>
      </div>

      <div className="mb-3 grid grid-cols-5 gap-2.5">
        <div className="kp">
          <div className="kl">Awaiting claim</div>
          <div className="kv" style={{ color: kpis.awaitingClaim ? "#854F0B" : "#9B9894" }}>
            {kpis.awaitingClaim}
          </div>
          <div className="ks">RA certified, unbilled</div>
        </div>
        <div className="kp">
          <div className="kl">RA Bills</div>
          <div className="kv">{kpis.raBills}</div>
          <div className="ks">₹{fmtC(kpis.totalGross)} gross</div>
        </div>
        <div className="kp">
          <div className="kl">Held (Discrepancy)</div>
          <div className={"kv " + (kpis.held > 0 ? "cr" : "cg")}>{kpis.held}</div>
          <div className="ks">awaiting resolution</div>
        </div>
        <div className="kp">
          <div className="kl">Forwarded to Finance</div>
          <div className="kv cac">{kpis.forwarded}</div>
          <div className="ks">queued for AP payment</div>
        </div>
        <div className="kp">
          <div className="kl">Paid</div>
          <div className="kv cg">{kpis.paid}</div>
          <div className="ks">closed loop</div>
        </div>
      </div>

      {awaiting.length > 0 && (
        <div className="mb-3.5">
          <div className="rounded-t-md px-3 py-1.5 text-t11 font-semibold" style={{ background: "#FAEEDA", border: "0.5px solid #E8B86D", borderBottom: "none", color: "#854F0B" }}>
            <i className="ti ti-clock" style={{ verticalAlign: -2 }} /> Awaiting subcontractor bill — RA certified, record the subbie&rsquo;s claim (3-way
            match)
          </div>
          <div className="tw mb-0 overflow-x-auto">
            <div className="th" style={{ gridTemplateColumns: AWAIT_GRID }}>
              <span>Subcontractor</span>
              <span>RA week</span>
              <span>Certified line items</span>
              <span>Action</span>
            </div>
            {awaiting.map((a) => (
              <div key={`${a.sub}-${a.week}`} className="tr items-center" style={{ gridTemplateColumns: AWAIT_GRID }}>
                <span className="text-t10">
                  {a.subName}
                  <div className="font-mono text-t9 text-faint">{a.sub}</div>
                </span>
                <span className="text-t10 font-semibold" style={{ color: "#0F766E" }}>
                  RA-{String(a.week).padStart(2, "0")}
                </span>
                <span className="text-t9 text-muted">
                  {a.lines.map((l, i) => (
                    <span key={l.code}>
                      {i > 0 ? " · " : ""}
                      <Code>{l.code}</Code> {fmtQ(l.certQty)}
                    </span>
                  ))}{" "}
                  <span className="text-faint">(≈₹{fmtC(a.certVal)} at WO)</span>
                </span>
                <span>
                  <span className="rounded px-2 py-1 text-t9 font-semibold text-white" style={{ background: "#854F0B" }}>
                    <i className="ti ti-receipt" style={{ fontSize: 9 }} /> Record SC bill
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.length === 0 && awaiting.length === 0 && (
        <div className="rounded-lg bg-[#F5F4F2] p-7 text-center text-t11 text-faint">
          No RA bills yet. Raise a weekly RA from the <strong>Measurement (RA)</strong> tab.
        </div>
      )}

      {sections.map((s) => (
        <div key={s.sub} className="mb-3">
          <div
            className="flex items-center justify-between rounded-t-md px-3 py-1.5 text-t11 font-semibold"
            style={{ background: "#E6F5F3", border: "0.5px solid #99D6CC", borderBottom: "none", color: "#0F766E" }}
          >
            <span>
              {s.subName} <span className="font-mono font-normal" style={{ color: "#3F8C82" }}>{s.sub}</span>
            </span>
            <span className="font-normal" style={{ color: "#3F8C82" }}>
              {s.count} RA bill{s.count > 1 ? "s" : ""} · net ₹{fmtC(s.netTotal)}
            </span>
          </div>
          <div className="tw mb-0 overflow-x-auto">
            <div className="th" style={{ gridTemplateColumns: BILL_GRID }}>
              <span>Bill #</span>
              <span>RA / Period</span>
              <span>Line items (this week)</span>
              <span>Gross</span>
              <span>Retention</span>
              <span>Tax / TDS</span>
              <span>Net</span>
              <span>Status</span>
            </div>
            {s.rows.map((b) => {
              const st = STATUS[b.status] ?? { bg: "#F5F4F2", fg: "#9B9894", label: b.status };
              return (
                <div key={b.bk} className="tr" style={{ gridTemplateColumns: BILL_GRID }}>
                  <span>
                    <div className="font-mono text-t10 font-semibold text-ink">{b.billId}</div>
                    <div className="text-t9 text-faint">{b.billDate}</div>
                  </span>
                  <span>
                    <div className="text-t10 font-semibold" style={{ color: "#0F766E" }}>
                      RA-{String(b.raNo).padStart(2, "0")}
                    </div>
                    <div className="text-t9 text-faint">to {b.periodTo}</div>
                  </span>
                  <span className="text-t10 text-ink">
                    {b.lineCodes.length === 1 ? <Code>{b.lineCodes[0]}</Code> : <>{b.lineCodes.length} lines: <Code>{b.lineCodes.join(", ")}</Code></>}
                    <div className="mt-0.5 text-t9 text-faint">{b.lineDetail}</div>
                  </span>
                  <span className="text-t11 font-medium text-ink">₹{fmtC(b.gross)}</span>
                  <span className="text-t10" style={{ color: "#A32D2D" }}>
                    −₹{fmtC(b.retention)}
                    <div className="text-t9 text-faint">{b.retentionPct}% held</div>
                  </span>
                  <span className="text-t10 text-muted">
                    +₹{fmtC(b.gst)} GST<div>−₹{fmtC(b.tds)} TDS</div>
                  </span>
                  <span className="text-t11 font-semibold text-ink">₹{fmtC(b.net)}</span>
                  <span>
                    <span className="pill" style={{ background: st.bg, color: st.fg, fontSize: 9, padding: "2px 8px" }}>
                      {st.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-2.5 rounded-md px-3 py-2.5 text-t10 text-muted" style={{ background: "#FBF9F6", border: "0.5px solid #E5E4E0" }}>
        <strong>Workflow:</strong> Raise RA (Measurement tab) → one running-account bill per subcontractor per week → Forward net to Finance → Finance
        pays + records ref. Retention held against defects per bill (released at DLP closure). TDS 1% under 194C; GST 18% on the post-retention taxable
        value.
      </div>
    </div>
  );
}
