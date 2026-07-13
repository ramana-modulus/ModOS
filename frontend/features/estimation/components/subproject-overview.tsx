"use client";

import type { CSSProperties } from "react";
import type { EstSubProjectView } from "@/features/estimation/api";

const th: CSSProperties = { padding: "6px 10px", fontSize: "8px", color: "#9B9894", fontWeight: 500, textTransform: "uppercase" };

type SubStatus = EstSubProjectView["status"];

function statusStyle(status: SubStatus, consolidated: boolean): { color: string; label: string } {
  if (consolidated) return { color: "#185FA5", label: "✓ Sent to BD" };
  if (status === "approved") return { color: "#3B6D11", label: "✓ Approved" };
  if (status === "submitted") return { color: "#E8A020", label: "Checker Approved" };
  return { color: "#9B9894", label: "In Progress" };
}

const lakh = (n: number) => `₹${(n / 100000).toFixed(2)}L`;

export interface SubProjectOverviewProps {
  subProjects: EstSubProjectView[];
  overviewTotalIncl: number;
  onSelect: (id: string) => void;
  /** Live per-sub-project workflow status (overrides the payload snapshot). */
  statusById?: Record<string, SubStatus>;
  /** Whether the costing has been consolidated & sent to BD. */
  consolidated?: boolean;
}

/**
 * The Overview table — one row per sub-project with its unit rate (excl. GST)
 * and total (incl. GST), plus a grand-total header. Faithful port of
 * `renderSubProjectOverview`. Clicking a row drills into its costing sheet.
 */
export function SubProjectOverview({ subProjects, overviewTotalIncl, onSelect, statusById, consolidated = false }: SubProjectOverviewProps) {
  if (subProjects.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", fontSize: "11px", color: "#9B9894" }}>
        No sub-projects yet.
      </div>
    );
  }

  return (
    <div style={{ border: "0.5px solid #E8E7E4", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ background: "#1A1917", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#fff" }}>Sub-project Overview — {subProjects.length} types</span>
        <span style={{ fontSize: "10px", color: "#AAFFAA" }}>Grand Total (incl. GST): {lakh(overviewTotalIncl)}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F5F4F2" }}>
              <th style={{ ...th, textAlign: "left" }}>Sub-project / Type</th>
              <th style={{ ...th, textAlign: "left" }}>Specification</th>
              <th style={{ ...th, textAlign: "center" }}>Qty (Units)</th>
              <th style={{ ...th, textAlign: "left" }}>Consignee</th>
              <th style={{ ...th, textAlign: "right" }}>Unit Rate (excl.GST)</th>
              <th style={{ ...th, textAlign: "right" }}>Total (incl.GST)</th>
              <th style={{ ...th, textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {subProjects.map((sp, i) => {
              const st = statusStyle(statusById?.[sp.id] ?? sp.status, consolidated);
              return (
                <tr
                  key={sp.id}
                  onClick={() => onSelect(sp.id)}
                  style={{ borderBottom: "0.5px solid #F0EFED", cursor: "pointer" }}
                >
                  <td style={{ padding: "8px 10px", fontSize: "11px", fontWeight: 500, color: "#1A1917" }}>{i + 1}. {sp.name}</td>
                  <td style={{ padding: "8px 10px", fontSize: "10px", color: "#6B6A68" }}>{sp.spec || "—"}</td>
                  <td style={{ padding: "8px 10px", fontSize: "11px", fontWeight: 600, textAlign: "center", color: "#185FA5" }}>{sp.units}</td>
                  <td style={{ padding: "8px 10px", fontSize: "9px", color: "#9B9894" }}>{sp.consignee || "—"}</td>
                  <td style={{ padding: "8px 10px", fontSize: "10px", textAlign: "right", fontFamily: "monospace" }}>{lakh(sp.unitRateExcl)}</td>
                  <td style={{ padding: "8px 10px", fontSize: "10px", fontWeight: 600, textAlign: "right", fontFamily: "monospace", color: "var(--ac)" }}>{lakh(sp.totalIncl)}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "10px", background: `${st.color}18`, color: st.color, fontWeight: 600 }}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "6px 10px", background: "#F5F4F2", fontSize: "9px", color: "#9B9894" }}>
        Click any row to open that sub-project&apos;s costing sheet
      </div>
    </div>
  );
}
