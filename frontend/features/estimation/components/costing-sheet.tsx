"use client";

import type { CSSProperties, ReactNode } from "react";
import { fmtC, fmtR } from "@/lib/format";
import { calcRow, categoryTotals, groupByCategory } from "@/features/estimation/domain";
import type { EstCategory, EstConfig, EstItem } from "@/features/estimation/types";

interface Col {
  h: string;
  w: string;
}

/** The 22 columns of the dense BOQ costing sheet. */
function columns(cfg: EstConfig): Col[] {
  const pct = (n: number) => (n * 100).toFixed(0);
  return [
    { h: "Sr.", w: "32px" },
    { h: "Code", w: "62px" },
    { h: "Description", w: "220px" },
    { h: "Unit", w: "38px" },
    { h: "Qty", w: "52px" },
    { h: "Rate", w: "56px" },
    { h: "Material\n₹", w: "68px" },
    { h: "Machinery\n₹", w: "68px" },
    { h: "Manpower\n₹", w: "68px" },
    { h: `Transport\n(${pct(cfg.transportPct)}%)`, w: "56px" },
    { h: `Wastage\n(${pct(cfg.wastagePct)}%)`, w: "52px" },
    { h: "Prime\nCost", w: "64px" },
    { h: `OH\n(${pct(cfg.overheadsPct)}%)`, w: "52px" },
    { h: `Markup\n(${pct(cfg.markupPct)}%)`, w: "56px" },
    { h: "Rate\n(ex.GST)", w: "64px" },
    { h: "Amt\n(ex.GST)", w: "72px" },
    { h: `Rate\n(in.GST ${cfg.gstPct}%)`, w: "64px" },
    { h: "Amt\n(in.GST)", w: "72px" },
    { h: "Cat. Amt\n(in.GST)", w: "80px" },
    { h: "Cat. Rate\n/sqft", w: "72px" },
    { h: "Remarks", w: "120px" },
    { h: "Link", w: "60px" },
  ];
}

const DARK = "#1A1917";
const sticky = (left: number, bg: string, z = 2): CSSProperties => ({ position: "sticky", left, zIndex: z, background: bg });

function ItemCode({ code }: { code: string }) {
  return <span className={code === "SS-1001" ? "ict ss" : "ict"}>{code}</span>;
}

export interface CostingSheetProps {
  items: EstItem[];
  categories: EstCategory[];
  config: EstConfig;
  /** Project floor area (sqft) for the per-category rate/sqft. */
  area: number;
  /** Read-only status banner shown above the table. */
  statusBanner?: ReactNode;
}

/**
 * The dense, read-only BOQ costing spreadsheet (`.est-table`). Faithful port of
 * `renderEstSheet`: rows grouped by category (with sub-category rows), a config
 * percentage row, per-category header totals, and two grand-total rows. Inline
 * cell editing and the BOM drilldown are intentionally omitted (see brief).
 */
export function CostingSheet({ items, categories, config, area, statusBanner }: CostingSheetProps) {
  const cols = columns(config);
  const grouped = groupByCategory(items, categories);
  const catTotals = categoryTotals(grouped, categories, config);
  const grandTotal = Object.values(catTotals).reduce((s, v) => s + v, 0);
  const grandTotalIncl = items.reduce((s, it) => s + calcRow(it, config).amtIncl, 0);
  const totalW = cols.reduce((s, c) => s + parseInt(c.w, 10), 0);
  const descIdx = cols.findIndex((c) => c.h === "Description");

  const pct = (n: number) => (n * 100).toFixed(0);

  // Config percentage row (read-only) — dark-green cells with the active rates.
  const pctCellStyle: CSSProperties = { textAlign: "center", background: "#1E2A1E", color: "#AAFFAA", fontWeight: 700, fontSize: "9px", padding: "3px 4px" };
  const pctRow = (
    <tr style={{ background: "#1E2A1E" }}>
      <td style={sticky(0, "#1E2A1E", 4)} />
      <td style={sticky(32, "#1E2A1E", 4)} />
      <td style={{ ...sticky(94, "#1E2A1E", 4), borderRight: "2px solid #555" }} />
      <td colSpan={6} style={{ background: "#1E2A1E" }} />
      <td style={pctCellStyle}>{pct(config.transportPct)}</td>
      <td style={pctCellStyle}>{pct(config.wastagePct)}</td>
      <td style={{ background: "#1E2A1E" }} />
      <td style={pctCellStyle}>{pct(config.overheadsPct)}</td>
      <td style={pctCellStyle}>{pct(config.markupPct)}</td>
      <td style={{ background: "#1E2A1E" }} />
      <td style={{ background: "#1E2A1E" }} />
      <td style={pctCellStyle}>{config.gstPct.toFixed(0)}</td>
      <td colSpan={4} style={{ background: "#1E2A1E" }} />
    </tr>
  );

  const bodyRows: ReactNode[] = [];

  categories.forEach((cat) => {
    const catItems = grouped[cat.id] ?? [];
    const isEmpty = catItems.length === 0;
    const catAmtInclHdr = catItems.reduce((s, it) => s + calcRow(it, config).amtIncl, 0);
    const catRateSqftHdr = area > 0 ? (catAmtInclHdr / area).toFixed(0) : "—";

    // Category header
    bodyRows.push(
      <tr key={`cat-${cat.id}`} className="est-cat-row">
        <td style={sticky(0, DARK)} />
        <td style={sticky(32, DARK)} />
        <td style={{ ...sticky(94, DARK), borderRight: "2px solid #555", textTransform: "uppercase", letterSpacing: ".8px" }}>
          {cat.label}
          <span style={{ fontSize: "9px", fontWeight: 400, opacity: 0.6, marginLeft: "8px", textTransform: "none" }}>{cat.discipline}</span>
        </td>
        <td colSpan={15} />
        <td className="num" style={{ color: "#AAFFAA", fontSize: "11px" }}>{isEmpty ? "—" : "₹" + fmtC(catAmtInclHdr)}</td>
        <td className="num" style={{ color: "#C8E6C9", fontSize: "10px" }}>{catRateSqftHdr !== "—" ? "₹" + catRateSqftHdr : "—"}</td>
        <td colSpan={2} />
      </tr>
    );

    if (isEmpty) {
      bodyRows.push(
        <tr key={`empty-${cat.id}`}>
          <td style={sticky(0, "#fff")} />
          <td style={sticky(32, "#fff")} />
          <td style={{ ...sticky(94, "#fff"), borderRight: "2px solid #E0DFDC", fontSize: "10px", color: "#C8C6C3", fontStyle: "italic", padding: "7px 8px" }}>
            No line items — category not applicable for this project
          </td>
          <td colSpan={19} style={{ borderBottom: "0.5px solid #F0EFED" }} />
        </tr>
      );
      return;
    }

    const subcats = [...new Set(catItems.map((i) => i.subcat))];
    subcats.forEach((sub) => {
      const subItems = catItems.filter((i) => i.subcat === sub);
      if (subcats.length > 1) {
        bodyRows.push(
          <tr key={`sub-${cat.id}-${sub}`} className="est-sub-row">
            <td style={sticky(0, "#F5F4F2")} />
            <td style={sticky(32, "#F5F4F2")} />
            <td style={{ ...sticky(94, "#F5F4F2"), borderRight: "2px solid #E0DFDC", paddingLeft: "4px" }}>{sub}</td>
            <td colSpan={19} />
          </tr>
        );
      }
      subItems.forEach((it) => {
        const c = calcRow(it, config);
        const isHL = it.code === "SS-1001";
        bodyRows.push(
          <tr key={`it-${it.code}-${it.sno}`} className={"est-item-row" + (isHL ? " hl" : "")}>
            <td style={{ textAlign: "center", color: "#9B9894", fontSize: "9px", fontFamily: "monospace" }}>{it.sno}</td>
            <td>
              <ItemCode code={it.code} />
            </td>
            <td style={{ fontSize: "10px", color: DARK, paddingLeft: it.sno.includes(".") ? "16px" : "8px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ display: "inline-block", width: 15, marginRight: 4 }} />
                {it.desc}
              </div>
            </td>
            <td style={{ textAlign: "center", color: "#6B6A68" }}>{it.unit}</td>
            <td className="num editable" style={{ color: "var(--ac)" }}>{it.qty}</td>
            <td className="num" style={{ color: "#9B9894", fontStyle: "italic", fontSize: "9px" }} />
            <td className="num editable">{it.material != null ? fmtR(it.material) : "—"}</td>
            <td className="num editable">{it.machinery != null ? fmtR(it.machinery) : "—"}</td>
            <td className="num editable">{it.manpower != null ? fmtR(it.manpower) : "—"}</td>
            <td className="num" style={{ color: "#9B9894" }}>{fmtR(c.tr)}</td>
            <td className="num" style={{ color: "#9B9894" }}>{fmtR(c.wa)}</td>
            <td className="num" style={{ fontWeight: 600, color: DARK }}>{fmtR(c.prime)}</td>
            <td className="num" style={{ color: "#6B6A68" }}>{fmtR(c.oh)}</td>
            <td className="num" style={{ color: "#6B6A68" }}>{fmtR(c.mu)}</td>
            <td className="num" style={{ fontWeight: 600, color: "var(--ac)" }}>{fmtR(c.rateExcl)}</td>
            <td className="num" style={{ fontWeight: 600, color: "var(--ac)" }}>{fmtC(c.amtExcl)}</td>
            <td className="num">{fmtR(c.rateIncl)}</td>
            <td className="num">{fmtC(c.amtIncl)}</td>
            <td />
            <td />
            <td className="editable" style={{ fontSize: "9px", color: "#9B9894" }}>{it.remarks || ""}</td>
            <td className="editable" style={{ fontSize: "9px", color: "#185FA5", textDecoration: "underline" }}>{it.link || ""}</td>
          </tr>
        );
      });
    });
  });

  // Grand totals — colspans replicate the prototype's row structure exactly.
  bodyRows.push(
    <tr key="grand-excl" className="est-grand-row">
      <td style={sticky(0, DARK)} />
      <td style={sticky(32, DARK)} />
      <td style={{ ...sticky(94, DARK), borderRight: "2px solid #444", textAlign: "right", letterSpacing: ".8px", textTransform: "uppercase", fontSize: "10px", paddingRight: "8px" }}>
        Grand Total (excl. GST)
      </td>
      <td colSpan={13} />
      <td className="num" style={{ color: "#fff" }}>₹{fmtC(grandTotal)}</td>
      <td />
      <td colSpan={5} style={{ color: "#9B9894", fontSize: "9px" }}>
        OH: {pct(config.overheadsPct)}% · Markup: {pct(config.markupPct)}%
      </td>
    </tr>
  );
  bodyRows.push(
    <tr key="grand-incl" className="est-grand-row">
      <td style={sticky(0, DARK)} />
      <td style={sticky(32, DARK)} />
      <td style={{ ...sticky(94, DARK), borderRight: "2px solid #444", textAlign: "right", letterSpacing: ".8px", textTransform: "uppercase", fontSize: "10px", paddingRight: "8px" }}>
        Grand Total (incl. GST @ {config.gstPct}%)
      </td>
      <td colSpan={13} />
      <td />
      <td />
      <td className="num" style={{ color: "#AAFFAA" }}>₹{fmtC(grandTotalIncl)}</td>
      <td colSpan={4} />
    </tr>
  );

  return (
    <>
      <div style={{ marginBottom: "5px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span className="text-t10 text-faint">All categories shown · read-only costing view</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="text-t10 text-faint">
            Transport {pct(config.transportPct)}% · Wastage {pct(config.wastagePct)}% · OH {pct(config.overheadsPct)}% · Markup {pct(config.markupPct)}% · GST {config.gstPct}%
          </span>
          {statusBanner}
        </div>
      </div>
      <div id="est-outer" style={{ flex: 1, minHeight: 0, width: "100%", border: "0.5px solid #333", borderRadius: "8px", overflow: "auto" }}>
        <table className="est-table" style={{ width: "100%", minWidth: `${totalW}px`, tableLayout: "auto" }}>
          <colgroup>
            {cols.map((c, i) => (
              <col key={i} style={{ width: i === descIdx ? "100%" : c.w }} />
            ))}
          </colgroup>
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr>
              {cols.map((c, i) => (
                <th key={i}>{c.h}</th>
              ))}
            </tr>
            {pctRow}
          </thead>
          <tbody>{bodyRows}</tbody>
        </table>
      </div>
    </>
  );
}
