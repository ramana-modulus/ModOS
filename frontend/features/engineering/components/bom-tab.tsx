"use client";

import { useState } from "react";
import { Pill } from "@/components/ui/badge";
import { usePanel } from "@/components/layout/panel-provider";
import { fmtQ } from "@/lib/format";
import type { EngineeringPayload } from "@/features/engineering/api";
import type { EngBomLineView } from "@/features/engineering/types";
import { EngStatusPill, EmptyState, InfoBanner } from "./eng-ui";

const GRID = "30px 90px 1fr 60px 80px 80px 70px 100px 100px 46px 130px";

function VarianceCell({ line }: { line: EngBomLineView }) {
  const v = line.variancePct;
  if (v === null) return <Pill cls="pgr">—</Pill>;
  if (Math.abs(v) < 0.5) return <Pill cls="pg">±0%</Pill>;
  const cls = Math.abs(v) <= 3 ? "pg" : Math.abs(v) <= 8 ? "pa" : "pr";
  return (
    <Pill cls={cls}>
      {v > 0 ? "+" : ""}
      {v.toFixed(1)}%
    </Pill>
  );
}

function DeltaCell({ line }: { line: EngBomLineView }) {
  const d = line.delta;
  if (d === null || Math.abs(d) < 0.01) return <span className="text-t10 text-faint">—</span>;
  return (
    <span className="text-t10 font-medium" style={{ color: d > 0 ? "#A32D2D" : "#3B6D11" }}>
      {d > 0 ? "+" : ""}
      {fmtQ(d)} {line.uom}
    </span>
  );
}

/** Read-only version-history panel body. */
function VersionBody({ line }: { line: EngBomLineView }) {
  const hist = line.engVersionHistory;
  if (hist.length === 0) return <div className="text-t10 text-faint">No version history yet.</div>;
  return (
    <div className="flex flex-col gap-2 text-t10">
      {[...hist].reverse().map((v, i) => (
        <div key={i} className="rounded-md bg-subtle px-2.5 py-2">
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="font-mono text-t11 font-semibold text-ink">{v.v}</span>
            {i === 0 && <Pill cls="pa">latest</Pill>}
            <span className="ml-auto text-t9 text-faint">{v.submittedAt}</span>
          </div>
          <div className="text-t9 text-muted">📤 Submitted by {v.submittedBy}</div>
          {v.sentForApprovalAt && (
            <div className="text-t9 text-muted">
              ✉ Sent for approval {v.sentForApprovalAt}
              {v.batchId ? ` (${v.batchId})` : ""}
            </div>
          )}
          {v.reviewedAt && (
            <div className={`font-medium ${v.decision === "approved" ? "text-success" : "text-danger"}`}>
              {v.decision === "approved" ? "✓ Approved & released" : "✗ Rejected → rework"} on {v.reviewedAt} by{" "}
              {v.reviewedBy}
            </div>
          )}
          {v.comments && (
            <div className="mt-1 rounded border-l-2 bg-surface px-2 py-1 text-t9 text-muted" style={{ borderColor: v.decision === "approved" ? "#3B6D11" : "#A32D2D" }}>
              <strong className="text-ink">{v.decision === "approved" ? "Approver note: " : "Rework: "}</strong>
              {v.comments}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Read-only open-queries panel body (RFI + RFC). */
function QueriesBody({ data, code }: { data: EngineeringPayload; code: string }) {
  const rfis = data.rfis[`${data.scope.key}.${code}`] ?? [];
  const rfcs = data.rfcs[`${data.scope.key}.${code}`] ?? [];
  if (rfis.length === 0 && rfcs.length === 0)
    return <div className="text-t10 text-faint">No open queries on this item.</div>;
  return (
    <div className="flex flex-col gap-3 text-t10">
      {rfis.length > 0 && (
        <div>
          <div className="mb-1.5 text-t9 font-medium uppercase tracking-[0.5px] text-faint">RFI — Requests for Information ({rfis.length})</div>
          {rfis.map((r) => (
            <div key={r.id} className="mb-1.5 rounded border-l-[3px] border-danger bg-danger-soft px-2.5 py-2">
              <div className="mb-0.5 flex items-center justify-between">
                <span className="font-mono text-t10 font-semibold text-danger">{r.id}</span>
                <span className="text-t9 text-warn">{r.age} old</span>
              </div>
              <div className="text-t10 text-ink">{r.subject}</div>
              <div className="text-t9 text-muted">Raised by {r.raisedBy}</div>
            </div>
          ))}
        </div>
      )}
      {rfcs.length > 0 && (
        <div>
          <div className="mb-1.5 text-t9 font-medium uppercase tracking-[0.5px] text-faint">RFC — Requests for Change ({rfcs.length})</div>
          {rfcs.map((r) => (
            <div key={r.id} className="mb-1.5 rounded border-l-[3px] border-warn bg-warn-soft px-2.5 py-2">
              <div className="mb-0.5 flex items-center justify-between">
                <span className="font-mono text-t10 font-semibold text-warn">{r.id}</span>
                <span className="text-t9 text-warn">{r.age} old</span>
              </div>
              <div className="text-t10 text-ink">{r.subject}</div>
              <div className="text-t9 text-muted">Raised by {r.raisedBy}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BomTab({ data }: { data: EngineeringPayload }) {
  const { openPanel } = usePanel();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (code: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  if (data.bomLines.length === 0) {
    return <EmptyState>No BOQ items routed to Engineering for this sub-project.</EmptyState>;
  }

  // Site material change requests (RFCs) awaiting spec approval
  const openRFCs = Object.values(data.rfcs)
    .flat()
    .filter((r) => r.status === "raised");

  const openVersion = (line: EngBomLineView) =>
    openPanel({ tag: line.code, title: "Version History (BOQ)", subtitle: line.name, width: 460, body: <VersionBody line={line} /> });
  const openQueries = (line: EngBomLineView) =>
    openPanel({ tag: line.code, title: `Open Queries — ${line.code}`, subtitle: line.name, width: 460, body: <QueriesBody data={data} code={line.code} /> });

  return (
    <div>
      {openRFCs.length > 0 && (
        <div className="mb-2.5 rounded-lg border-[0.5px] border-warn/40 bg-warn-soft px-3.5 py-2.5">
          <div className="mb-1.5 text-t11 font-bold text-warn">
            ⇄ Site material change requests — spec approval needed ({openRFCs.length})
          </div>
          {openRFCs.map((r) => (
            <div key={r.id} className="border-t-[0.5px] border-warn/20 py-1.5 text-t10">
              <b>{r.forCode}</b> · <span className="font-mono text-t9">{r.id}</span> — {r.fromSpec} → <b>{r.toSpec}</b>
              <div className="text-t9 text-muted">
                {r.reason} <span className="text-faint">— {r.raisedBy}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <InfoBanner>
        <span>ℹ️</span>
        <span>
          <strong>BOQ items pre-populated from Estimation V3.</strong> Engineering reworks the Eng Qty + builds the BOM
          breakdown down to nuts &amp; bolts. Variance % is Eng Qty vs BOQ Qty; rate management stays with Procurement.
        </span>
      </InfoBanner>

      <div className="tw">
        <div className="th" style={{ gridTemplateColumns: GRID }}>
          <span />
          <span>Code</span>
          <span>Description</span>
          <span>UOM</span>
          <span>BOQ Qty</span>
          <span>Eng Qty</span>
          <span>Var %</span>
          <span>Δ Qty</span>
          <span>RFI / RFC</span>
          <span>Ver</span>
          <span>Status</span>
        </div>

        {data.bomGroups.map((group) => {
          const varColor = Math.abs(group.pct) < 0.5 ? "#9CA3AF" : group.pct > 0 ? "#FCA5A5" : "#7DD3A0";
          const varText =
            Math.abs(group.pct) < 0.5
              ? "on target"
              : group.uom
                ? `${group.delta > 0 ? "+" : ""}${fmtQ(group.delta)} ${group.uom} (${group.pct > 0 ? "+" : ""}${group.pct.toFixed(1)}%)`
                : `${group.pct > 0 ? "+" : ""}${group.pct.toFixed(1)}% qty variance`;
          return (
            <div key={group.cat}>
              {/* Category header */}
              <div className="flex items-center justify-between border-b-[0.5px] border-[#333] bg-ink px-3.5 py-1.5 text-t9 font-bold uppercase tracking-[0.6px] text-white">
                <span>
                  {group.cat}{" "}
                  <span className="ml-1.5 text-t9 font-normal normal-case tracking-normal opacity-55">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"} · {group.bomCount} with BOM
                  </span>
                </span>
                <span className="flex items-center gap-2.5 text-t9 font-medium tracking-[0.3px]">
                  <span className="normal-case tracking-normal" style={{ color: varColor }}>
                    Δ {varText}
                  </span>
                  <span className="opacity-85">
                    <span style={{ color: group.approvedCount === group.items.length ? "#7DD3A0" : "#FCD34D" }}>
                      {group.approvedCount}/{group.items.length}
                    </span>{" "}
                    approved
                  </span>
                </span>
              </div>

              {group.items.map((line) => {
                const isOpen = expanded.has(line.code);
                const hasComp = (line.components ?? []).length > 0;
                return (
                  <div key={line.code}>
                    <div className="tr cursor-pointer" style={{ gridTemplateColumns: GRID }} onClick={() => toggle(line.code)}>
                      <span className="text-center">
                        <span style={{ color: hasComp ? "#1A1917" : "#D8D7D4" }}>{isOpen ? "▾" : "▸"}</span>
                      </span>
                      <span className="font-mono text-t10 font-medium text-ink">{line.code}</span>
                      <span>
                        <div className="text-t11 font-medium text-ink">{line.name}</div>
                        <div className="ts text-t9 text-faint">
                          {hasComp ? `${line.components.length} BOM lines` : "BOM not built yet"}
                        </div>
                      </span>
                      <span className="text-t10 text-muted">{line.uom}</span>
                      <span className="text-t10 text-muted">{fmtQ(line.boqQty)}</span>
                      <span className="text-t11 font-medium text-ink">{fmtQ(line.engQty)}</span>
                      <span>
                        <VarianceCell line={line} />
                      </span>
                      <span>
                        <DeltaCell line={line} />
                      </span>
                      <span onClick={(e) => e.stopPropagation()}>
                        {line.openRfi + line.openRfc > 0 ? (
                          <span className="flex cursor-pointer gap-1" onClick={() => openQueries(line)}>
                            {line.openRfi > 0 && <Pill cls="pr">🔴 {line.openRfi} RFI</Pill>}
                            {line.openRfc > 0 && <Pill cls="pa">🟠 {line.openRfc} RFC</Pill>}
                          </span>
                        ) : null}
                      </span>
                      <span onClick={(e) => e.stopPropagation()}>
                        {line.engVersion ? (
                          <span className="cursor-pointer font-mono text-t9 font-semibold text-accent" onClick={() => openVersion(line)} title="View version history">
                            {line.engVersion}
                          </span>
                        ) : (
                          <span className="text-t9 text-faint">—</span>
                        )}
                      </span>
                      <span>
                        <EngStatusPill status={line.engStatus} />
                      </span>
                    </div>

                    {isOpen && hasComp && (
                      <>
                        <div className="flex items-center justify-between border-b-[0.5px] border-dashed border-line bg-canvas px-3.5 py-1.5 pl-20">
                          <span className="text-t9 font-medium uppercase tracking-[0.5px] text-faint">
                            BOM Components (down to nuts &amp; bolts)
                          </span>
                          <span className="cursor-pointer text-t9 text-accent" onClick={() => openVersion(line)}>
                            ⧉ Version History
                          </span>
                        </div>
                        {line.components.map((c) => (
                          <div
                            key={c.code}
                            className="tr border-b-[0.5px] border-dashed border-line bg-canvas"
                            style={{ gridTemplateColumns: GRID }}
                          >
                            <span />
                            <span className="pl-3 font-mono text-t10 font-medium text-warn">{c.code}</span>
                            <span className="text-t10 text-ink">{c.name}</span>
                            <span className="text-t10 text-muted">{c.uom}</span>
                            <span />
                            <span className="text-right text-t11 font-medium text-ink">{fmtQ(c.engQty)}</span>
                            <span />
                            <span />
                            <span />
                            <span />
                            <span>
                              {c.source === "auto" ? (
                                <Pill cls="pgr">auto from BOQ</Pill>
                              ) : (
                                <Pill cls="pb">+ library</Pill>
                              )}
                            </span>
                          </div>
                        ))}
                        <div className="border-b-[0.5px] border-line bg-canvas px-3.5 py-1.5 text-right text-t10 text-muted">
                          {line.components.length} components defined · Procurement manages rates &amp; vendor allocation
                        </div>
                      </>
                    )}

                    {isOpen && !hasComp && (
                      <div className="border-b-[0.5px] border-dashed border-line bg-canvas px-3.5 py-3 pl-20 text-t10 text-faint">
                        No BOM components added yet for <strong>{line.cat}</strong>.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-t10 text-faint">
        <span>Click a row to expand its BOM · click the version chip for history</span>
        <span>
          {data.bomLines.filter((i) => i.engStatus === "approved").length}/{data.bomLines.length} approved ·{" "}
          {data.bomLines.filter((i) => i.engStatus === "in_approval").length} in approval ·{" "}
          {data.bomLines.filter((i) => i.engStatus === "rework").length} rework ·{" "}
          {data.bomLines.filter((i) => i.engStatus === "submitted").length} submitted
        </span>
      </div>
    </div>
  );
}
