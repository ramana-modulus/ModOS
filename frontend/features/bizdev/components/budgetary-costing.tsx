"use client";

import { useState } from "react";
import type { LeadView } from "@/features/bizdev/types";
import {
  BQ_MARKUP_PCT,
  getBudgetaryItems,
  type BudgetaryLineItem,
} from "@/features/library/data/budgetary";

const MU = 1 + BQ_MARKUP_PCT / 100;
const lakh = (n: number) => `₹${(n / 100000).toFixed(2)}L`;

/**
 * Enquiry-stage budgetary costing calculator (prototype `renderBQTool`).
 *
 * Defaults (line items + prime rates) are inherited from the shared Item
 * Libraries budgetary rate card for the lead's primary technology
 * (getBudgetaryItems) — the same data surfaced under Item Libraries → Line
 * Items → Budgetary Costing. Rates, floor area and inclusion are then editable
 * per lead. Quoted = prime × (1 + markup).
 */
export function BudgetaryCosting({ lead }: { lead: LeadView }) {
  const tech = lead.tech[0] || "PEB";
  const [items, setItems] = useState<BudgetaryLineItem[]>(() => getBudgetaryItems(tech));
  const [fa, setFa] = useState<number>(lead.area || 5000);

  const patch = (idx: number, next: Partial<BudgetaryLineItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...next } : it)));

  const totPrime = items.filter((i) => i.sel).reduce((s, i) => s + i.rate * fa, 0);
  const totQuoted = Math.round(totPrime * MU);
  const psf = fa > 0 ? Math.round(totQuoted / fa) : 0;

  return (
    <div className="bq-tool">
      <div className="bq-hdr">
        <div className="bq-title">Budgetary Costing — {tech}</div>
        <div style={{ fontSize: "9px", color: "#9B9894" }}>{BQ_MARKUP_PCT}% markup · Indicative rates</div>
      </div>

      <div className="fa-inp-row">
        <span style={{ fontSize: "10px", color: "#6B6A68" }}>Floor Area</span>
        <input
          className="fa-inp"
          type="number"
          value={fa}
          onChange={(e) => setFa(parseFloat(e.target.value) || 0)}
        />
        <span style={{ fontSize: "10px", color: "#9B9894" }}>sqft</span>
        <span style={{ marginLeft: "auto", fontSize: "9px", color: "#9B9894" }}>
          Edit rates & check/uncheck items as needed
        </span>
      </div>

      <table className="bq-table">
        <thead>
          <tr>
            <th style={{ width: "22px" }} />
            <th style={{ width: "48px" }}>Code</th>
            <th>Line Item</th>
            <th className="r">Unit</th>
            <th className="r" style={{ width: "64px" }}>Prime/sqft</th>
            <th className="r" style={{ width: "64px" }}>Quoted/sqft</th>
            <th className="r" style={{ width: "72px" }}>Prime Cost</th>
            <th className="r" style={{ width: "72px" }}>Quoted Amt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => {
            const amt = it.sel ? it.rate * fa : 0;
            const qa = it.sel ? Math.round(amt * MU) : 0;
            return (
              <tr key={it.code}>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    className="bq-check"
                    checked={it.sel}
                    onChange={(e) => patch(i, { sel: e.target.checked })}
                  />
                </td>
                <td style={{ fontFamily: "monospace", fontSize: "9px", color: "#9B9894" }}>{it.code}</td>
                <td style={{ fontSize: "10px", fontWeight: 500, color: "#1A1917" }}>{it.name}</td>
                <td className="r">sqft</td>
                <td className="r">
                  <input
                    className="bq-inp"
                    value={it.rate}
                    onChange={(e) => patch(i, { rate: parseFloat(e.target.value) || 0 })}
                  />
                </td>
                <td className="r" style={{ color: "var(--ac)", fontWeight: 600 }}>
                  {it.sel ? Math.round(it.rate * MU) : "—"}
                </td>
                <td className="r" style={{ fontWeight: 600 }}>{it.sel ? lakh(amt) : "—"}</td>
                <td className="r" style={{ color: "var(--ac)", fontWeight: 600 }}>{it.sel ? lakh(qa) : "—"}</td>
              </tr>
            );
          })}
          <tr className="bq-total-row">
            <td colSpan={4} style={{ textAlign: "right", fontSize: "9px", textTransform: "uppercase", letterSpacing: ".4px" }}>
              Total
            </td>
            <td className="r">—</td>
            <td className="r">₹{psf}/sqft</td>
            <td className="r">{lakh(totPrime)}</td>
            <td className="r">{lakh(totQuoted)}</td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          padding: "8px 12px",
          background: "#F5F4F2",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          borderTop: "0.5px solid #E8E7E4",
        }}
      >
        <button type="button" className="tbb p" style={{ fontSize: "10px" }}>↓ Download PDF</button>
        <button type="button" className="tbb" style={{ fontSize: "10px" }}>Share via link</button>
        <span style={{ marginLeft: "auto", fontSize: "10px", color: "#6B6A68" }}>
          Quoted: <strong style={{ color: "#1A1917" }}>{lakh(totQuoted)}</strong> · ₹{psf}/sqft all-in
        </span>
      </div>
    </div>
  );
}
