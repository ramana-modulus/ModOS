"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { IconFileText } from "@tabler/icons-react";
import { useProjectWon } from "@/components/layout/project-won-provider";
import { bizdevApi } from "@/features/bizdev/api";
import type { BdStage, LeadView } from "@/features/bizdev/types";
import { TechTag, TypePill, HeatPill } from "./tags";
import { BudgetaryCosting } from "./budgetary-costing";
import { QuoteAdjustments } from "./quote-adjustments";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parse a "DD Mon YYYY" date string to a UTC epoch (ms), or null if unparseable. */
function parseDMY(s: string): number | null {
  const m = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const mon = MONTHS.indexOf(m[2]!);
  if (mon < 0) return null;
  return Date.UTC(Number(m[3]), mon, Number(m[1]));
}

/** Whole days between two "DD Mon YYYY" dates (0 if either is unparseable). */
function daysBetween(a: string, b: string): number {
  const da = parseDMY(a);
  const db = parseDMY(b);
  if (da === null || db === null) return 0;
  return Math.max(0, Math.round((db - da) / 86_400_000));
}

const B2G_NOTE =
  "rounded-md border-[0.5px] border-[#E0C8EA] bg-[#F3E9F5] px-3 py-2 text-t10 leading-relaxed text-[#7B1FA2]";
const BACK_BTN: React.CSSProperties = { background: "#FFF8EC", color: "#854F0B", borderColor: "#E8B86D" };

/** Lead / deal detail slide-over (`openLP`) — Details, Budgetary Costing (leads) and Docs tabs. */
export function LeadPanel({
  lead,
  stages,
  onMove,
  onEdit,
}: {
  lead: LeadView;
  stages: BdStage[];
  onMove?: (toStage: string) => Promise<void> | void;
  onEdit?: () => void;
}) {
  const router = useRouter();
  const { celebrate } = useProjectWon();
  const stage = stages.find((s) => s.id === lead.status);
  const isLead = lead.status === "enquiry";
  const [tab, setTab] = useState<"info" | "bq" | "docs">("info");
  const [busy, setBusy] = useState(false);
  const active = tab === "bq" && !isLead ? "info" : tab;

  const go = async (s: string) => {
    if (!onMove) return;
    setBusy(true);
    try {
      await onMove(s);
      // Winning a deal creates a project + fires company-wide notifications;
      // show the celebration banner with the real new project code.
      if (s === "won") {
        try {
          const { project } = await bizdevApi.winProject(lead.id);
          celebrate(project.name, project.code);
        } catch {
          celebrate(lead.co || lead.client);
        }
      }
    } finally {
      setBusy(false);
    }
  };
  const viewCosting = () => router.push("/estimation");

  // Stage timeline — one segment per stage entered, with days spent in each.
  const segs = lead.stageHistory.map((h, i) => {
    const last = i === lead.stageHistory.length - 1;
    const st = stages.find((s) => s.id === h.stage);
    return {
      label: st?.label ?? h.stage,
      color: st?.color ?? "#F0EFED",
      tc: st?.tc ?? "#6B6A68",
      enteredAt: h.enteredAt,
      current: last,
      days: last ? lead.daysInStage : daysBetween(h.enteredAt, lead.stageHistory[i + 1]!.enteredAt),
    };
  });

  const infoRows: [string, ReactNode][] = [
    ["Ref No.", lead.ref],
    ["Type", lead.type],
    ["Lead Type", lead.lt],
    ["Description", lead.desc],
    ["Floor Area", lead.area ? `${lead.area.toLocaleString("en-IN")} sqft` : "—"],
    ["Source", lead.src],
    ["Owner", lead.owner],
    [
      "Date",
      <>
        {lead.date} <span className="text-faint">({lead.daysSinceCreated}d ago)</span>
      </>,
    ],
    [
      "Lead Age",
      <>
        <strong className="text-ink">{lead.daysSinceCreated} days</strong> total · {lead.daysInStage}d in current stage
      </>,
    ],
  ];
  if (lead.dl) infoRows.push(["Deadline", lead.dl]);
  if (lead.tr) infoRows.push(["Tender Ref", <span className="font-mono text-t10">{lead.tr}</span>]);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {lead.tech.map((t) => (
          <TechTag key={t} tech={t} />
        ))}
        <TypePill kind={lead.type} />
        <HeatPill heat={lead.lt} />
      </div>

      <div className="vtabs -mx-[13px]">
        <div className={`vt${active === "info" ? " active" : ""}`} onClick={() => setTab("info")}>Details</div>
        {isLead && (
          <div className={`vt${active === "bq" ? " active" : ""}`} onClick={() => setTab("bq")}>Budgetary Costing</div>
        )}
        <div className={`vt${active === "docs" ? " active" : ""}`} onClick={() => setTab("docs")}>Docs ({lead.docs.length})</div>
      </div>

      {active === "info" && (
        <>
          {/* Stat tiles */}
          <div className="mb-2.5 grid grid-cols-3 gap-1.5">
            <div className="rounded-md bg-canvas px-2.5 py-[7px]">
              <div className="text-t9 text-faint">Est. Value</div>
              <div className="text-t12 font-semibold text-ink">{lead.ev ? `₹${(lead.ev / 100000).toFixed(1)}L` : "—"}</div>
            </div>
            <div className="rounded-md bg-canvas px-2.5 py-[7px]">
              <div className="text-t9 text-faint">Chance</div>
              <div className="text-t12 font-semibold" style={{ color: lead.ch >= 60 ? "#3B6D11" : "#854F0B" }}>{lead.ch}%</div>
            </div>
            <div className="rounded-md px-2.5 py-[7px]" style={{ background: stage?.color ?? "#F5F4F2" }}>
              <div className="text-t9 text-faint">Stage</div>
              <div className="text-t10 font-semibold" style={{ color: stage?.tc ?? "#1A1917" }}>{stage?.label ?? lead.status}</div>
              <div className="mt-px text-t9" style={{ color: stage?.tc ?? "#6B6A68", opacity: 0.85 }}>⏱ {lead.daysInStage}d in stage</div>
            </div>
          </div>

          {/* Stage timeline */}
          {segs.length > 1 && (
            <div className="mb-2.5 rounded-md border-[0.5px] border-line bg-subtle px-2.5 py-2">
              <div className="mb-1.5 text-t9 font-medium uppercase tracking-[0.4px] text-faint">Stage Timeline</div>
              {segs.map((s, i) => (
                <div key={i} className="mb-[3px] flex items-center gap-1.5 last:mb-0">
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: s.tc, boxShadow: s.current ? `0 0 0 2px ${s.color}` : undefined }}
                  />
                  <div className="flex flex-1 items-baseline justify-between text-t10">
                    <span className="text-ink" style={{ fontWeight: s.current ? 600 : 400 }}>
                      {s.label}
                      {s.current ? " (current)" : ""}
                    </span>
                    <span className="text-muted">
                      {s.days}d <span className="text-faint">· entered {s.enteredAt}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Costing status banner */}
          {lead.status === "costing" &&
            (lead.costingReceived ? (
              <div className="mb-2 rounded-md border-[0.5px] border-success-line bg-success-soft px-2.5 py-[7px] text-t10 text-success">
                ✓ <strong>Costing received</strong> — Ready to Generate Quote
              </div>
            ) : (
              <div className="mb-2 rounded-md border-[0.5px] border-[#E8B86D] bg-[#FFF8EC] px-2.5 py-[7px] text-t10 text-warn">
                ⏳ <strong>Costing in progress</strong> — Estimation team working · Due: {lead.dl || "Not set"}
              </div>
            ))}

          <div className="ld-sec">Lead info</div>
          {infoRows.map(([label, value]) => (
            <div key={label} className="ld-row">
              <span className="ld-lbl">{label}</span>
              <span className="ld-val" style={{ fontSize: "10px", fontWeight: 400 }}>{value}</span>
            </div>
          ))}

          <div className="ld-sec">Actions</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {lead.status === "enquiry" && (
              <button type="button" className="tbb p" disabled={busy} onClick={() => go("costing")}>Convert to Deal → Costing</button>
            )}

            {lead.status === "costing" &&
              (lead.costingReceived ? (
                <>
                  <div className="w-full rounded-md border-[0.5px] border-success-line bg-success-soft px-2.5 py-2 text-t10 text-success">
                    <strong>✓ Costing received from Estimation</strong>
                    <br />
                    <span className="text-t9 text-muted">Review and adjust before generating the quote.</span>
                  </div>
                  {lead.type === "B2G" ? (
                    <div className={`w-full ${B2G_NOTE}`}>
                      B2G tender — costing is available to <strong>Contracts</strong>, which submits the bid once submittals & Finance docs are ready.
                    </div>
                  ) : (
                    <>
                      <QuoteAdjustments leadId={lead.id} />
                      <button type="button" className="tbb p w-full justify-center" disabled={busy} onClick={() => go("proposal")}>
                        📄 Generate Quote → Edit → PDF
                      </button>
                    </>
                  )}
                  <button type="button" className="tbb w-full justify-center" onClick={viewCosting}>View Costing</button>
                </>
              ) : (
                <>
                  <div className="w-full rounded-md border-[0.5px] border-line bg-subtle px-2.5 py-2 text-t10 text-faint">
                    📋 <strong className="text-ink">Requested for costing</strong> — Estimation team has been notified · Due: {lead.dl || "Not set"}
                  </div>
                  <button type="button" className="tbb cursor-not-allowed opacity-40" disabled title="Waiting for costing from Estimation">
                    📄 Generate Quote
                  </button>
                  <button type="button" className="tbb" onClick={viewCosting}>View Costing</button>
                </>
              ))}

            {lead.status === "proposal" &&
              (lead.type === "B2G" ? (
                <div className={`w-full ${B2G_NOTE}`}>B2G tender — stage moves are driven by Contracts (submission / award).</div>
              ) : (
                <button type="button" className="tbb p" disabled={busy} onClick={() => go("negotiation")}>Move to Negotiation →</button>
              ))}

            {lead.status === "negotiation" && (
              <>
                <button type="button" className="tbb p" disabled={busy} onClick={() => go("won")}>Mark Won 🎉</button>
                <button type="button" className="tbb" style={{ color: "#A32D2D" }} disabled={busy} onClick={() => go("lost")}>Mark Lost</button>
              </>
            )}

            {onEdit && (
              <button type="button" className="tbb" onClick={onEdit}>Edit Lead</button>
            )}

            {lead.status === "proposal" && lead.type !== "B2G" && (
              <>
                <div className="my-0.5 h-[0.5px] w-full bg-line" />
                <button type="button" className="tbb" style={BACK_BTN} disabled={busy} onClick={() => go("costing")}>← Back to Costing</button>
              </>
            )}

            {lead.status === "negotiation" && (
              <>
                <div className="my-0.5 h-[0.5px] w-full bg-line" />
                <button type="button" className="tbb" style={BACK_BTN} disabled={busy} onClick={() => go("proposal")}>← Back to Proposal Sent</button>
                <button type="button" className="tbb" style={BACK_BTN} disabled={busy} onClick={() => go("costing")}>← Back to Costing</button>
              </>
            )}

            {(lead.status === "won" || lead.status === "lost" || lead.status === "not_participated") && (
              <div className="w-full rounded-md border-[0.5px] border-line bg-canvas px-2.5 py-2 text-t10 text-muted">
                Deal closed — {lead.status === "won" ? "Won 🎉 (project created)" : lead.status === "lost" ? "Lost" : "Not participated"}.
              </div>
            )}
          </div>
        </>
      )}

      {active === "bq" && <BudgetaryCosting lead={lead} />}

      {active === "docs" &&
        (lead.docs.length > 0 ? (
          <div className="space-y-1">
            {lead.docs.map((d) => (
              <div key={d} className="flex items-center gap-2 rounded-md border-[0.5px] border-line bg-surface px-2.5 py-1.5 text-t10 text-ink-soft">
                <IconFileText size={12} className="text-warn" />
                {d}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border-[0.5px] border-line bg-canvas px-3 py-4 text-center text-t10 text-faint">
            No documents attached to this lead.
          </div>
        ))}
    </div>
  );
}
