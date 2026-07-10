"use client";

import { Fragment, useState } from "react";
import { IconChevronDown, IconChevronRight, IconInfoCircle, IconSend } from "@tabler/icons-react";
import type { BomRow } from "@/types/procurement";
import type { BomListResponse } from "@/features/procurement/api/types";
import { Pill } from "@/components/ui/badge";
import { usePanel } from "@/components/layout/panel-provider";
import { fmtCompact, fmtQ } from "@/lib/format";
import { bomLotRows, bomStatus, currentRateView, rateVarMeta } from "@/features/procurement/view";
import { BomRowDetail } from "@/features/procurement/components/panels/bom-row-detail";

const COLS = "74px 1fr 68px 48px 78px 96px 60px 100px 126px 76px";

interface BomTabProps {
  data: BomListResponse | null;
  subProjectName: string;
  loading: boolean;
  error: string | null;
}

export function BomTab({ data, subProjectName, loading, error }: BomTabProps) {
  const { openPanel } = usePanel();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const rows = data?.rows ?? [];
  const groups = data?.categoryGroups ?? [];

  const toggle = (code: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const openDetail = (row: BomRow) =>
    openPanel({ tag: row.code, title: row.name, subtitle: `${fmtQ(row.totalQty)} ${row.uom}`, width: 400, body: <BomRowDetail row={row} /> });

  const needRate = rows.filter((r) => !currentRateView(r)).length;

  if (!loading && rows.length === 0) {
    return (
      <div className="rounded-lg bg-canvas p-8 text-center text-t11 text-faint">
        {error ?? "No BOM items released by Engineering yet for this sub-project."}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Info banner */}
      <div className="mb-2 flex items-center gap-2 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3 py-2 text-t10 text-muted">
        <IconInfoCircle size={13} className="shrink-0 text-accent" aria-hidden />
        <span>
          <strong className="text-ink">BOM rolled up within {subProjectName}.</strong>{" "}
          <strong>Click a row</strong> to break it into delivery lots — one per received GRN plus the
          pending balance; <strong>click a lot</strong> for its vendor, rate &amp; quotes.{" "}
          <strong>RFQ</strong> floats an RFQ for any unsourced balance.
        </span>
      </div>

      {/* Table */}
      <div className="tw flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="th" style={{ gridTemplateColumns: COLS }}>
          <span>Code</span>
          <span>Material</span>
          <span>Qty</span>
          <span>UOM</span>
          <span>Budget ₹</span>
          <span>L1 / PO ₹</span>
          <span>Var %</span>
          <span>Req By (WBS)</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && (
            <div className="px-3.5 py-8 text-center text-t11 text-faint">Loading BOM…</div>
          )}
          {groups.map((group) => {
            const items = rows.filter((r) => r.cat === group.cat);
            return (
              <Fragment key={group.cat}>
                {/* Category banner */}
                <div className="flex items-center justify-between border-b-[0.5px] border-[#333] bg-ink px-3.5 py-[7px] text-t10 font-bold uppercase tracking-[0.6px] text-white">
                  <span>
                    {group.cat}
                    <span className="ml-1.5 text-t9 font-normal normal-case tracking-normal opacity-55">
                      {group.count} material{group.count === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="flex items-center gap-2.5 text-t9 font-medium normal-case tracking-[0.3px]">
                    {group.committed > 0 && <span className="opacity-85">₹{fmtCompact(group.committed)} committed</span>}
                    <span>
                      <span style={{ color: group.sourcedCount === group.count ? "#7DD3A0" : "#FCD34D" }}>
                        {group.sourcedCount}/{group.count}
                      </span>{" "}
                      sourced
                    </span>
                  </span>
                </div>

                {items.map((row) => {
                  const cur = currentRateView(row);
                  const st = bomStatus(row);
                  const varMeta = rateVarMeta(row.rate, cur?.rate);
                  const isOpen = expanded.has(row.code);
                  const sub =
                    row.sourceBOQs.length === 1
                      ? `from ${row.sourceBOQs[0]}`
                      : `from ${row.sourceBOQs.length} BOQs · ${row.sources
                          .map((s) => `${s.boq.split("-")[1]}:${fmtQ(s.qty)}`)
                          .join("+")}`;
                  return (
                    <Fragment key={row.code}>
                      <div
                        className="tr cursor-pointer"
                        style={{ gridTemplateColumns: COLS, background: isOpen ? "#FBF9F6" : undefined }}
                        onClick={() => toggle(row.code)}
                        title="Click to break this line into delivery lots"
                      >
                        <span className="font-mono text-t10 font-semibold text-warn">{row.code}</span>
                        <span>
                          <div className="text-t11 font-medium text-ink">{row.name}</div>
                          <div className="text-t9 text-faint">{sub}</div>
                        </span>
                        <span className="text-t11 font-semibold text-ink">{fmtQ(row.totalQty)}</span>
                        <span className="text-t10 text-faint">{row.uom}</span>
                        <span className="text-t11 text-muted">₹{row.rate}</span>
                        <span>
                          {cur ? (
                            <>
                              <div className="text-t11 font-medium" style={{ color: cur.source === "po" ? "#3B6D11" : "#1A1917" }}>
                                ₹{cur.rate}
                              </div>
                              <div className="text-t9 text-faint">{cur.label}</div>
                            </>
                          ) : (
                            <span className="text-t10 text-faint">— pending</span>
                          )}
                        </span>
                        <span>{varMeta ? <Pill cls={varMeta.pill}>{varMeta.label}</Pill> : <Pill cls="pgr">—</Pill>}</span>
                        <span
                          className="text-t9"
                          style={{ color: row.requiredBy ? "#4A4945" : "#C8C6C2" }}
                          title={row.requiredBy ? `On-site need-by from WBS · ${row.requiredBy.boq}` : "Parent BOQ not WBS-scheduled yet"}
                        >
                          {row.requiredBy ? row.requiredBy.date : "— not scheduled"}
                        </span>
                        <span>
                          <Pill cls={st.pill} className="text-t9">
                            {st.label}
                          </Pill>
                        </span>
                        <span className="flex items-center justify-end">
                          {isOpen ? (
                            <IconChevronDown size={14} className="text-faint" />
                          ) : (
                            <IconChevronRight size={14} className="text-faint" />
                          )}
                        </span>
                      </div>

                      {isOpen &&
                        bomLotRows(row).map((lot, i) =>
                          lot.balance ? (
                            <div key={`bal-${i}`} className="tr" style={{ gridTemplateColumns: COLS, background: "#FCFBF8" }}>
                              <span />
                              <span className="pl-3.5 text-t10 text-info">↳ {lot.label}</span>
                              <span className="text-t10 font-semibold text-info">{fmtQ(lot.qty)}</span>
                              <span className="text-t9 text-faint">{row.uom}</span>
                              <span /><span /><span /><span />
                              <span className="text-t9 text-info">unsourced</span>
                              <span className="flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetail(row);
                                  }}
                                  className="flex items-center gap-1 whitespace-nowrap rounded-md border-[0.5px] border-info bg-info px-[7px] py-0.5 text-t9 text-white"
                                  title={`Float an RFQ for the unsourced balance — ${fmtQ(lot.qty)} ${row.uom}`}
                                >
                                  <IconSend size={9} /> RFQ
                                </button>
                              </span>
                            </div>
                          ) : (
                            <div
                              key={`lot-${i}`}
                              className="tr cursor-pointer"
                              style={{ gridTemplateColumns: COLS, background: "#FCFBF8" }}
                              onClick={() => openDetail(row)}
                              title="Open this lot's vendor, rate & quotes"
                            >
                              <span />
                              <span className="pl-3.5 text-t10 text-ink-soft">
                                ↳ <strong className="text-info">Lot {lot.no}</strong>
                                {lot.vendor && lot.vendor !== "—" ? ` · ${lot.vendor}` : ""}
                              </span>
                              <span className="text-t10 font-semibold text-ink">{fmtQ(lot.qty)}</span>
                              <span className="text-t9 text-faint">{row.uom}</span>
                              <span />
                              <span className="text-t10 text-muted">{lot.rate ? `₹${lot.rate}` : "—"}</span>
                              <span />
                              <span className="text-t9 text-faint">{lot.when || "—"}</span>
                              <span>
                                <Pill cls={lot.pill} className="text-t9">
                                  {lot.label}
                                </Pill>
                              </span>
                              <span className="flex items-center justify-end text-t14 text-[#B8B6B2]">›</span>
                            </div>
                          )
                        )}
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex flex-shrink-0 justify-between text-t10 text-faint">
        <span>
          Click a row to expand its delivery lots · click a lot for its vendors &amp; L1 · L1/PO Rate
          populates as quotes arrive and POs are raised
        </span>
        <span>{needRate} items still need rate confirmation</span>
      </div>
    </div>
  );
}
