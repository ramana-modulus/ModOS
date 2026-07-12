"use client";

import { Fragment, useState } from "react";
import { IconHistory } from "@tabler/icons-react";
import type { LibCategory, LibItem } from "@/features/library/types";
import { calcTotalRate } from "@/features/library/types";
import type { BudgetaryLineItem } from "@/features/library/data/budgetary";
import { BQ_MARKUP_PCT, BQ_TECHS, quotedRate } from "@/features/library/data/budgetary";
import { fmtR } from "@/lib/format";

const GRID = "18px 90px 1fr 90px 82px 52px 62px 56px 90px 90px 80px 72px 56px 90px 80px";
const catColor = (id: string) => (id === "FW" ? "#2A4A7F" : id === "SS" ? "#5C3A0A" : id === "RO" ? "#1A5C2A" : "#2A2A2A");

const TH = "px-1.5 py-[5px] text-t9 font-medium uppercase tracking-[0.4px]";

function TypePill({ type }: { type: string }) {
  return type === "Engineered" ? (
    <span className="rounded border-[0.5px] border-[#E8B86D] bg-[#FFF0D4] px-1.5 py-0.5 text-t8 font-semibold text-[#7A3B00]">Engineered</span>
  ) : (
    <span className="rounded border-[0.5px] border-[#B8D4F0] bg-info-soft px-1.5 py-0.5 text-t8 font-semibold text-info">Bought-out</span>
  );
}

export function LineItemsTab({
  items,
  categories,
  activeCat,
  budgetary,
}: {
  items: LibItem[];
  categories: LibCategory[];
  activeCat: string;
  budgetary: Record<string, BudgetaryLineItem[]>;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (code: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const cats = activeCat === "All" ? categories : categories.filter((c) => c.id === activeCat);
  const bomSections: [string, string, string][] = [
    ["material", "MATERIAL", "#FAF0EC"],
    ["machinery", "MACHINERY", "#F0F6FF"],
    ["manpower", "MAN POWER", "#F0FAF4"],
  ];
  const typeColMap: Record<string, number> = { material: 9, machinery: 10, manpower: 11 };

  return (
    <div className="overflow-auto rounded-lg border-[0.5px] border-line">
      {/* Sticky header */}
      <div className="sticky top-0 z-[5] grid min-w-[1100px] items-center border-b-[0.5px] border-[#333] bg-ink text-white" style={{ gridTemplateColumns: GRID }}>
        <div className={TH} />
        <div className={TH}>Item Code</div>
        <div className={TH}>Description</div>
        <div className={TH}>Discipline</div>
        <div className={`${TH} text-center`}>Type</div>
        <div className={`${TH} text-center`}>Unit</div>
        <div className={`${TH} text-right`}>Std Qty</div>
        <div className={`${TH} text-right`}>Rate</div>
        <div className={`${TH} text-right`} style={{ color: "#F0C9BC" }}>Material ₹</div>
        <div className={`${TH} text-right`} style={{ color: "#AACFF0" }}>Machinery ₹</div>
        <div className={`${TH} text-right`} style={{ color: "#B8E0C8" }}>Man Power ₹</div>
        <div className={`${TH} text-right`} style={{ color: "#D4C5A9" }}>Transport ₹</div>
        <div className={`${TH} text-right`} style={{ color: "#E0D0A8" }}>Wastage ₹</div>
        <div className={`${TH} text-right font-bold`} style={{ background: "rgba(200,75,47,.25)" }}>Total Rate ₹</div>
        <div className={`${TH} text-center`} style={{ color: "#ccc" }}>Last Updated</div>
      </div>

      {cats.map((cat) => {
        const catItems = items.filter((i) => i.cat === cat.id);
        if (!catItems.length) return null;
        const groups = [...new Set(catItems.map((i) => `${i.group}||${i.groupLabel}`))];
        return (
          <Fragment key={cat.id}>
            {/* Category header */}
            <div className="flex min-w-[1100px] items-center gap-2.5 border-t-2 border-white/10 px-2.5 py-[7px]" style={{ background: catColor(cat.id) }}>
              <span className="rounded bg-white/20 px-[7px] py-px font-mono text-t9 font-bold text-white">{cat.id}</span>
              <span className="text-t11 font-bold tracking-[0.3px] text-white">{cat.label.toUpperCase()}</span>
              <span className="ml-1 text-t9 text-white/60">— {cat.discipline}</span>
            </div>

            {groups.map((gk) => {
              const [gCode, gLabel] = gk.split("||");
              const groupItems = catItems.filter((i) => i.group === gCode);
              return (
                <Fragment key={gk}>
                  {/* Sub-group header */}
                  <div className="flex min-w-[1100px] items-center gap-2 border-t-[0.5px] border-[#D4DCE8] bg-[#E8F0F8] py-[5px] pl-7 pr-2.5">
                    <span className="rounded border-[0.5px] border-[#D4DCE8] bg-white px-[5px] py-px font-mono text-t8 text-muted">{gCode}</span>
                    <span className="text-t10 font-medium text-[#2A4A7F]">{gLabel}</span>
                  </div>

                  {groupItems.map((item) => {
                    const total = calcTotalRate(item);
                    const rate = (item.matRate || 0) + (item.machRate || 0) + (item.manRate || 0) + (item.transRate || 0);
                    const isOpen = expanded.has(item.code);
                    const hasBOM = item.bom && item.bom.length > 0;
                    return (
                      <Fragment key={item.code}>
                        <div className="grid min-w-[1100px] cursor-pointer items-center border-t-[0.5px] border-line bg-white px-1.5 py-1.5 hover:bg-[#FBF9F7]" style={{ gridTemplateColumns: GRID }}>
                          <div className="flex items-center justify-center" onClick={() => hasBOM && toggle(item.code)}>
                            {hasBOM ? (
                              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-t11 font-bold" style={{ background: isOpen ? "#C84B2F" : "#E8E7E4", color: isOpen ? "#fff" : "#6B6A68" }}>
                                {isOpen ? "−" : "+"}
                              </span>
                            ) : (
                              <span className="w-4" />
                            )}
                          </div>
                          <div className="px-1 font-mono text-t9 font-bold text-accent">{item.code}</div>
                          <div className="text-t11 font-medium text-ink">{item.name}</div>
                          <div className="text-t9 text-muted">{cat.discipline}</div>
                          <div className="text-center"><TypePill type={item.itemType} /></div>
                          <div className="text-center text-t10 text-faint">{item.uom}</div>
                          <div className="text-right font-mono text-t10 text-muted">{String(item.stdQty ?? 1).replace(/\.?0+$/, "") || "1"}</div>
                          <div />
                          <div className="text-right font-mono text-t10 text-accent">
                            {item.matRate ? fmtR(item.matRate) : "—"}
                          </div>
                          <div className="text-right font-mono text-t10 text-info">{item.machRate ? fmtR(item.machRate) : "—"}</div>
                          <div className="text-right font-mono text-t10 text-success">{item.manRate ? fmtR(item.manRate) : "—"}</div>
                          <div className="text-right font-mono text-t10 text-warn">{item.transRate ? fmtR(item.transRate) : "—"}</div>
                          <div className="text-right text-t10 text-faint">{item.wastePct && item.wastePct > 0 ? `₹${fmtR((rate * item.wastePct) / 100)}` : "—"}</div>
                          <div className="-my-1.5 -mr-1.5 bg-accent-soft p-1.5 text-right font-mono text-t11 font-bold text-accent">
                            <span className="mr-0.5 text-t9 font-normal text-faint" title="Derived from BOM rollup">ƒ</span>₹{fmtR(total)}
                          </div>
                          <div className="px-1 text-center text-t9 leading-[1.4] text-faint">
                            {item.lastUpdated || "—"}
                            <br />
                            <span className="text-t9 font-medium text-muted">{item.updatedBy}</span>
                          </div>
                        </div>

                        {isOpen &&
                          hasBOM &&
                          bomSections.map(([type, label, bg]) => {
                            const tItems = item.bom.filter((b) => b.type === type);
                            if (!tItems.length) return null;
                            const colIdx = typeColMap[type]!;
                            return (
                              <Fragment key={type}>
                                <div className="grid min-w-[1100px] border-t-[0.5px] border-line px-1.5 py-[3px]" style={{ gridTemplateColumns: GRID, background: bg }}>
                                  <div className="pl-[30px] text-t8 font-bold tracking-[0.8px] text-faint" style={{ gridColumn: "1 / -1" }}>{label}</div>
                                </div>
                                {tItems.map((b, bi) => {
                                  const bTotal = parseFloat((b.qty * b.rate).toFixed(2));
                                  return (
                                    <div key={bi} className="grid min-w-[1100px] items-center border-t-[0.5px] border-line-soft px-1.5 py-1" style={{ gridTemplateColumns: GRID, background: bg }}>
                                      <div />
                                      <div className="whitespace-nowrap rounded bg-info-soft px-[5px] py-px font-mono text-t8 text-info">{b.bomCode || "—"}</div>
                                      <div className="pl-1.5 text-t10 text-[#4A4A48]">{b.name}</div>
                                      <div /><div />
                                      <div className="text-center text-t9 text-faint">{b.unit}</div>
                                      <div className="text-right font-mono text-t10 text-muted">{b.qty}</div>
                                      <div className="text-right font-mono text-t10 text-muted">₹{b.rate.toLocaleString("en-IN")}</div>
                                      <div className="text-right font-mono text-t10 font-semibold text-ink" style={{ gridColumn: colIdx }}>₹{bTotal.toLocaleString("en-IN")}</div>
                                    </div>
                                  );
                                })}
                              </Fragment>
                            );
                          })}
                        {isOpen && hasBOM && (
                          <div className="min-w-[1100px] cursor-pointer border-t-[0.5px] border-line bg-canvas p-1 text-center text-t9 text-faint" onClick={() => toggle(item.code)}>
                            ▲ Collapse BOM
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}

      {/* Budgetary Costing — the enquiry-stage rate cards shared with the BizDev
          lead panel's Budgetary Costing calculator (single source of truth in
          features/library/data/budgetary.ts). Grouped by technology. */}
      {(activeCat === "All" || activeCat === "BQ") && (
        <Fragment>
          <div className="flex min-w-[1100px] items-center gap-2.5 border-t-2 border-white/10 px-2.5 py-[7px]" style={{ background: "#5A3A7F" }}>
            <span className="rounded bg-white/20 px-[7px] py-px font-mono text-t9 font-bold text-white">BQ</span>
            <span className="text-t11 font-bold tracking-[0.3px] text-white">BUDGETARY COSTING</span>
            <span className="ml-1 text-t9 text-white/60">— Enquiry-stage indicative ₹/sqft · {BQ_MARKUP_PCT}% markup</span>
          </div>
          {BQ_TECHS.map((tech) => {
            const rows = budgetary[tech] || [];
            if (!rows.length) return null;
            return (
              <Fragment key={tech}>
                <div className="flex min-w-[1100px] items-center gap-2 border-t-[0.5px] border-[#D8C8E4] bg-[#EFE8F5] py-[5px] pl-7 pr-2.5">
                  <span className="rounded border-[0.5px] border-[#D8C8E4] bg-white px-[5px] py-px font-mono text-t8 text-[#5A3A7F]">{tech}</span>
                  <span className="text-t10 font-medium text-[#5A3A7F]">{tech} — budgetary rate card</span>
                </div>
                {rows.map((it) => (
                  <div key={`${tech}-${it.code}`} className="grid min-w-[1100px] items-center border-t-[0.5px] border-line bg-white px-1.5 py-1.5 hover:bg-[#FBF9F7]" style={{ gridTemplateColumns: GRID }}>
                    <div />
                    <div className="px-1 font-mono text-t9 font-bold text-accent">{it.code}</div>
                    <div className="text-t11 font-medium text-ink">{it.name}</div>
                    <div className="text-t9 text-muted">{tech}</div>
                    <div className="text-center">
                      {it.sel ? (
                        <span className="rounded border-[0.5px] border-[#B8E0C8] bg-success-soft px-1.5 py-0.5 text-t8 font-semibold text-success">Default</span>
                      ) : (
                        <span className="rounded border-[0.5px] border-line bg-canvas px-1.5 py-0.5 text-t8 font-semibold text-faint">Optional</span>
                      )}
                    </div>
                    <div className="text-center text-t10 text-faint">sqft</div>
                    <div className="text-right font-mono text-t10 text-muted">—</div>
                    <div className="text-right font-mono text-t10 text-ink">₹{it.rate}</div>
                    <div className="text-right text-t10 text-faint">—</div>
                    <div className="text-right text-t10 text-faint">—</div>
                    <div className="text-right text-t10 text-faint">—</div>
                    <div className="text-right text-t10 text-faint">—</div>
                    <div className="text-right text-t10 text-faint">—</div>
                    <div className="-my-1.5 -mr-1.5 bg-accent-soft p-1.5 text-right font-mono text-t11 font-bold text-accent">₹{quotedRate(it.rate)}</div>
                    <div className="px-1 text-center text-t9 leading-[1.4] text-faint">
                      ₹/sqft
                      <br />
                      <span className="text-t9 font-medium text-muted">quoted</span>
                    </div>
                  </div>
                ))}
              </Fragment>
            );
          })}
        </Fragment>
      )}

      <div className="min-w-[1100px] border-t-[0.5px] border-line bg-canvas px-3 py-[7px] text-t9 text-faint">
        Click <strong>+</strong> on any line item to expand BOM breakdown. BOM sub-row totals (qty × rate) land in the{" "}
        <strong>Material / Machinery / Manpower</strong> columns of the parent row. Total Rate (<strong>ƒ</strong>) is derived from BOM rollup:
        (Material + Machinery + Manpower + Transport) × (1 + Wastage%). <strong>Rate flow:</strong> Procurement PO closes → BOM material rate updates →
        parent BOQ rates auto-recompute. Click the <IconHistory size={10} className="inline align-[-1px]" /> icon on any rate to view its change history.
      </div>
    </div>
  );
}
