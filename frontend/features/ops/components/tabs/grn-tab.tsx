"use client";

import type { OpsPayload } from "@/features/ops/api";
import { Pill } from "@/components/ui/badge";
import { fmtQ } from "@/lib/format";

function Kpi({ label, value, sub, tone }: { label: string; value: string | number; sub: string; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

export function GrnTab({ data }: { data: OpsPayload }) {
  const { grn } = data;
  const full = grn.filter((g) => g.qtyReceived >= g.orderedQty).length;
  const partial = grn.filter((g) => g.qtyReceived > 0 && g.qtyReceived < g.orderedQty).length;
  const totRejected = grn.reduce((s, g) => s + (g.rejectedQty || 0), 0);

  return (
    <div>
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-4">
        <Kpi label="GRNs Recorded" value={grn.length} sub="site goods receipt" />
        <Kpi label="Full Delivery" value={full} sub="received ≥ ordered" tone="cg" />
        <Kpi label="Partial" value={partial} sub="balance pending" tone={partial > 0 ? "cac" : "cg"} />
        <Kpi label="Rejected Qty" value={fmtQ(totRejected)} sub={totRejected > 0 ? "at incoming inspection" : "none rejected"} tone={totRejected > 0 ? "ca" : "cg"} />
      </div>

      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#EFF5FB] px-3 py-2 text-t9 text-muted">
        Site records goods receipt against a PO. Submitting a GRN updates the PO delivered qty (visible read-only to
        Procurement), adds to site stock (Store), triggers QA incoming inspection for engineered items, and enables the
        vendor-invoice 3-way match in Vendor Bills.
      </div>

      <table className="t text-t10">
        <thead>
          <tr>
            <th>GRN</th>
            <th>PO · Vendor</th>
            <th>Material</th>
            <th className="text-right">Received / Ordered</th>
            <th>Date</th>
            <th>Received By</th>
            <th>Condition</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {grn.map((g) => {
            const complete = g.qtyReceived >= g.orderedQty;
            return (
              <tr key={g.grnId}>
                <td className="font-mono">{g.grnId}</td>
                <td>
                  {g.poNumber || "—"}
                  <br />
                  <span className="text-t9 text-faint">{g.vendor || ""}</span>
                </td>
                <td>
                  {g.code}
                  {g.materialName && <div className="text-t9 text-faint">{g.materialName}</div>}
                </td>
                <td className="text-right">
                  {fmtQ(g.qtyReceived)}
                  {g.orderedQty ? ` / ${fmtQ(g.orderedQty)}` : ""} {g.uom}
                  {g.rejectedQty > 0 && <div className="text-t9 text-danger">rejected {fmtQ(g.rejectedQty)} {g.uom}</div>}
                </td>
                <td className="whitespace-nowrap">{g.date}</td>
                <td className="text-muted">{g.receivedBy || "—"}</td>
                <td className="capitalize">{g.condition}</td>
                <td>
                  {complete ? (
                    <Pill cls="pg">Completed</Pill>
                  ) : g.qtyReceived > 0 ? (
                    <Pill cls="pa">Partial</Pill>
                  ) : (
                    <Pill cls="pgr">Awaiting</Pill>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
