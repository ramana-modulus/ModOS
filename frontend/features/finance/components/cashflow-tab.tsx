"use client";

import { fmtC } from "@/lib/format";
import type {
  CashflowCategory,
  CashflowItem,
  CashflowWeek,
  Confidence,
  FinanceCashflowView,
} from "@/features/finance/types";

const CAT_META: Record<CashflowCategory, { color: string; bg: string; label: string }> = {
  AP: { color: "#A32D2D", bg: "#FAE9E4", label: "AP (certified)" },
  "AP-pending": { color: "#854F0B", bg: "#FAEEDA", label: "AP (pending)" },
  AR: { color: "#3B6D11", bg: "#EAF3DE", label: "AR (expected)" },
  Recurring: { color: "#5C2E91", bg: "#F0EBF9", label: "Recurring" },
};

const CONF_META: Record<Confidence, { label: string; color: string }> = {
  high: { label: "High", color: "#3B6D11" },
  medium: { label: "Med", color: "#854F0B" },
  low: { label: "Low", color: "#A32D2D" },
};

const CHART_PX = 150;

function ItemRow({ item, sign }: { item: CashflowItem; sign: "in" | "out" }) {
  const cm = CAT_META[item.category];
  const conf = CONF_META[item.confidence];
  const amtColor = sign === "in" ? "#3B6D11" : "#A32D2D";
  return (
    <div
      title={item.note ?? ""}
      className="mb-[3px] rounded-[3px] px-1.5 py-[5px]"
      style={{ background: cm.bg, border: `0.5px solid ${cm.color}30` }}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="flex-1 text-[9px] leading-[1.3] text-ink">{item.desc}</span>
        <span className="whitespace-nowrap text-[9px] font-semibold" style={{ color: amtColor }}>
          ₹{fmtC(item.amount / 100000)}L
        </span>
      </div>
      <div className="mt-0.5 flex justify-between">
        <span className="text-[8px]" style={{ color: cm.color }}>
          {cm.label}
        </span>
        <span className="text-[8px]" style={{ color: conf.color }}>
          ●{conf.label}
        </span>
      </div>
    </div>
  );
}

function Bars({ weeks }: { weeks: CashflowWeek[] }) {
  const maxTotal = Math.max(1, ...weeks.map((w) => Math.max(w.inTotal, w.outTotal)));
  const h = (v: number) => Math.max(v > 0 ? 2 : 0, Math.round((v / maxTotal) * CHART_PX));
  return (
    <div className="cf-chart mb-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-t11 font-semibold text-ink">Weekly cash movement</span>
        <span className="text-t10 text-faint">inflow vs outflow · ₹ Lakh</span>
      </div>
      <div className="flex items-end gap-3" style={{ height: CHART_PX + 40 }}>
        {weeks.map((w) => (
          <div key={w.weekOf} className="cf-bar-wrap">
            <div className="flex w-full items-end justify-center gap-1.5">
              {/* inflow */}
              <div className="cf-bar-stack" style={{ height: CHART_PX, maxWidth: 26 }}>
                <div className="cf-bar-in" style={{ height: h(w.inTotal) }} title={`In ₹${fmtC(w.inTotal / 100000)}L`} />
              </div>
              {/* outflow stack: vendor + labour + overhead */}
              <div className="cf-bar-stack" style={{ height: CHART_PX, maxWidth: 26 }}>
                {w.outVendor > 0 && (
                  <div className="cf-bar-out-proc" style={{ height: h(w.outVendor) }} title={`Vendor/AP ₹${fmtC(w.outVendor / 100000)}L`} />
                )}
                {w.outLabour > 0 && (
                  <div className="cf-bar-out-lab" style={{ height: h(w.outLabour) }} title={`Labour ₹${fmtC(w.outLabour / 100000)}L`} />
                )}
                {w.outOverhead > 0 && (
                  <div className="cf-bar-out-oh" style={{ height: h(w.outOverhead) }} title={`Overheads ₹${fmtC(w.outOverhead / 100000)}L`} />
                )}
              </div>
            </div>
            <div className={"cf-bar-month" + (w.isCurrent ? " current" : "")}>{w.weekOf}</div>
          </div>
        ))}
      </div>
      <div className="cf-legend">
        <span>
          <span className="cf-legend-sw" style={{ background: "#16803E" }} />
          Inflow (AR)
        </span>
        <span>
          <span className="cf-legend-sw" style={{ background: "#A32D2D" }} />
          Outflow · Vendor/AP
        </span>
        <span>
          <span className="cf-legend-sw" style={{ background: "#C2410C" }} />
          Outflow · Labour
        </span>
        <span>
          <span className="cf-legend-sw" style={{ background: "#A16207" }} />
          Outflow · Overheads
        </span>
      </div>
    </div>
  );
}

function WeekCard({ wk }: { wk: CashflowWeek }) {
  return (
    <div
      className="rounded-lg bg-surface p-2.5"
      style={{
        border: `0.5px solid ${wk.isCurrent ? "var(--ac)" : "#E5E4E0"}`,
        boxShadow: wk.isCurrent ? "0 0 0 1.5px var(--ac-lt)" : undefined,
      }}
    >
      <div className="mb-2 flex items-center justify-between border-b-[0.5px] border-[#F0EFEB] pb-1.5">
        <div>
          <div className="text-t11 font-semibold" style={{ color: wk.isCurrent ? "var(--ac)" : "#1A1917" }}>
            {wk.label}
          </div>
          <div className="text-[9px] text-faint">{wk.weekOf}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-faint">Net</div>
          <div className="text-t12 font-semibold" style={{ color: wk.net >= 0 ? "#3B6D11" : "#A32D2D" }}>
            {wk.net >= 0 ? "+" : "−"}₹{fmtC(Math.abs(wk.net) / 100000)}L
          </div>
        </div>
      </div>

      {wk.inflows.length > 0 && (
        <div className="mb-1.5">
          <div className="mb-[3px] text-[9px] font-semibold uppercase tracking-[0.5px] text-[#3B6D11]">
            + Inflow ₹{fmtC(wk.inTotal / 100000)}L
          </div>
          {wk.inflows.map((i, idx) => (
            <ItemRow key={idx} item={i} sign="in" />
          ))}
        </div>
      )}

      {wk.outflows.length > 0 && (
        <div>
          <div className="mb-[3px] text-[9px] font-semibold uppercase tracking-[0.5px] text-[#A32D2D]">
            − Outflow ₹{fmtC(wk.outTotal / 100000)}L
          </div>
          {wk.outflows.map((o, idx) => (
            <ItemRow key={idx} item={o} sign="out" />
          ))}
        </div>
      )}

      <div className="mt-1.5 flex items-center justify-between border-t-[0.5px] border-dashed border-[#E5E4E0] pt-1.5">
        <span className="text-[9px] text-faint">Projected balance</span>
        <span
          className="text-t11 font-semibold"
          style={{ color: wk.projectedBalance >= 0 ? "#1A1917" : "#A32D2D" }}
        >
          ₹{fmtC(wk.projectedBalance / 100000)}L
        </span>
      </div>
    </div>
  );
}

export function CashflowTab({ cashflow }: { cashflow: FinanceCashflowView }) {
  return (
    <>
      {/* Bank position banner */}
      <div
        className="mb-3 grid gap-3 rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface px-3.5 py-3"
        style={{ gridTemplateColumns: `repeat(${cashflow.banks.length + 2},1fr)` }}
      >
        {cashflow.banks.map((a) => (
          <div key={a.id}>
            <div className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.5px] text-faint">
              {a.name}
            </div>
            <div className="text-[15px] font-semibold text-ink">₹{fmtC(a.balance / 100000)} L</div>
            <div className="text-[9px] text-muted">IFSC: {a.ifsc}</div>
          </div>
        ))}
        <div>
          <div className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.5px] text-faint">
            CC Line Available
          </div>
          <div className="text-[15px] font-semibold text-[#3B6D11]">
            ₹{fmtC(cashflow.ccAvailable / 100000)} L
          </div>
          <div className="text-[9px] text-muted">of ₹{fmtC(cashflow.ccLimit / 100000)} L limit</div>
        </div>
        <div className="text-right">
          <div className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.5px] text-faint">
            Total Liquidity
          </div>
          <div className="text-[17px] font-semibold text-ink">
            ₹{fmtC(cashflow.totalLiquidity / 100000)} L
          </div>
          <div className="text-[9px] text-muted">cash + working capital</div>
        </div>
      </div>

      {/* Bar chart */}
      <Bars weeks={cashflow.weeks} />

      {/* Week-wise detail grid */}
      <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${cashflow.weeks.length},1fr)` }}>
        {cashflow.weeks.map((wk) => (
          <WeekCard key={wk.weekOf} wk={wk} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3 py-2">
        <div className="flex flex-wrap items-center gap-2.5 text-t10 text-muted">
          <strong className="text-ink">Legend:</strong>
          {(Object.keys(CAT_META) as CashflowCategory[]).map((k) => {
            const m = CAT_META[k];
            return (
              <span key={k} className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-[2px]"
                  style={{ background: m.bg, border: `0.5px solid ${m.color}` }}
                />
                {m.label}
              </span>
            );
          })}
          <span className="mx-1 inline-block h-3.5 w-px bg-[#E5E4E0]" />
          <span className="text-faint">Confidence:</span>
          {(Object.keys(CONF_META) as Confidence[]).map((k) => (
            <span key={k} style={{ color: CONF_META[k].color }}>
              ●{CONF_META[k].label}
            </span>
          ))}
        </div>
        <div className="text-t10 text-muted">Derived live from the spine · recomputed every render</div>
      </div>

      <div className="mt-2.5 rounded-md border-[0.5px] border-[#E5E4E0] bg-surface px-3 py-2 text-t10 text-muted">
        <strong>How items get here:</strong> AP items pull from Billing&apos;s certified vendor bills. AR
        items derive from RA bill stages (cert cycles + payment terms). Pending procurement items come from
        Procurement&apos;s open POs. Recurring items are configured per project (labour + overhead burn
        rate).
      </div>
    </>
  );
}
