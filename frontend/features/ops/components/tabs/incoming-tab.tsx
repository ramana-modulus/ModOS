"use client";

import type { OpsPayload } from "@/features/ops/api";
import { fmtQ } from "@/lib/format";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-surface px-3.5 py-3">
      <div className="mb-2 text-t11 font-bold text-ink">{title}</div>
      {children}
    </div>
  );
}

export function IncomingTab({ data }: { data: OpsPayload }) {
  const { grn, indents } = data;
  const plant = indents.filter((i) => i.machineCode && i.status === "approved");

  return (
    <div>
      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#EFF5FB] px-3 py-2 text-t9 text-muted">
        Incoming coordination — what is arriving on site. GFC drawings (Engineering), subcontractor work orders
        (Subcontracts), and open QA snags/NCRs are coordinated in their owning modules; the ops-owned material +
        plant streams are shown here.
      </div>

      <Card title="Material received — GRN register (source: Procurement) · issue from Store">
        {grn.length === 0 ? (
          <div className="text-t10 text-faint">No GRNs yet.</div>
        ) : (
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
              </tr>
            </thead>
            <tbody>
              {grn.map((g) => (
                <tr key={g.grnId}>
                  <td className="font-mono">{g.grnId}</td>
                  <td>
                    {g.poNumber}
                    <br />
                    <span className="text-t9 text-faint">{g.vendor}</span>
                  </td>
                  <td>{g.code}</td>
                  <td className="text-right">
                    {fmtQ(g.qtyReceived)}
                    {g.orderedQty ? ` / ${fmtQ(g.orderedQty)}` : ""} {g.uom}
                  </td>
                  <td className="whitespace-nowrap">{g.date}</td>
                  <td className="text-muted">{g.receivedBy}</td>
                  <td className="capitalize">{g.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Plant / machinery mobilising — approved site hire indents (→ Subcontracts)">
        {plant.length === 0 ? (
          <div className="text-t10 text-faint">No plant or machinery hire approved yet.</div>
        ) : (
          <table className="t text-t10">
            <thead>
              <tr>
                <th>Plant</th>
                <th>Indent</th>
                <th>For line</th>
                <th className="text-right">Hire</th>
                <th>Needed By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {plant.map((i) => (
                <tr key={i.id}>
                  <td>{i.machineName || i.machineCode}</td>
                  <td className="font-mono text-t9">{i.id}</td>
                  <td>{i.forCode || "—"}</td>
                  <td className="text-right">
                    {i.hireQty ? `${i.hireQty} ${i.hireUom ?? ""}` : "—"}
                    {i.estRate ? <div className="text-t9 text-faint">₹{fmtQ(i.estRate)}/{i.hireUom ?? "day"}</div> : null}
                  </td>
                  <td>{i.neededBy || "—"}</td>
                  <td style={{ color: "#854F0B" }}>Lining up · Subcontracts</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
