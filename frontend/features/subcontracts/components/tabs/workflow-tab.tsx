"use client";

import type { ScWorkflowCard, ScWorkflowView } from "@/features/subcontracts/api";
import { CatBanner } from "../ui-bits";

const AVATAR_COLORS = ["#0F766E", "#7B1FA2", "#A32D2D", "#185FA5", "#854F0B"];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length]!;
}
function initials(name: string): string {
  return name
    .split(" ")
    .map((x) => x[0] ?? "")
    .join("")
    .slice(0, 2);
}

function actionLabel(a: ScWorkflowCard["action"]) {
  if (a.kind === "approve") return <span className="text-t9" style={{ color: "#854F0B" }}>⏳ Approve ({a.who})</span>;
  if (a.kind === "released") return <span className="text-t9" style={{ color: "#3B6D11" }}>✓ released</span>;
  if (a.kind === "raise") return <span className="text-t9 text-faint">raise WO</span>;
  return <span className="text-t9 text-faint">L1 first</span>;
}

function groupByCat(cards: ScWorkflowCard[]) {
  const order: string[] = [];
  const grp: Record<string, ScWorkflowCard[]> = {};
  for (const c of cards) {
    if (!order.includes(c.catId)) order.push(c.catId);
    (grp[c.catId] ??= []).push(c);
  }
  return order.map((catId) => ({ catId, label: grp[catId]![0]!.cat, cards: grp[catId]! }));
}

export function WorkflowTab({ data }: { data: ScWorkflowView }) {
  const groups = groupByCat(data.cards);
  return (
    <div>
      {/* Tracker */}
      <div className="wf-tracker">
        {data.nodes.map((n) => (
          <div key={n.role} className={"wf-node " + n.state}>
            <div className="wf-node-role">{n.role}</div>
            <div className="wf-node-person">{n.person}</div>
            <div className="wf-node-status">
              {n.state === "done" ? "✓ " : n.state === "active" ? "→ " : "○ "}
              {n.done}/{n.total} {n.verb}
            </div>
            <div className="wf-arr-overlay">›</div>
          </div>
        ))}
      </div>

      {/* Matrix */}
      <div className="mb-3 rounded-lg border-[0.5px] border-line bg-surface px-3.5 py-2.5">
        <div className="mb-2 text-t11 font-semibold text-ink">Value-Based Approval Matrix</div>
        <div className="grid grid-cols-3 gap-2">
          {data.bands.map((b) => (
            <div key={b.who} className="rounded-md border-[0.5px] border-[#E8E7E4] bg-[#FAFAF9] p-2.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <div className="team-avatar" style={{ width: 24, height: 24, fontSize: 9, background: avatarColor(b.who) }}>
                  {initials(b.who)}
                </div>
                <div>
                  <div className="text-t11 font-semibold text-ink">{b.who}</div>
                  <div className="text-t9 text-faint">{b.role}</div>
                </div>
              </div>
              <div className="mt-1.5 text-t9 text-muted">
                Threshold: <strong>{b.thresholdLabel}</strong>
              </div>
              <div className="mt-0.5 text-t11 font-medium" style={{ color: b.approved === b.inBand && b.inBand > 0 ? "#3B6D11" : "#854F0B" }}>
                {b.approved}/{b.inBand} approved
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompts */}
      {data.prompts.length > 0 ? (
        data.prompts.map((p) => (
          <div key={p.who} className="mb-2.5 rounded-lg px-3 py-2.5" style={{ background: "#E6F1FB", border: "0.5px solid #B8D4F0" }}>
            <div className="mb-1 text-t11 font-semibold" style={{ color: "#185FA5" }}>
              ⏳ Approval needed — {p.who} ({p.role})
            </div>
            <div className="text-t10 text-muted">
              {p.woNos.length} work order{p.woNos.length > 1 ? "s" : ""} awaiting sign-off: {p.woNos.join(", ")}
            </div>
          </div>
        ))
      ) : (
        <div className="mb-2.5 rounded-lg px-3 py-2.5 text-t11" style={{ background: "#EAF3DE", border: "0.5px solid #C0DD97", color: "#3B6D11" }}>
          ✓ No work orders awaiting approval.
        </div>
      )}

      {/* Cards by trade */}
      <div className="mb-1.5 text-t11 font-semibold text-ink">Work orders by trade</div>
      {groups.map((g) => (
        <div key={g.catId}>
          <CatBanner label={g.label} count={g.cards.length} noun="package" />
          <div className="mt-1.5 flex flex-col gap-1.5">
            {g.cards.map((c) => (
              <div key={c.code} className={"trade-card " + c.cls} style={{ margin: 0 }}>
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <span className="font-mono text-t10 text-faint">{c.code}</span> <span className="text-t11 font-medium text-ink">{c.name}</span>
                    <div className="mt-px text-t9 text-faint">
                      {c.woNo ? c.woNo + " · " : ""}
                      {c.subbieName} · {c.valueDisplay}
                      {c.routesTo ? " · routes to " + c.routesTo : ""}
                    </div>
                  </div>
                  <div>{actionLabel(c.action)}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                  {c.chips.map((chip) => (
                    <span
                      key={chip.label}
                      className="rounded-[10px] px-2 py-0.5 text-t9 font-medium"
                      style={{ background: chip.on ? "#EAF3DE" : "#F5F4F2", color: chip.on ? "#3B6D11" : "#9B9894" }}
                    >
                      {chip.on ? "✓" : "○"} {chip.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
