"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { fmtC, fmtR } from "@/lib/format";
import { calcRow, categoryTotals, groupByCategory } from "@/features/estimation/domain";
import type { EstCategory, EstConfig, EstItem } from "@/features/estimation/types";
import { LIB_ITEMS } from "@/features/library/data";
import type { LibItem } from "@/features/library/types";

/** Estimation-category id → Item-Library category id(s) (prototype `catMap`). */
const CAT_MAP: Record<string, string[]> = {
  SS: ["SS"], FW: ["FW"], WS: ["WC"], RF: ["RO"], FN: ["FN"], FL: ["FL"], FC: ["FC"],
  FU: ["FU"], RD: ["EX"], LN: ["EX"], EL: ["EL"], AC: ["HV"], PL: ["PL", "FX"], FF: ["FI"],
};

/** Library items keyed by code — the source for the BOM drilldown + add picker. */
const LIB_BY_CODE = new Map<string, LibItem>(LIB_ITEMS.map((li) => [li.code, li]));

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

/** Searchable per-(sub)category picker that adds a library item to the sheet.
 * The dropdown is rendered in a portal (fixed-positioned over the input) so it
 * floats above the rows below instead of being clipped by the table's scroll
 * container's `overflow:auto`. */
function AddLinePicker({ available, label, onAdd }: { available: LibItem[]; label: string; onAdd: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string>("");
  const [coords, setCoords] = useState<{ left: number; top: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Track the input box's viewport position while the dropdown is open — capture
  // scroll so the inner table's scrolling repositions (or would re-clip) it too.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = boxRef.current?.getBoundingClientRect();
      if (r) setCoords({ left: r.left, top: r.bottom + 2, width: r.width });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  const query = q.trim().toLowerCase();
  const filtered = query ? available.filter((li) => `${li.code} ${li.name}`.toLowerCase().includes(query)) : available;

  const choose = (li: LibItem) => {
    setSel(li.code);
    setQ(`${li.code} · ${li.name}`);
    setOpen(false);
  };
  const add = () => {
    if (!sel) return;
    onAdd(sel);
    setSel("");
    setQ("");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div ref={boxRef} style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", border: "0.5px solid #D8D7D4", borderRadius: 4, background: "#fff" }}>
          <span style={{ fontSize: 10, color: "#9B9894", padding: "0 5px" }}>🔍</span>
          <input
            value={q}
            placeholder={`+ Add line item — search ${available.length} ${label} item${available.length === 1 ? "" : "s"}`}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onChange={(e) => { setQ(e.target.value); setSel(""); setOpen(true); }}
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", fontSize: 10, padding: "4px 2px", background: "transparent", color: "#1A1917" }}
          />
        </div>
      </div>
      <button
        type="button"
        disabled={!sel}
        onClick={add}
        className="tbb"
        style={{
          fontSize: 10, padding: "3px 10px", whiteSpace: "nowrap",
          ...(sel
            ? { background: "var(--ac)", color: "#fff", borderColor: "var(--ac)" }
            : { background: "#D8D7D4", color: "#fff", borderColor: "#D8D7D4", cursor: "not-allowed" }),
        }}
      >
        Add
      </button>
      {mounted && open && coords && filtered.length > 0 &&
        createPortal(
          <div
            style={{ position: "fixed", left: coords.left, top: coords.top, width: coords.width, maxHeight: 260, overflowY: "auto", background: "#fff", border: "0.5px solid #D8D7D4", borderRadius: 4, boxShadow: "0 6px 18px rgba(0,0,0,0.14)", zIndex: 9999 }}
          >
            {filtered.map((li) => (
              <div
                key={li.code}
                onMouseDown={(e) => { e.preventDefault(); choose(li); }}
                style={{ padding: "6px 9px", cursor: "pointer", fontSize: 10, borderBottom: "0.5px solid #F0EFED", lineHeight: 1.35 }}
              >
                <span style={{ fontFamily: "monospace", color: "#185FA5" }}>{li.code}</span>{" "}
                <span style={{ color: "#1A1917" }}>{li.name}</span>{" "}
                <span style={{ color: "#9B9894" }}>· {li.uom}</span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

export interface CostingSheetProps {
  items: EstItem[];
  categories: EstCategory[];
  config: EstConfig;
  /** Project floor area (sqft) for the per-category rate/sqft. */
  area: number;
  /** Read-only status banner shown above the table. */
  statusBanner?: ReactNode;
  /** Extra controls rendered on the header row's right (e.g. Submit for Review). */
  headerActions?: ReactNode;
}

/**
 * The dense BOQ costing spreadsheet (`.est-table`) — port of `renderEstSheet`.
 * Rows grouped by category → sub-category, a config percentage row, per-category
 * header totals and two grand-total rows. Each line item that resolves to an
 * Item-Library item can be expanded ("+") to reveal its BOM breakdown, and every
 * (sub)category carries a searchable "+ Add line item" picker sourced from the
 * Item Libraries.
 */
export function CostingSheet({ items, categories, config, area, statusBanner, headerActions }: CostingSheetProps) {
  const cols = columns(config);
  const [sheetItems, setSheetItems] = useState<EstItem[]>(items);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState(false);

  // ESC exits Focus Mode (mirrors the prototype's zoom-bar / ESC handler).
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFocus(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  const toggleRow = (code: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const addItem = (catId: string, code: string) => {
    const li = LIB_BY_CODE.get(code);
    if (!li) return;
    setSheetItems((prev) => [
      ...prev,
      {
        sno: "",
        cat: catId,
        subcat: li.groupLabel || "Added items",
        code: li.code,
        desc: li.name,
        unit: li.uom,
        qty: li.stdQty || 1,
        material: li.matRate ?? null,
        machinery: li.machRate ?? null,
        manpower: li.manRate ?? null,
        transport: null,
        wastage: null,
        gst: config.gstPct,
        remarks: "",
      },
    ]);
  };

  const grouped = groupByCategory(sheetItems, categories);
  const catTotals = categoryTotals(grouped, categories, config);
  const grandTotal = Object.values(catTotals).reduce((s, v) => s + v, 0);
  const grandTotalIncl = sheetItems.reduce((s, it) => s + calcRow(it, config).amtIncl, 0);
  const totalW = cols.reduce((s, c) => s + parseInt(c.w, 10), 0);
  const descIdx = cols.findIndex((c) => c.h === "Description");
  const existingCodes = sheetItems.map((i) => i.code);

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

  // BOM drilldown rows for one line item, sourced from its library entry.
  const bomRows = (it: EstItem, li: LibItem): ReactNode[] => {
    const out: ReactNode[] = [];
    const groups: [LibItem["bom"][number]["type"], string, string][] = [
      ["material", "MATERIAL", "#FAF0EC"],
      ["machinery", "MACHINERY", "#F0F6FF"],
      ["manpower", "MAN POWER", "#F0FAF4"],
    ];
    groups.forEach(([type, tlabel, bg]) => {
      const comps = li.bom.filter((b) => b.type === type);
      if (!comps.length) return;
      out.push(
        <tr key={`bomhdr-${it.code}-${type}`} style={{ background: bg }}>
          <td style={sticky(0, bg)} />
          <td style={sticky(32, bg)} />
          <td style={{ ...sticky(94, bg), borderRight: "2px solid #E0DFDC", fontSize: "8px", fontWeight: 700, color: "#9B9894", letterSpacing: ".8px", paddingLeft: "36px" }}>{tlabel}</td>
          <td colSpan={19} />
        </tr>
      );
      comps.forEach((b, bi) => {
        const total = (b.qty * b.rate).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        out.push(
          <tr key={`bom-${it.code}-${type}-${bi}`} style={{ borderBottom: "0.5px solid #F0EFED" }}>
            <td style={{ background: bg }} />
            <td style={{ background: bg, padding: "4px 7px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "8px", color: "#185FA5", background: "#E6F1FB", padding: "1px 5px", borderRadius: "2px" }}>{b.bomCode || "—"}</span>
            </td>
            <td style={{ background: bg, fontSize: "10px", color: "#4A4A48", paddingLeft: "36px" }}>{b.name}</td>
            <td style={{ textAlign: "center", fontSize: "9px", color: "#9B9894", background: bg }}>{b.unit}</td>
            <td className="num" style={{ color: "var(--ac)", background: bg }}>{b.qty}</td>
            <td className="num" style={{ color: "#6B6A68", background: bg }}>₹{b.rate.toLocaleString("en-IN")}</td>
            <td className="num" style={{ background: bg, fontWeight: 600, color: DARK }}>{type === "material" ? `₹${total}` : ""}</td>
            <td className="num" style={{ background: bg, fontWeight: 600, color: DARK }}>{type === "machinery" ? `₹${total}` : ""}</td>
            <td className="num" style={{ background: bg, fontWeight: 600, color: DARK }}>{type === "manpower" ? `₹${total}` : ""}</td>
            <td colSpan={13} style={{ background: bg }} />
          </tr>
        );
      });
    });
    out.push(
      <tr key={`bomfoot-${it.code}`}>
        <td style={sticky(0, "#F5F4F2")} />
        <td style={sticky(32, "#F5F4F2")} />
        <td style={{ ...sticky(94, "#F5F4F2"), borderRight: "2px solid #E0DFDC", textAlign: "center", cursor: "pointer", fontSize: "9px", color: "#9B9894" }} onClick={() => toggleRow(it.code)}>▲ Collapse</td>
        <td colSpan={19} onClick={() => toggleRow(it.code)} style={{ textAlign: "center", padding: "4px", background: "#F5F4F2", cursor: "pointer", fontSize: "9px", color: "#9B9894", borderBottom: "0.5px solid #E8E7E4" }}>BOM</td>
      </tr>
    );
    return out;
  };

  // A "+ Add line item" / "All line items added" row for a (sub)category.
  const pickerRow = (key: string, catId: string, label: string, avail: LibItem[]): ReactNode => (
    <tr key={key}>
      <td style={sticky(0, "#FAFAF9")} />
      <td style={sticky(32, "#FAFAF9")} />
      <td style={{ ...sticky(94, "#FAFAF9", 3), borderRight: "2px solid #E0DFDC", padding: "5px 4px", overflow: "visible" }}>
        {avail.length === 0 ? (
          <span style={{ fontSize: "10px", color: "#C8C6C3" }}>All line items added</span>
        ) : (
          <AddLinePicker available={avail} label={label} onAdd={(code) => addItem(catId, code)} />
        )}
      </td>
      <td colSpan={19} style={{ background: "#FAFAF9", borderBottom: "0.5px solid #F0EFED" }} />
    </tr>
  );

  const bodyRows: ReactNode[] = [];

  categories.forEach((cat) => {
    const catItems = grouped[cat.id] ?? [];
    const isEmpty = catItems.length === 0;
    const catAmtInclHdr = catItems.reduce((s, it) => s + calcRow(it, config).amtIncl, 0);
    const catRateSqftHdr = area > 0 ? (catAmtInclHdr / area).toFixed(0) : "—";
    const libCats = CAT_MAP[cat.id] ?? [];

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
      // Empty category: offer every available library item in the category.
      const avail = LIB_ITEMS.filter((li) => libCats.includes(li.cat) && !existingCodes.includes(li.code));
      bodyRows.push(pickerRow(`pick-${cat.id}`, cat.id, cat.label, avail));
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
        const li = LIB_BY_CODE.get(it.code);
        const hasBOM = !!li && li.bom.length > 0;
        const isOpen = expanded.has(it.code);
        bodyRows.push(
          <tr key={`it-${it.code}-${it.sno}`} className={"est-item-row" + (isHL ? " hl" : "")}>
            <td style={{ textAlign: "center", color: "#9B9894", fontSize: "9px", fontFamily: "monospace" }}>{it.sno}</td>
            <td>
              <ItemCode code={it.code} />
            </td>
            <td style={{ fontSize: "10px", color: DARK, paddingLeft: it.sno.includes(".") ? "16px" : "8px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {hasBOM ? (
                  <span
                    onClick={() => toggleRow(it.code)}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: 3, background: isOpen ? "var(--ac)" : "#E8E7E4", color: isOpen ? "#fff" : "#6B6A68", fontSize: 10, fontWeight: 700, cursor: "pointer", marginRight: 4, flexShrink: 0 }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                ) : (
                  <span style={{ display: "inline-block", width: 15, marginRight: 4 }} />
                )}
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
        if (isOpen && hasBOM && li) bodyRows.push(...bomRows(it, li));
      });

      // Per-subcategory add-line picker (available library items in this sub-group).
      const availSub = LIB_ITEMS.filter((li) => libCats.includes(li.cat) && li.groupLabel === sub && !existingCodes.includes(li.code));
      bodyRows.push(pickerRow(`pick-${cat.id}-${sub}`, cat.id, sub, availSub));
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
        <span className="text-t10 text-faint">All categories shown · Add line items per sub-category · expand a row for its BOM</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span className="text-t10 text-faint">
            Transport {pct(config.transportPct)}% · Wastage {pct(config.wastagePct)}% · OH {pct(config.overheadsPct)}% · Markup {pct(config.markupPct)}% · GST {config.gstPct}%
          </span>
          <button type="button" className="tbb" style={{ fontSize: 10 }} onClick={() => setFocus((f) => !f)}>
            ⛶ {focus ? "Exit Focus" : "Focus Mode"}
          </button>
          {headerActions}
          {statusBanner}
        </div>
      </div>
      <div
        id="est-outer"
        className={focus ? "zoom-mode" : undefined}
        style={focus ? { height: "calc(100vh - 44px)", overflow: "auto" } : { flex: 1, minHeight: 0, width: "100%", border: "0.5px solid #333", borderRadius: "8px", overflow: "auto" }}
      >
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
      {focus &&
        typeof document !== "undefined" &&
        createPortal(
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 40, zIndex: 201, background: "rgba(26,25,23,0.95)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, borderTop: "0.5px solid #3a3936" }}>
            <strong style={{ color: "#fff", fontSize: 11 }}>Costing Sheet — Focus Mode</strong>
            <span style={{ color: "#9B9894", fontSize: 10 }}>Press ESC to exit</span>
            <button type="button" onClick={() => setFocus(false)} style={{ marginLeft: "auto", fontSize: 10, padding: "4px 12px", borderRadius: 5, border: "0.5px solid #555", background: "transparent", color: "#fff", cursor: "pointer" }}>
              ⤫ Exit Focus Mode
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
