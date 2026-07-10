/**
 * Projects domain helpers — faithful, pure ports of the prototype's
 * `computeHealth`, `getProjectActivity`, `initials`, `avatarColor`, the stage
 * `pill()` colour map, and the cashflow / overview roll-ups.
 */
import type {
  ActivityEntry,
  CashflowMonthRollup,
  CashflowView,
  Health,
  OverviewMetrics,
  ProjectCashflow,
  ProjectExt,
  ProjectExtEntry,
} from "@/features/projects/types";

export type PillCls = "pg" | "pa" | "pr" | "pb" | "pgr" | "pac";

/** Stage → pill colour, ported from the prototype's `pill()` lookup (default gray). */
const STAGE_PILL: Record<string, PillCls> = {
  "PO Raised": "pg",
  "PO Pending": "pa",
  "Rate Pending": "pa",
  "Engg. Pending": "pr",
  "Not Started": "pgr",
  Active: "pg",
  Approved: "pg",
  Pending: "pa",
  Onboarded: "pg",
  Invited: "pb",
  "Not Invited": "pgr",
  Execution: "pg",
  Recce: "pa",
  Draft: "pgr",
  Engineered: "pac",
  "Bought-out": "pb",
};

export function stagePillClass(stage: string): PillCls {
  return STAGE_PILL[stage] ?? "pgr";
}

/** Type guard: a populated `ProjectExt` (vs. an empty P2–P5 stub). */
export function isProjectExt(ext: ProjectExtEntry | undefined): ext is ProjectExt {
  return !!ext && "team" in ext && "spi" in ext;
}

/** Initials from a name (up to 2 chars, upper-cased). */
export function initials(name: string): string {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Deterministic avatar colour picked from a fixed palette by name hash. */
export function avatarColor(name: string): string {
  const c = [
    "#1FA855", "#3B82F6", "#F97316", "#A855F7", "#0EA5E9",
    "#10B981", "#EAB308", "#EF4444", "#EC4899", "#6366F1",
  ];
  let h = 0;
  const s = name || "";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % c.length;
  return c[h]!;
}

/**
 * Auto RAG health from SPI / CPI / open-NCR thresholds (or a PM override).
 * Faithful port of `computeHealth`; takes the resolved `ProjectExt` directly.
 */
export function computeHealth(ext: ProjectExtEntry | undefined): Health {
  if (!isProjectExt(ext) || !ext.spi) return { val: "gray", auto: true, label: "No data", reasons: [] };
  if (ext.healthOverride) {
    const o = ext.healthOverride;
    return { val: o.val, label: o.label, auto: false, reasons: o.note ? [o.note] : [] };
  }

  const reasons: string[] = [];
  let score = 0;
  const { spi, cpi } = ext;

  if (spi < 0.9) {
    score = Math.max(score, 2);
    reasons.push(`SPI ${spi.toFixed(2)} — schedule slipping`);
  } else if (spi < 0.95) {
    score = Math.max(score, 1);
    reasons.push(`SPI ${spi.toFixed(2)} — minor schedule risk`);
  }

  if (cpi < 0.9) {
    score = Math.max(score, 2);
    reasons.push(`CPI ${cpi.toFixed(2)} — cost overrun`);
  } else if (cpi < 0.95) {
    score = Math.max(score, 1);
    reasons.push(`CPI ${cpi.toFixed(2)} — cost pressure`);
  }

  const ncrs = ext.risks?.ncrs || 0;
  if (ncrs >= 5) {
    score = Math.max(score, 2);
    reasons.push(`${ncrs} NCRs open — quality at risk`);
  } else if (ncrs >= 2) {
    score = Math.max(score, 1);
    reasons.push(`${ncrs} NCRs open — monitor`);
  }

  const val = (["green", "amber", "red"] as const)[score]!;
  const label = (["On Track", "Watch", "At Risk"] as const)[score]!;
  return { val, label, auto: true, reasons };
}

/** Project activity, most-recent first, capped at `limit`. */
export function getProjectActivity(log: ActivityEntry[], projId: string, limit = 10): ActivityEntry[] {
  return log
    .filter((a) => a.projId === projId)
    .sort((a, b) => a.ageMinutes - b.ageMinutes)
    .slice(0, limit);
}

/** KPI-strip derived values for the overview dashboard. */
export function computeMetrics(ext: ProjectExt): OverviewMetrics {
  const pp = ext.progress.plannedPct;
  const ap = ext.progress.actualPct;
  const pgDelta = ap - pp;
  const c = ext.cost;
  const costPct = Math.round((c.incurredCr / c.revisedCr) * 100);
  const costHealth: "green" | "amber" = c.forecastFinalCr <= c.revisedCr ? "green" : "amber";
  const totalRisks =
    ext.risks.rfis + ext.risks.rfcs + ext.risks.ncrs + ext.risks.changeOrders + ext.risks.pendingApprovals;

  return {
    plannedPct: pp,
    actualPct: ap,
    pgDelta,
    costIncurredCr: c.incurredCr,
    costRevisedCr: c.revisedCr,
    costPct,
    costHealth,
    forecastFinalCr: c.forecastFinalCr,
    forecastMarginPct: c.forecastMarginPct,
    spi: ext.spi,
    cpi: ext.cpi,
    scheduleVar: pgDelta,
    totalRisks,
  };
}

/** Cashflow roll-up: per-month net + running balance, totals, and bar-scale max. */
export function buildCashflow(cf: ProjectCashflow): CashflowView {
  let runBal = 0;
  const months: CashflowMonthRollup[] = cf.monthly.map((m) => {
    const outTotal = m.outflow.proc + m.outflow.labour + m.outflow.oh;
    const net = m.inflow - outTotal;
    runBal += net;
    return { ...m, outTotal, net, balance: runBal };
  });

  const totalIn = months.reduce((a, m) => a + m.inflow, 0);
  const totalOut = months.reduce((a, m) => a + m.outTotal, 0);
  const totalProc = months.reduce((a, m) => a + m.outflow.proc, 0);
  const totalLabour = months.reduce((a, m) => a + m.outflow.labour, 0);
  const totalOh = months.reduce((a, m) => a + m.outflow.oh, 0);
  const netCash = totalIn - totalOut;
  const maxVal = Math.max(...months.map((m) => Math.max(m.inflow, m.outTotal)), 1);

  return {
    months,
    totalIn,
    totalOut,
    totalProc,
    totalLabour,
    totalOh,
    netCash,
    maxVal,
    asOf: cf.asOf,
    todayMonth: cf.todayMonth,
  };
}
