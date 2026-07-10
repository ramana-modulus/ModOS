"use client";

import type { OpsPayload } from "@/features/ops/api";
import { fmtRupee } from "@/lib/format";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "pgr" },
  received: { label: "Received", cls: "pb" },
  match_pending: { label: "Match pending", cls: "pa" },
  matched: { label: "Matched", cls: "pg" },
  forwarded_to_finance: { label: "Forwarded to Finance", cls: "pb" },
  paid: { label: "Paid", cls: "pg" },
  discrepancy: { label: "Discrepancy", cls: "pr" },
};

const MATCH_COLOR = (v: string) => (v === "match" ? "#3B6D11" : "#A32D2D");

function Kpi({ label, value, sub, tone }: { label: string; value: string | number; sub: string; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

export function BillsTab({ data }: { data: OpsPayload }) {
  const { bills } = data;
  const forwarded = bills.filter((b) => b.status === "forwarded_to_finance").length;
  const paid = bills.filter((b) => b.status === "paid").length;
  const held = bills.filter((b) => b.status === "discrepancy").length;
  const totNet = bills.reduce((s, b) => s + b.netPayable, 0);

  return (
    <div>
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-4">
        <Kpi label="Vendor Bills" value={bills.length} sub="3-way match" />
        <Kpi label="Forwarded" value={forwarded} sub="to Finance" tone="cac" />
        <Kpi label="Paid" value={paid} sub="settled" tone="cg" />
        <Kpi label="Held / Discrepancy" value={held} sub={held > 0 ? "match failed" : "none"} tone={held > 0 ? "cr" : "cg"} />
      </div>

      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#EFF5FB] px-3 py-2 text-t9 text-muted">
        Ops records the vendor invoice; the 3-way match (PO + GRN + Invoice) runs here, then Procurement forwards clean
        bills to Finance. Net payable across shown bills: <b className="text-ink">{fmtRupee(totNet)}</b>.
      </div>

      <table className="t text-t10">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Vendor · Material</th>
            <th className="text-right">Qty × Rate</th>
            <th className="text-right">Net Payable</th>
            <th>PO / GRN Match</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => {
            const meta = STATUS_META[b.status] ?? { label: b.status, cls: "pgr" };
            return (
              <tr key={b.invId}>
                <td className="font-mono text-t9">
                  {b.invId}
                  <div className="text-faint">{b.invDate}</div>
                </td>
                <td>
                  {b.vendor}
                  <div className="text-t9 text-faint">{b.code}</div>
                </td>
                <td className="text-right">
                  {b.invQty} × ₹{b.invRate}
                  <div className="text-t9 text-faint">GST {b.gstPct}% · TDS {b.tdsPct}%</div>
                </td>
                <td className="text-right font-semibold">{fmtRupee(b.netPayable)}</td>
                <td className="text-t9">
                  PO <b style={{ color: MATCH_COLOR(b.matchPO) }}>{b.matchPO.replace(/_/g, " ")}</b>
                  <br />
                  GRN <b style={{ color: MATCH_COLOR(b.matchGRN) }}>{b.matchGRN.replace(/_/g, " ")}</b>
                </td>
                <td>
                  <span className={`pill ${meta.cls}`}>{meta.label}</span>
                  {b.payRef && <div className="text-t9 text-faint">{b.payRef}</div>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {bills.some((b) => b.note) && (
        <div className="mt-3 space-y-1">
          {bills
            .filter((b) => b.note)
            .map((b) => (
              <div key={b.invId} className="text-t9 text-muted">
                <b className="font-mono text-ink-soft">{b.invId}:</b> {b.note}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
