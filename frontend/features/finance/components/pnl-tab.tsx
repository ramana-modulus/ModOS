"use client";

import { fmtC } from "@/lib/format";
import type { FinancePnlView } from "@/features/finance/types";

/** A labelled progress bar row (`label · ₹L · pct%` + fill). */
function StackBar({
  label,
  value,
  color,
  contractValue,
}: {
  label: string;
  value: number;
  color: string;
  contractValue: number;
}) {
  const pct = contractValue > 0 ? (value / contractValue) * 100 : 0;
  return (
    <div className="mb-2">
      <div className="mb-[3px] flex justify-between text-t10">
        <span style={{ color }}>{label}</span>
        <span className="font-medium text-ink">
          ₹{fmtC(value / 100000)} L · {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-[3px] bg-[#F0EFEB]">
        <div className="h-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

function ProjectionCell({
  label,
  value,
  color,
  emphasis,
}: {
  label: string;
  value: number;
  color: string;
  emphasis?: { border: string; bg: string };
}) {
  return (
    <div
      className="rounded-md p-2.5 text-center"
      style={{
        background: emphasis?.bg ?? "#FBF9F6",
        border: emphasis ? `0.5px solid ${emphasis.border}` : undefined,
      }}
    >
      <div className="text-[9px] text-faint">{label}</div>
      <div className="mt-[3px] text-[14px] font-semibold" style={{ color }}>
        ₹{fmtC(value / 100000)} L
      </div>
    </div>
  );
}

export function PnlTab({ pnl }: { pnl: FinancePnlView }) {
  if (!pnl.present) {
    return (
      <div className="rounded-lg bg-[#F5F4F2] p-[30px] text-center text-t11 text-faint">
        No P&amp;L data for {pnl.name} yet.
      </div>
    );
  }

  const profitColor = pnl.profitPositive ? "#3B6D11" : "#A32D2D";

  return (
    <>
      {/* Headline cards */}
      <div className="mb-3 grid gap-2.5" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <div className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3">
          <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.5px] text-faint">
            Contract Value
          </div>
          <div className="text-[22px] font-semibold text-ink">₹{fmtC(pnl.contractValue / 100000)} L</div>
          <div className="mt-0.5 text-t10 text-muted">
            {pnl.name} · {pnl.units} units
          </div>
        </div>
        <div className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3">
          <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.5px] text-faint">Progress</div>
          <div className="text-[22px] font-semibold text-ink">{pnl.progressPct}%</div>
          <div className="mt-0.5 text-t10 text-muted">
            Day {pnl.elapsedDays} of {pnl.durationDays} ({pnl.timePct}% time)
          </div>
        </div>
        <div className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3">
          <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.5px] text-faint">
            Projected Profit
          </div>
          <div className="text-[22px] font-semibold" style={{ color: profitColor }}>
            ₹{fmtC(pnl.projectedProfit / 100000)} L
          </div>
          <div className="mt-0.5 text-t10 text-muted">at {pnl.projectedMarginPct.toFixed(1)}% margin</div>
        </div>
        <div className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3">
          <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.5px] text-faint">
            Margin vs Budget
          </div>
          <div className="text-[22px] font-semibold" style={{ color: profitColor }}>
            {pnl.profitDelta >= 0 ? "+" : ""}
            {pnl.profitDelta.toFixed(1)} pp
          </div>
          <div className="mt-0.5 text-t10 text-muted">
            budgeted {pnl.budgetedMarginPct}% · proj {pnl.projectedMarginPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Revenue + Cost side-by-side */}
      <div className="mb-3 grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Revenue stack */}
        <div className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3.5">
          <div className="mb-2.5 flex items-center gap-1.5 border-b-[0.5px] border-[#F0EFEB] pb-2">
            <span className="text-t12 font-semibold text-ink">Revenue Recognition</span>
          </div>
          <StackBar label="Claimed (RA bills)" value={pnl.revenue.claimed} color="#9B9894" contractValue={pnl.contractValue} />
          <StackBar label="Certified by client" value={pnl.revenue.certified} color="#854F0B" contractValue={pnl.contractValue} />
          <StackBar label="Invoiced (with GST)" value={pnl.revenue.invoiced} color="#185FA5" contractValue={pnl.contractValue} />
          <StackBar label="Received in bank" value={pnl.revenue.received} color="#3B6D11" contractValue={pnl.contractValue} />
          <div className="mt-2.5 rounded bg-[#FBF9F6] px-2.5 py-2 text-t10 text-muted">
            Revenue method: <strong>% completion (cert-based)</strong>. Receivable = invoiced − received =
            ₹{fmtC(pnl.receivable / 100000)} L.
          </div>
        </div>

        {/* Cost stack */}
        <div className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3.5">
          <div className="mb-2.5 flex items-center gap-1.5 border-b-[0.5px] border-[#F0EFEB] pb-2">
            <span className="text-t12 font-semibold text-ink">Cost Stack</span>
          </div>
          <StackBar label="Committed (POs + WOs)" value={pnl.cost.committed} color="#5C2E91" contractValue={pnl.contractValue} />
          <StackBar label="Incurred (delivered/done)" value={pnl.cost.incurred} color="#854F0B" contractValue={pnl.contractValue} />
          <StackBar label="Paid (cash out)" value={pnl.cost.paid} color="#A32D2D" contractValue={pnl.contractValue} />
          <div className="mt-2.5 rounded bg-[#FBF9F6] px-2.5 py-2 text-t10 text-muted">
            <div className="flex justify-between">
              <span>Material:</span>
              <span>₹{fmtC(pnl.cost.breakdown.material / 100000)} L</span>
            </div>
            <div className="flex justify-between">
              <span>Labour:</span>
              <span>₹{fmtC(pnl.cost.breakdown.labour / 100000)} L</span>
            </div>
            <div className="flex justify-between">
              <span>Overheads:</span>
              <span>₹{fmtC(pnl.cost.breakdown.overheads / 100000)} L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection band */}
      <div className="mb-3 rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3.5">
        <div className="mb-2.5 text-t11 font-semibold text-ink">Projection to Completion</div>
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
          <ProjectionCell label="Cost Incurred" value={pnl.cost.incurred} color="#1A1917" />
          <ProjectionCell label="+ Est. Cost to Complete" value={pnl.estimatedCostToComplete} color="#854F0B" />
          <ProjectionCell
            label="= Projected Total Cost"
            value={pnl.projectedTotalCost}
            color="#854F0B"
            emphasis={{ border: "#854F0B", bg: "#FAEEDA" }}
          />
          <ProjectionCell label="vs Contract Value" value={pnl.contractValue} color="#1A1917" />
          <ProjectionCell
            label="= Projected Profit"
            value={pnl.projectedProfit}
            color={profitColor}
            emphasis={{ border: profitColor, bg: pnl.profitPositive ? "#EAF3DE" : "#FAE9E4" }}
          />
        </div>
      </div>

      <div className="rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3.5 py-2.5 text-t10 leading-[1.6] text-muted">
        <strong className="text-ink">How this rolls up:</strong> Cost incurred is computed live from
        Procurement (material delivered) + Ops DPR (labour expended). Revenue follows the % completion
        method based on RA bills certified. Estimated cost to complete is the engineering team&apos;s input
        from Engineering&apos;s variance tracker. CFO reviews weekly; deviation from budgeted margin
        triggers a project flag.
      </div>
    </>
  );
}
