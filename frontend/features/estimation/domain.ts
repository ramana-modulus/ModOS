import type { EstCategory, EstConfig, EstItem, EstRowCalc } from "@/features/estimation/types";

/**
 * The core per-line costing math — a faithful port of the prototype's `calcRow`.
 *
 *   base      = material + machinery + manpower
 *   transport = override ?? base × TRANSPORT_PCT
 *   wastage   = override ?? base × WASTAGE_PCT
 *   prime     = material + machinery + manpower + transport + wastage
 *   rateExcl  = prime + prime×OH + prime×Markup        (rate excl. GST)
 *   rateIncl  = rateExcl × (1 + GST/100)               (rate incl. GST)
 *   amt*      = rate* × qty
 */
export function calcRow(it: EstItem, cfg: EstConfig): EstRowCalc {
  const mat = it.material ?? 0;
  const mach = it.machinery ?? 0;
  const man = it.manpower ?? 0;
  const base = mat + mach + man;
  const tr = it.transport != null ? it.transport : base * cfg.transportPct;
  const wa = it.wastage != null ? it.wastage : base * cfg.wastagePct;
  const prime = mat + mach + man + tr + wa;
  const oh = prime * cfg.overheadsPct;
  const mu = prime * cfg.markupPct;
  const rateExcl = prime + oh + mu;
  const gstAmt = (rateExcl * cfg.gstPct) / 100;
  const rateIncl = rateExcl + gstAmt;
  const amtExcl = rateExcl * it.qty;
  const amtIncl = rateIncl * it.qty;
  return { mat, mach, man, tr, wa, prime, oh, mu, rateExcl, rateIncl, amtExcl, amtIncl };
}

/** Items grouped by category, in `EST_CATEGORIES` order (empty categories included). */
export function groupByCategory(items: EstItem[], categories: EstCategory[]): Record<string, EstItem[]> {
  const grouped: Record<string, EstItem[]> = {};
  for (const cat of categories) grouped[cat.id] = [];
  for (const it of items) {
    (grouped[it.cat] ??= []).push(it);
  }
  return grouped;
}

/** Per-category excl-GST amount (sum of `amtExcl`). */
export function categoryTotals(
  grouped: Record<string, EstItem[]>,
  categories: EstCategory[],
  cfg: EstConfig
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const cat of categories) {
    const items = grouped[cat.id] ?? [];
    totals[cat.id] = items.reduce((s, it) => s + calcRow(it, cfg).amtExcl, 0);
  }
  return totals;
}

export interface GrandTotals {
  /** Sum of `amtExcl` — quoted, excl. GST, per unit. */
  grandTotalExcl: number;
  /** Sum of `amtIncl` — quoted, incl. GST, per unit. */
  grandTotalIncl: number;
  /** Sum of `prime × qty` — prime cost per unit. */
  primeCostTotal: number;
}

/** Grand totals across all line items for one unit. */
export function grandTotals(items: EstItem[], cfg: EstConfig): GrandTotals {
  let grandTotalExcl = 0;
  let grandTotalIncl = 0;
  let primeCostTotal = 0;
  for (const it of items) {
    const c = calcRow(it, cfg);
    grandTotalExcl += c.amtExcl;
    grandTotalIncl += c.amtIncl;
    primeCostTotal += c.prime * it.qty;
  }
  return { grandTotalExcl, grandTotalIncl, primeCostTotal };
}

export interface ComponentTotals {
  matTotal: number;
  machTotal: number;
  manTotal: number;
  transTotal: number;
  wasteTotal: number;
}

/** Prime-cost component breakdown (material / machinery / manpower / transport / wastage). */
export function componentTotals(items: EstItem[], cfg: EstConfig): ComponentTotals {
  let matTotal = 0;
  let machTotal = 0;
  let manTotal = 0;
  let transTotal = 0;
  let wasteTotal = 0;
  for (const it of items) {
    const c = calcRow(it, cfg);
    matTotal += (it.material ?? 0) * it.qty;
    machTotal += (it.machinery ?? 0) * it.qty;
    manTotal += (it.manpower ?? 0) * it.qty;
    transTotal += c.tr * it.qty;
    wasteTotal += c.wa * it.qty;
  }
  return { matTotal, machTotal, manTotal, transTotal, wasteTotal };
}

/**
 * Per-unit rate (excl. GST) for a sub-project — the Overview / Consolidated
 * formula. Note this always derives transport/wastage from `base` (it ignores
 * per-item overrides) and applies OH + Markup as a flat multiplier:
 *
 *   prime    = Σ (base + base×TRANSPORT_PCT + base×WASTAGE_PCT) × qty
 *   rateExcl = prime × (1 + OH + Markup)
 */
export function subProjectUnitRateExcl(items: EstItem[], cfg: EstConfig): number {
  const prime = items.reduce((s, it) => {
    const base = (it.material ?? 0) + (it.machinery ?? 0) + (it.manpower ?? 0);
    return s + (base + base * cfg.transportPct + base * cfg.wastagePct) * it.qty;
  }, 0);
  return prime * (1 + cfg.overheadsPct + cfg.markupPct);
}

/** Sub-project total (incl. GST) = unit rate × (1 + GST/100) × units. */
export function subProjectTotalIncl(items: EstItem[], units: number, cfg: EstConfig): number {
  return subProjectUnitRateExcl(items, cfg) * (1 + cfg.gstPct / 100) * units;
}
