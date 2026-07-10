"use client";

import type { CSSProperties } from "react";
import { fmtC } from "@/lib/format";
import { calcRow, componentTotals, grandTotals } from "@/features/estimation/domain";
import type { EstCategory, EstConfig, EstItem } from "@/features/estimation/types";

const th: CSSProperties = { padding: "6px 8px", fontSize: "8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".4px" };
const lakh1 = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

export interface SummaryTabProps {
  items: EstItem[];
  categories: EstCategory[];
  config: EstConfig;
  area: number;
  units: number;
  estType: string;
  costingSubmitted: boolean;
}

/**
 * The Summary tab — KPI strip, prime-cost component breakdown bar, per-category
 * cost table, and the assumptions box. Faithful port of `renderEstSummary`.
 * Gated on `costingSubmitted` (the prototype shows an empty state until costing
 * is submitted for review).
 */
export function SummaryTab({ items, categories, config, area, units, estType, costingSubmitted }: SummaryTabProps) {
  if (!costingSubmitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center", gap: "12px" }}>
        <div style={{ fontSize: "32px" }}>📋</div>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#1A1917" }}>Costing not yet submitted</div>
        <div style={{ fontSize: "12px", color: "#9B9894", maxWidth: "360px", lineHeight: 1.6 }}>
          Complete the costing sheet and submit for review to generate the summary, trigger the approval workflow, and notify BD.
        </div>
      </div>
    );
  }

  const pct = (n: number) => (n * 100).toFixed(0);
  const { grandTotalExcl: grandTotal, grandTotalIncl, primeCostTotal } = grandTotals(items, config);
  const { matTotal, machTotal, manTotal, transTotal, wasteTotal } = componentTotals(items, config);
  const share = (v: number) => (primeCostTotal > 0 ? ((v / primeCostTotal) * 100).toFixed(1) : "0.0");
  const sharePct = (v: number) => (primeCostTotal > 0 ? ((v / primeCostTotal) * 100).toFixed(0) : "0");
  const grandRatePerSqft = area > 0 ? `₹${((grandTotalIncl / area) as number).toFixed(0)}/sqft` : "—";

  const catRows = categories
    .map((cat) => {
      const catItems = items.filter((i) => i.cat === cat.id);
      if (!catItems.length) return null;
      const amtExcl = catItems.reduce((s, it) => s + calcRow(it, config).amtExcl, 0);
      const amtIncl = catItems.reduce((s, it) => s + calcRow(it, config).amtIncl, 0);
      const prime = catItems.reduce((s, it) => s + calcRow(it, config).prime * it.qty, 0);
      const matAmt = catItems.reduce((s, it) => s + (it.material ?? 0) * it.qty, 0);
      const machAmt = catItems.reduce((s, it) => s + (it.machinery ?? 0) * it.qty, 0);
      const manAmt = catItems.reduce((s, it) => s + (it.manpower ?? 0) * it.qty, 0);
      const transAmt = catItems.reduce((s, it) => s + calcRow(it, config).tr * it.qty, 0);
      const wasteAmt = catItems.reduce((s, it) => s + calcRow(it, config).wa * it.qty, 0);
      const p = grandTotal > 0 ? ((amtExcl / grandTotal) * 100).toFixed(1) : "0.0";
      const ratePerSqft = area > 0 ? (amtIncl / area).toFixed(0) : "—";
      const barW = grandTotal > 0 ? `${Math.min(100, Math.round((amtExcl / grandTotal) * 100))}%` : "0%";
      return { cat, amtExcl, amtIncl, prime, matAmt, machAmt, manAmt, transAmt, wasteAmt, p, ratePerSqft, barW, itemCount: catItems.length };
    })
    .filter((r): r is NonNullable<typeof r> => r != null);

  return (
    <>
      {/* KPI strip */}
      <div className="kr" style={{ gridTemplateColumns: "repeat(5,1fr)", marginBottom: "16px" }}>
        <div className="kp">
          <div className="kl">Prime Cost (excl. OH+MU)</div>
          <div className="kv">{lakh1(primeCostTotal)}</div>
          <div className="ks">per unit · material+mach+manpower+T+W</div>
        </div>
        <div className="kp">
          <div className="kl">Quoted (excl. GST)</div>
          <div className="kv cac">{lakh1(grandTotal * units)}</div>
          <div className="ks">{units > 1 ? `${units} units × ${lakh1(grandTotal)} · ` : ""}{pct(config.overheadsPct)}% OH + {pct(config.markupPct)}% markup</div>
        </div>
        <div className="kp">
          <div className="kl">Quoted (incl. GST)</div>
          <div className="kv">{lakh1(grandTotalIncl * units)}</div>
          <div className="ks">{config.gstPct}% GST{units > 1 ? ` · ${units} units` : ""}</div>
        </div>
        <div className="kp">
          <div className="kl">Project Type</div>
          <div className="kv cg" style={{ fontSize: "13px" }}>{estType}</div>
          <div className="ks">{estType === "EPC" ? "BOQ built from drawings" : "Client BOQ — fill rates"}</div>
        </div>
        <div className="kp" style={{ borderLeft: "1.5px solid #E8E7E4" }}>
          <div className="kl">No. of Units</div>
          <div className="kv">{units}</div>
          <div className="ks">{units === 1 ? "single unit / non-repeatable" : `${units} identical units`}</div>
        </div>
      </div>

      {/* Component breakdown bar */}
      <div style={{ marginBottom: "16px", padding: "12px 14px", background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: "8px" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#6B6A68", marginBottom: "8px", textTransform: "uppercase", letterSpacing: ".5px" }}>Prime Cost Breakdown</div>
        <div style={{ display: "flex", height: "18px", borderRadius: "4px", overflow: "hidden", marginBottom: "6px" }}>
          {primeCostTotal > 0 ? (
            <>
              <div style={{ width: `${share(matTotal)}%`, background: "#C84B2F" }} title={`Material ₹${fmtC(matTotal)}`} />
              <div style={{ width: `${share(machTotal)}%`, background: "#185FA5" }} title={`Machinery ₹${fmtC(machTotal)}`} />
              <div style={{ width: `${share(manTotal)}%`, background: "#3B6D11" }} title={`Manpower ₹${fmtC(manTotal)}`} />
              <div style={{ width: `${share(transTotal)}%`, background: "#E8A020" }} title={`Transport ₹${fmtC(transTotal)}`} />
              <div style={{ flex: 1, background: "#B97A0E" }} title={`Wastage ₹${fmtC(wasteTotal)}`} />
            </>
          ) : (
            <div style={{ flex: 1, background: "#F0EFED" }} />
          )}
        </div>
        <div style={{ display: "flex", gap: "16px", fontSize: "9px", color: "#6B6A68", flexWrap: "wrap" }}>
          {(
            [
              ["#C84B2F", "Material", matTotal],
              ["#185FA5", "Machinery", machTotal],
              ["#3B6D11", "Manpower", manTotal],
              ["#E8A020", "Transport", transTotal],
              ["#B97A0E", "Wastage", wasteTotal],
            ] as const
          ).map(([color, label, val]) => (
            <span key={label}>
              <span style={{ display: "inline-block", width: 8, height: 8, background: color, borderRadius: 2, marginRight: 4 }} />
              {label} ₹{fmtC(val)} ({sharePct(val)}%)
            </span>
          ))}
        </div>
      </div>

      {/* Category table */}
      <div style={{ border: "0.5px solid #E8E7E4", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <thead>
              <tr style={{ background: "#1A1917" }}>
                <th style={{ ...th, textAlign: "left", color: "#9B9894", whiteSpace: "nowrap" }}>Category</th>
                <th style={{ ...th, textAlign: "center", color: "#9B9894" }}>Discipline</th>
                <th style={{ ...th, textAlign: "center", color: "#9B9894" }}>Items</th>
                <th style={{ ...th, color: "#9B9894", minWidth: "80px" }}>Share</th>
                <th style={{ ...th, textAlign: "right", color: "#9B9894" }}>%</th>
                <th style={{ ...th, textAlign: "right", color: "#F0C9BC" }}>Material</th>
                <th style={{ ...th, textAlign: "right", color: "#AACFF0" }}>Machinery</th>
                <th style={{ ...th, textAlign: "right", color: "#B8E0C8" }}>Manpower</th>
                <th style={{ ...th, textAlign: "right", color: "#F5C892" }}>Transport</th>
                <th style={{ ...th, textAlign: "right", color: "#F5C892" }}>Wastage</th>
                <th style={{ ...th, textAlign: "right", color: "#fff" }}>Prime Cost</th>
                <th style={{ ...th, textAlign: "right", color: "#FFAA88" }}>Amt (ex.GST)</th>
                <th style={{ ...th, textAlign: "right", color: "#AAFFAA" }}>Amt (in.GST)</th>
                <th style={{ ...th, textAlign: "right", color: "#9B9894" }}>Rate/sqft</th>
              </tr>
            </thead>
            <tbody>
              {catRows.map((r) => (
                <tr key={r.cat.id} style={{ borderBottom: "0.5px solid #F0EFED" }}>
                  <td style={{ padding: "7px 8px", fontSize: "10px", fontWeight: 500, color: "#1A1917", whiteSpace: "nowrap" }}>{r.cat.label}</td>
                  <td style={{ padding: "7px 8px", fontSize: "9px", color: "#9B9894", textAlign: "center" }}>{r.cat.discipline}</td>
                  <td style={{ padding: "7px 8px", fontSize: "9px", color: "#6B6A68", textAlign: "center" }}>{r.itemCount}</td>
                  <td style={{ padding: "7px 8px" }}>
                    <div style={{ background: "#F0EFED", borderRadius: "3px", height: "5px", overflow: "hidden", minWidth: "60px" }}>
                      <div style={{ width: r.barW, height: "100%", background: "var(--ac)", borderRadius: "3px" }} />
                    </div>
                  </td>
                  <td style={{ padding: "7px 8px", fontSize: "9px", color: "#9B9894", textAlign: "right" }}>{r.p}%</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", color: "#C84B2F", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(r.matAmt)}</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", color: "#185FA5", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(r.machAmt)}</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", color: "#3B6D11", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(r.manAmt)}</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", color: "#854F0B", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(r.transAmt)}</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", color: "#854F0B", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(r.wasteAmt)}</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", fontWeight: 600, color: "#1A1917", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(r.prime)}</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", fontWeight: 600, color: "var(--ac)", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(r.amtExcl)}</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", fontWeight: 600, color: "#1A1917", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(r.amtIncl)}</td>
                  <td style={{ padding: "7px 8px", fontSize: "10px", color: "#6B6A68", textAlign: "right" }}>{r.ratePerSqft !== "—" ? "₹" + r.ratePerSqft : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#EAF3DE", fontWeight: 600 }}>
                <td style={{ padding: "7px 8px", fontSize: "10px", color: "#3B6D11" }} colSpan={5}>Grand Total (excl. GST)</td>
                <td style={{ padding: "7px 8px", fontSize: "10px", color: "#C84B2F", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(matTotal)}</td>
                <td style={{ padding: "7px 8px", fontSize: "10px", color: "#185FA5", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(machTotal)}</td>
                <td style={{ padding: "7px 8px", fontSize: "10px", color: "#3B6D11", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(manTotal)}</td>
                <td style={{ padding: "7px 8px", fontSize: "10px", color: "#854F0B", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(transTotal)}</td>
                <td style={{ padding: "7px 8px", fontSize: "10px", color: "#854F0B", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(wasteTotal)}</td>
                <td style={{ padding: "7px 8px", fontSize: "11px", fontWeight: 700, color: "#1A1917", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(primeCostTotal)}</td>
                <td style={{ padding: "7px 8px", fontSize: "11px", fontWeight: 700, color: "var(--ac)", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(grandTotal)}</td>
                <td colSpan={2} />
              </tr>
              <tr style={{ background: "#1A1917", fontWeight: 700 }}>
                <td style={{ padding: "8px 8px", fontSize: "10px", color: "#fff" }} colSpan={11}>Grand Total (incl. GST @ {config.gstPct}%){units > 1 ? ` · ${units} units` : ""}</td>
                <td />
                <td style={{ padding: "8px 8px", fontSize: "13px", fontWeight: 700, color: "#AAFFAA", textAlign: "right", fontFamily: "monospace" }}>₹{fmtC(grandTotalIncl * units)}</td>
                <td style={{ padding: "8px 8px", fontSize: "10px", color: "#9B9894", textAlign: "right" }}>{grandRatePerSqft}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Assumptions box */}
      <div style={{ padding: "10px 14px", background: "#F5F4F2", borderRadius: "8px", fontSize: "10px", color: "#6B6A68", display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <span>Transport: <strong>{pct(config.transportPct)}%</strong></span>
        <span>Wastage: <strong>{pct(config.wastagePct)}%</strong></span>
        <span>Overheads: <strong>{pct(config.overheadsPct)}%</strong></span>
        <span>Markup: <strong>{pct(config.markupPct)}%</strong></span>
        <span>GST: <strong>{config.gstPct}%</strong></span>
        {area > 0 && <span>Floor Area: <strong>{area.toLocaleString("en-IN")} sqft</strong></span>}
        <span>No. of Units: <strong>{units}</strong></span>
      </div>
    </>
  );
}
