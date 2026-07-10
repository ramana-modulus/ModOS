import type {
  GrnReceipt,
  Indent,
  QcRequest,
  ScopeCheckpoint,
  ScopeItem,
  ScopeRecord,
  SiteLogEntry,
  StoreIssue,
} from "@/features/ops/types";

const DISCRETE_UOMS = new Set([
  "nos", "no", "nr", "pcs", "pc", "pce", "units", "unit", "set", "sets",
  "pair", "pairs", "each", "ea", "ls", "l.s.", "lumpsum", "lump sum", "job", "jobs",
]);

/** Whole-number units (nos / sets / LS) vs continuous (kg / m / sqm). */
export function isDiscreteUom(uom: string | null | undefined): boolean {
  return DISCRETE_UOMS.has(String(uom ?? "").trim().toLowerCase());
}

/** Round to 2 dp for continuous quantities, whole numbers for large values. */
export function roundQ(x: number): number {
  return Math.abs(x) >= 100 ? Math.round(x) : Math.round(x * 100) / 100;
}

/** Parse a `DD MMM YYYY` (optionally with a ` · HH:MM` suffix) to epoch ms. */
export function parseOpsDate(s: string | null | undefined): number {
  if (!s) return 0;
  const m = /(\d{1,2})\s+(\w{3})\s+(\d{4})/.exec(s);
  if (!m) return 0;
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const mo = months[m[2]!];
  if (mo === undefined) return 0;
  return new Date(Number(m[3]), mo, Number(m[1])).getTime();
}

/** Project week number (Day 1 = 01 Apr 2026), matching `opsWeekOf`. */
export function opsWeekOf(dateStr: string): number {
  const t = parseOpsDate(dateStr);
  if (!t) return 1;
  const day = Math.floor((t - new Date(2026, 3, 1).getTime()) / 86400000) + 1;
  return Math.max(1, Math.ceil(day / 7));
}

/** Authoritative execution total for a line — never below what's installed. */
export function lineTotal(item: ScopeItem, rec: ScopeRecord | undefined): number {
  return Math.max(item.plannedTotal, rec?.cumQty ?? 0);
}

export interface ScopeProgress {
  plan: number;
  done: number;
  pct: number;
  linesActive: number;
  totalLines: number;
}

/** Aggregate scope progress across quantity-tracked lines (the Execution %). */
export function scopeProgress(
  items: ScopeItem[],
  scope: Record<string, ScopeRecord>
): ScopeProgress {
  let plan = 0;
  let done = 0;
  let linesActive = 0;
  for (const it of items) {
    const rec = scope[it.code];
    const lt = lineTotal(it, rec);
    const cum = rec?.cumQty ?? 0;
    plan += lt;
    done += Math.min(lt, cum);
    if (cum > 0) linesActive++;
  }
  const pct = plan > 0 ? Math.round((done / plan) * 1000) / 10 : 0;
  return { plan, done, pct, linesActive, totalLines: items.length };
}

export interface CatRollup {
  cat: string;
  lines: number;
  plan: number;
  done: number;
  pct: number;
}

/** Per-category scope rollup, preserving the source item order. */
export function categoryRollups(
  items: ScopeItem[],
  scope: Record<string, ScopeRecord>
): CatRollup[] {
  const order: string[] = [];
  const byCat = new Map<string, ScopeItem[]>();
  for (const it of items) {
    const c = it.cat || "Other";
    if (!byCat.has(c)) {
      byCat.set(c, []);
      order.push(c);
    }
    byCat.get(c)!.push(it);
  }
  return order.map((cat) => {
    const list = byCat.get(cat)!;
    let plan = 0;
    let done = 0;
    for (const it of list) {
      const rec = scope[it.code];
      const lt = lineTotal(it, rec);
      plan += lt;
      done += Math.min(lt, rec?.cumQty ?? 0);
    }
    return { cat, lines: list.length, plan, done, pct: plan > 0 ? Math.round((done / plan) * 100) : 0 };
  });
}

export interface ScopeTick {
  date: string;
  cum: number;
  dpr: string;
}

/** Dated markers under the progress bar — DPR checkpoints, else derived from the log. */
export function checkpointTicks(rec: ScopeRecord): ScopeTick[] {
  const cps: ScopeCheckpoint[] = (rec.checkpoints || []).filter((c) => c.cum != null);
  if (cps.length) return cps.map((c) => ({ date: c.date, cum: c.cum!, dpr: c.dpr }));
  const log = (rec.log || []).filter((l) => l.qty != null);
  if (!log.length) return [];
  let run = 0;
  return log
    .slice()
    .reverse()
    .map((l) => {
      run += l.qty!;
      return { date: l.date, cum: Math.round(run * 100) / 100, dpr: l.src === "subcon" ? "SC log" : "site log" };
    });
}

/**
 * Per-cabin executed split for a repeated sub-project (identical units). A
 * linear ramp with mean = aggDone/(per·U) so Σ == aggDone exactly — a realistic
 * parallel build front rather than filling cabins 1..N sequentially. Faithful
 * port of the prototype's `clSeedExec`.
 */
export function cabinRamp(plannedTotal: number, units: number, aggDone: number): number[] {
  const U = Math.max(1, units);
  const per = plannedTotal / U;
  const out = new Array<number>(U).fill(0);
  if (!(per > 1e-12) || !(aggDone > 1e-9)) return out;
  const frac = Math.min(1, aggDone / (per * U));
  const fOf = (i: number): number => {
    if (U === 1) return frac;
    return frac <= 0.5 ? (2 * frac * (U - i)) / (U - 1) : 1 - (2 * (1 - frac) * (i - 1)) / (U - 1);
  };
  let running = 0;
  for (let i = 1; i <= U; i++) {
    const v = Math.max(0, Math.min(per, fOf(i) * per));
    out[i - 1] = v;
    running += v;
  }
  // Absorb float residual so Σ equals aggDone to the penny.
  let diff = aggDone - running;
  for (let i = 0; i < U && Math.abs(diff) > 1e-6; i++) {
    const room = diff > 0 ? per - out[i]! : -out[i]!;
    const add = diff > 0 ? Math.min(room, diff) : Math.max(room, diff);
    out[i] = out[i]! + add;
    diff -= add;
  }
  return out;
}

export interface CabinRollup {
  done: number;
  inprog: number;
  pend: number;
  per: number;
}

/** Cabin-count rollup (done / in-progress / pending) from the ramped split. */
export function cabinRollup(plannedTotal: number, units: number, aggDone: number): CabinRollup {
  const per = units > 0 ? plannedTotal / units : plannedTotal;
  const split = cabinRamp(plannedTotal, units, aggDone);
  let done = 0;
  let inprog = 0;
  let pend = 0;
  for (const q of split) {
    if (q >= per - 1e-6) done++;
    else if (q > 1e-6) inprog++;
    else pend++;
  }
  return { done, inprog, pend, per };
}

/* ─────────────────────────── Store ─────────────────────────── */

export interface StoreLedgerEntry {
  date: string;
  kind: "grn" | "issue";
  reason?: string;
  delta: number;
  label: string;
  by: string;
  ref: string;
  note: string;
}

export interface StoreMaterial {
  code: string;
  name: string;
  uom: string;
  rec: number;
  iss: number;
  util: number;
  waste: number;
  dmg: number;
  ret: number;
  avail: number;
  ledger: StoreLedgerEntry[];
}

/**
 * Per-material store rollup from the spine: GRN receipts (net of rejects) minus
 * issues by reason. `available = received − issues`. Simplified port of
 * `opsStoreModel` (the seed materials are all commodities — no QC hold gate).
 */
export function storeModel(
  receipts: Record<string, GrnReceipt[]>,
  issues: StoreIssue[],
  matNames: Record<string, { name: string; uom: string }>
): StoreMaterial[] {
  const mat = new Map<string, StoreMaterial>();
  const blank = (code: string): StoreMaterial => ({
    code,
    name: matNames[code]?.name ?? "",
    uom: matNames[code]?.uom ?? "",
    rec: 0, iss: 0, util: 0, waste: 0, dmg: 0, ret: 0, avail: 0, ledger: [],
  });

  for (const [code, grns] of Object.entries(receipts)) {
    for (const g of grns) {
      const m = mat.get(code) ?? mat.set(code, blank(code)).get(code)!;
      const net = (g.qtyReceived || 0) - (g.rejectedQty || 0);
      m.rec += net;
      if (!m.uom && g.uom) m.uom = g.uom;
      m.ledger.push({ date: g.date, kind: "grn", delta: net, label: `GRN ${g.grnId}`, by: g.receivedBy || "Store", ref: g.poNumber || "", note: g.note || "" });
    }
  }

  for (const i of issues) {
    const m = mat.get(i.matCode) ?? mat.set(i.matCode, blank(i.matCode)).get(i.matCode)!;
    const r = i.reason || "utilised";
    m.iss += i.qty || 0;
    if (r === "utilised") m.util += i.qty || 0;
    else if (r === "wasted") m.waste += i.qty || 0;
    else if (r === "damaged") m.dmg += i.qty || 0;
    else if (r === "returned") m.ret += i.qty || 0;
    if (i.uom && !m.uom) m.uom = i.uom;
    m.ledger.push({
      date: i.date, kind: "issue", reason: r, delta: -(i.qty || 0),
      label: r.charAt(0).toUpperCase() + r.slice(1) + (i.toCode ? ` → ${i.toCode}` : ""),
      by: i.by || "Store", ref: i.toCode || "", note: i.note || "",
    });
  }

  const out = [...mat.values()];
  for (const m of out) {
    m.avail = Math.round((m.rec - m.iss) * 100) / 100;
    m.ledger.sort((a, b) => parseOpsDate(b.date) - parseOpsDate(a.date));
  }
  return out.sort((a, b) => a.code.localeCompare(b.code));
}

/* ─────────────────────────── Coordination rollups ─────────────────────────── */

export interface IndentRollup {
  total: number;
  pending: number;
  breached: number;
  approved: number;
}

export function indentRollup(indents: Indent[]): IndentRollup {
  return {
    total: indents.length,
    pending: indents.filter((i) => i.status === "pending_approval").length,
    breached: indents.filter((i) => i.slaState === "breached").length,
    approved: indents.filter((i) => i.status === "approved").length,
  };
}

/** Open hindrances = hindrance entries not yet resolved. */
export function openHindrances(log: SiteLogEntry[]): number {
  return log.filter((e) => e.kind === "hindrance" && e.status !== "resolved").length;
}

/** QC requests awaiting inspection (requested / scheduled). */
export function openQcRequests(reqs: QcRequest[]): number {
  return reqs.filter((r) => r.status === "requested" || r.status === "scheduled").length;
}
