/**
 * Planning domain — pure functions ported faithfully from modos_v436.html.
 *
 *   deriveRoute        (17446) — which depts a kickoff decision lights up
 *   tplBlocks          (34174) — per-cabin activity template → WBS bars
 *   getItemDeptProgress(17837) — per-dept scheduling completeness
 *   buildActivityWBSRows(18547) — category → item rollup for the stats bar
 *
 * `new Date` is used for the schedule calendar (allowed for faithful ports).
 */
import type {
  ActivityRow,
  BillingMode,
  Dept,
  DeptProgress,
  KickoffDecision,
  RowSegment,
  SourceItem,
  WbsBlock,
  WbsItem,
} from "@/features/planning/types";
import { BILLING_OVERRIDES, CYCLE_START, KICKOFF_DECISIONS, PROJECT_BILLING_DEFAULT } from "@/features/planning/data";

/** Departments a decision routes through (deriveRoute, 17446). */
export function deriveRoute(decision: KickoffDecision): Dept[] {
  if (!decision || !decision.scType) return [];
  if (decision.scType === "lineitem") return ["subcontracts", "ops", "qa"];
  if (decision.scType === "machinery") return ["subcontracts", "ops", "qa"];
  const freeIssue = decision.matNature === "freeissue";
  if (decision.scType === "self") return freeIssue ? ["engg", "ops", "qa"] : ["engg", "proc", "ops", "qa"];
  return freeIssue ? ["engg", "subcontracts", "ops", "qa"] : ["engg", "proc", "subcontracts", "ops", "qa"];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Per-cabin activity template (tplBlocks, 34174). engg/proc are upstream/shared;
 * ops/qa form a compact per-cabin cycle starting at day CYCLE_START (30). WC-1001
 * & RC-1001 are left partially scheduled in ops/qa (60%) so the demo has
 * schedulable qty.
 */
export function buildBlocks(item: SourceItem, decision: KickoffDecision): WbsBlock[] {
  const out: WbsBlock[] = [];
  const fullQty = item.qtyPerUnit;
  const name = item.name;
  const leaveOpen = item.code === "WC-1001" || item.code === "RC-1001";

  if (decision.scType === "lineitem") {
    out.push({ id: "b_c_" + item.code, day: 1, duration: 14, qty: fullQty, dept: "subcontracts", label: "Subbie alignment — " + name });
    out.push({ id: "b_o_" + item.code, day: CYCLE_START, duration: 5, qty: fullQty, dept: "ops", label: name });
    out.push({ id: "b_q_" + item.code, day: CYCLE_START + 5, duration: 2, qty: fullQty, dept: "qa", label: "QC — " + name });
    return out;
  }

  const isSelf = decision.scType === "self";
  const freeIssue = decision.matNature === "freeissue";
  out.push({ id: "b_e_" + item.code, day: 1, duration: 12, qty: fullQty, dept: "engg", label: "Eng BOM — " + name });
  const procStart = decision.matNature === "engineered" ? 8 : 13;
  const procDur = decision.matNature === "engineered" ? 18 : 10;
  if (!freeIssue) {
    out.push({ id: "b_p_" + item.code, day: procStart, duration: procDur, qty: fullQty, dept: "proc", label: "Procure — " + name });
  }
  if (!isSelf) {
    out.push({ id: "b_s_" + item.code, day: procStart + 2, duration: 8, qty: fullQty, dept: "subcontracts", label: "Engage labour SC — " + name });
  }
  const opsQty = leaveOpen ? round2(fullQty * 0.6) : fullQty;
  out.push({ id: "b_o_" + item.code, day: CYCLE_START, duration: 5, qty: opsQty, dept: "ops", label: (isSelf ? "Self-execute — " : "") + name });
  const qaQty = leaveOpen ? round2(fullQty * 0.6) : fullQty;
  out.push({ id: "b_q_" + item.code, day: CYCLE_START + 5, duration: 2, qty: qaQty, dept: "qa", label: "QC — " + name });
  return out;
}

/** Billing mode: per-item override else the project default (getBillingMode, 17963). */
export function getBillingMode(code: string): BillingMode {
  return BILLING_OVERRIDES[code] ?? PROJECT_BILLING_DEFAULT;
}

/** Sum of a dept's scheduled qty on an item (getDeptScheduledQty, 17827). */
export function deptScheduledQty(blocks: WbsBlock[], dept: Dept): number {
  return blocks.filter((b) => b.dept === dept).reduce((s, b) => s + (b.qty || 0), 0);
}

/** Per-dept progress map (getItemDeptProgress, 17837). */
export function deptProgress(blocks: WbsBlock[], route: Dept[], total: number): DeptProgress[] {
  return route.map((dept) => {
    const scheduled = deptScheduledQty(blocks, dept);
    const pct = total > 0 ? Math.min(Math.round((scheduled / total) * 100), 100) : 0;
    return { dept, scheduled, total, pct, done: scheduled >= total - 0.001 };
  });
}

/** Average scheduling completeness across required depts (getItemOverallPct, 17854). */
export function itemOverallPct(progress: DeptProgress[]): number {
  if (!progress.length) return 0;
  return Math.round(progress.reduce((s, p) => s + p.pct, 0) / progress.length);
}

/** Fully scheduled when every required dept is at 100% (isItemFullyScheduled, 17848). */
export function itemFullyScheduled(progress: DeptProgress[]): boolean {
  return progress.length > 0 && progress.every((p) => p.done);
}

/** Max remaining qty across required depts (getRemainingQty, 17862). */
export function itemRemaining(progress: DeptProgress[]): number {
  return Math.max(0, ...progress.map((p) => p.total - p.scheduled));
}

/** Build the fully-derived WBS item list (= WBS_ITEMS['P1'] after renderWBS). */
export function buildWbsItems(items: SourceItem[]): WbsItem[] {
  return items.map((s) => {
    const decision = KICKOFF_DECISIONS[s.code] ?? { scType: "manpower", matNature: "engineered" };
    const route = deriveRoute(decision);
    const blocks = buildBlocks(s, decision);
    const progress = deptProgress(blocks, route, s.qtyPerUnit);
    return {
      code: s.code,
      name: s.name,
      cat: s.cat,
      catId: s.catId,
      uom: s.uom,
      totalQty: s.qtyPerUnit,
      unitValue: s.unitValue,
      decision,
      route,
      billing: getBillingMode(s.code),
      blocks,
      deptProgress: progress,
      overallPct: itemOverallPct(progress),
      fullyScheduled: itemFullyScheduled(progress),
      remaining: itemRemaining(progress),
    };
  });
}

/**
 * Category → item rollup (buildActivityWBSRows, 18547). Value-weighted category
 * progress; item rows carry per-block segments. Returns the rows plus the
 * project-wide value-weighted `overallPct` (the WBS "Schedule Progress").
 */
export function buildActivityRows(items: WbsItem[]): { rows: ActivityRow[]; overallPct: number } {
  const DEPT_ORDER: Dept[] = ["engg", "proc", "subcontracts", "ops", "qa"];
  const order: string[] = [];
  const byCat: Record<string, { name: string; items: WbsItem[] }> = {};
  for (const it of items) {
    if (!it.blocks.length) continue; // only scheduled items appear
    if (!byCat[it.catId]) {
      byCat[it.catId] = { name: it.cat, items: [] };
      order.push(it.catId);
    }
    byCat[it.catId]!.items.push(it);
  }

  const rows: ActivityRow[] = [];
  let gVal = 0;
  let gValPct = 0;

  for (const catId of order) {
    const grp = byCat[catId]!;
    const aId = "a_" + catId;
    let aStart = Infinity;
    let aEnd = -Infinity;
    let vSum = 0;
    let vPct = 0;
    const span: Partial<Record<Dept, { min: number; max: number }>> = {};
    const childRows: ActivityRow[] = [];

    for (const it of grp.items) {
      const pct = it.overallPct;
      const val = it.unitValue * it.totalQty;
      vSum += val;
      vPct += val * pct;
      gVal += val;
      gValPct += val * pct;
      let iS = Infinity;
      let iE = -Infinity;
      const iSeg: RowSegment[] = [];
      for (const b of [...it.blocks].sort((a, c) => a.day - c.day)) {
        const e = b.day + b.duration;
        iS = Math.min(iS, b.day);
        iE = Math.max(iE, e);
        aStart = Math.min(aStart, b.day);
        aEnd = Math.max(aEnd, e);
        const cur = span[b.dept];
        if (!cur) span[b.dept] = { min: b.day, max: e };
        else {
          cur.min = Math.min(cur.min, b.day);
          cur.max = Math.max(cur.max, e);
        }
        iSeg.push({ dept: b.dept, start: b.day, dur: b.duration });
      }
      const iStatus = pct >= 100 ? "completed" : pct > 0 ? "in_progress" : "not_started";
      childRows.push({
        id: "i_" + it.code,
        level: 2,
        parentId: aId,
        name: it.name,
        code: it.code,
        start: iS === Infinity ? 1 : iS,
        dur: Math.max((iE === -Infinity ? 1 : iE) - (iS === Infinity ? 1 : iS), 1),
        status: iStatus,
        progress: pct,
        segments: iSeg,
      });
    }

    const aProg =
      vSum > 0
        ? Math.round(vPct / vSum)
        : Math.round(grp.items.reduce((t, it) => t + it.overallPct, 0) / Math.max(grp.items.length, 1));
    const aStatus = aProg >= 100 ? "completed" : aProg > 0 ? "in_progress" : "not_started";
    const aSeg: RowSegment[] = DEPT_ORDER.filter((d) => span[d]).map((d) => ({
      dept: d,
      start: span[d]!.min,
      dur: span[d]!.max - span[d]!.min,
    }));
    rows.push({
      id: aId,
      level: 1,
      name: grp.name,
      start: aStart === Infinity ? 1 : aStart,
      dur: Math.max((aEnd === -Infinity ? 1 : aEnd) - (aStart === Infinity ? 1 : aStart), 1),
      status: aStatus,
      progress: aProg,
      segments: aSeg,
    });
    childRows.forEach((r) => rows.push(r));
  }

  return { rows, overallPct: gVal > 0 ? Math.round(gValPct / gVal) : 0 };
}

/* ─────────────────────────── Calendar helpers ─────────────────────────── */

/** Parse a "01 Apr 2026" display date to a Date. */
export function parseDate(s: string): Date {
  return new Date(s);
}

/** Add `n` calendar days to a date (non-mutating). */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Format as "30 Jul 2026" (en-IN). */
export function fmtDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Day index (1-based) of DEMO_TODAY within a project's timeline (demoTodayDay,
 * 18618). Falls back to 53 if the computed day is non-positive.
 */
export function demoTodayDay(startDate: string, today: string): number {
  const d = Math.floor((new Date(today).getTime() - new Date(startDate).getTime()) / 86400000) + 1;
  return d > 0 ? d : 53;
}

/** Planned end date = startDate + duration days (renderWBS stats bar). */
export function plannedEndDate(startDate: string, duration: number): string {
  return fmtDate(addDays(parseDate(startDate), duration));
}

/** Projected end date = planned + 5 days slip (renderWBS stats bar). */
export function projectedEndDate(startDate: string, duration: number): string {
  return fmtDate(addDays(parseDate(startDate), duration + 5));
}

/** Linear planned % of a block at a given day (getBlockPlannedPctAtDay, 18235). */
export function blockPlannedPctAtDay(block: WbsBlock, today: number): number {
  if (today < block.day) return 0;
  if (today >= block.day + block.duration) return 100;
  return Math.round(((today - block.day + 1) / block.duration) * 100);
}
