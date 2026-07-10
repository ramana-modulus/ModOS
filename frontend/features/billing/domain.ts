/**
 * Billing domain — pure derivation helpers. Faithful ports of the measurement /
 * RA / register math in modos_v436.html. No I/O; safe to unit-test directly.
 *
 * SIMPLIFICATIONS vs the prototype (all confined to cross-module reconciliation
 * the Billing module does not own — see `cabin` helpers):
 *   - `measForwarded` (QA "Billing Clearance" gate) → all seeded lines forwarded.
 *   - per-cabin executed qty (Ops spine) → a seeded per-cabin scope constant.
 *   - per-cabin QC status (QA cabin sign-off) → a seeded deterministic split.
 *   - certified/received AR overlay uses BILL_CLIENT + FIN_RECEIPTS only.
 */
import { BILL_CONFIG, EST_CATEGORIES } from "@/features/billing/data/config";
import { BILL_CLIENT } from "@/features/billing/data/client-bills";
import { FIN_RECEIPTS } from "@/features/billing/data/sc-bills";
import type {
  BillMeas,
  CabinQcStatus,
  CabinRollup,
  CabinRow,
  CabinStage,
  Execution,
  MeasStatus,
} from "@/features/billing/types";

export const RETENTION = BILL_CONFIG.retentionPct / 100; // 0.05
export const GST = BILL_CONFIG.gstPct / 100; // 0.18
export const TDS_SC = 0.01; // subcontractor TDS 1%

/** A `-M-` code is raw material — no client (AR) face; it gates vendor AP only. */
export function qcCodeIsMaterial(code: string): boolean {
  return String(code || "").includes("-M-");
}

/* ─────────────────────────── Spine line derivations ─────────────────────────── */

/** Client (AR) value of a measured line: milestone % × value, or qty × BOQ rate. */
export function billMeasClientValue(m: BillMeas): number {
  if (qcCodeIsMaterial(m.code)) return 0;
  if (m.billingBasis === "milestone") {
    const pct = m.plannedTotalQty ? m.measuredQty / m.plannedTotalQty : 0;
    return Math.round((m.milestoneValue || 0) * pct);
  }
  return Math.round((m.measuredQty || 0) * (m.clientRate || 0));
}

/** Execution (AP) cost of a line — sum of its sub-scope values. */
export function billMeasExecCost(m: BillMeas): number {
  return (m.execution || []).reduce((s, e) => s + (e.value || 0), 0);
}

/** Planning category, derived from the code prefix and resolved via EST_CATEGORIES. */
export function billMeasCat(m: BillMeas): { id: string; label: string } {
  const id = String(m?.code || "").split("-")[0] ?? "";
  const c = EST_CATEGORIES.find((x) => x.id === id);
  return c ? { id, label: c.label } : { id: "PRELIM", label: "Preliminaries & Milestones" };
}

/** Over-certification / over-execution flags (SC certified beyond measured qty). */
export function billMeasReconcile(m: BillMeas): string[] {
  const issues: string[] = [];
  const measured = m.measuredQty || 0;
  (m.execution || [])
    .filter((e) => e.basis === "output")
    .forEach((e) => {
      if ((e.qty || 0) > measured + 0.001) {
        issues.push(`${e.scope} — ${e.qty} exceeds measured ${measured}`);
      }
      if (e.scCertified != null && e.scCertified > measured + 0.001) {
        const ahead = e.scCertified - measured;
        const exposure = Math.round(ahead * (e.rate || 0));
        issues.push(
          `${e.subbieName || e.subbie} certified ${e.scCertified} vs ${measured} measured (${ahead} ${m.uom || ""} ahead, ₹${exposure} exposure)`
        );
      }
    });
  return issues;
}

/** SC-mode tag for a line (Line-item / Manpower / In-house / Material). */
export function measScType(m: BillMeas): { label: string; fg: string; bg: string } | null {
  const modes = (m.execution || []).map((e) => e.mode);
  if (modes.includes("lineitem")) return { label: "Line-item SC", fg: "#185FA5", bg: "#185FA51A" };
  if (modes.includes("manpower")) return { label: "Manpower SC", fg: "#854F0B", bg: "#854F0B1A" };
  if (modes.includes("inhouse")) return { label: "In-house", fg: "#6B6A68", bg: "#6B6A681A" };
  if (modes.includes("material")) return { label: "Material", fg: "#0E7490", bg: "#0E74901A" };
  return null;
}

/* ─────────────────────────── Measurement sheet math ─────────────────────────── */

export type MeasModeName = "weight" | "area" | "volume" | "linear" | "count" | "ls";

export function measMode(uom: string): MeasModeName {
  const u = (uom || "").toLowerCase().replace(/[\s.]/g, "");
  if (["kg", "mt", "ton", "tonne", "tonnes", "t"].includes(u)) return "weight";
  if (["sqm", "sqft", "sm", "m2", "sq", "sqmt", "sft"].includes(u)) return "area";
  if (["cum", "cm", "m3", "cbm", "cumt"].includes(u)) return "volume";
  if (["m", "rmt", "rm", "mtr", "rft", "ft", "meter", "metre", "running"].includes(u)) return "linear";
  if (["ls", "lumpsum", "lump", "job", "%"].includes(u)) return "ls";
  return "count";
}

export function measModeMeta(mode: MeasModeName): { label: string; fields: string[]; formula: string } {
  const map: Record<MeasModeName, { label: string; fields: string[]; formula: string }> = {
    weight: { label: "Weight (kg)", fields: ["no", "unitWt"], formula: "No × unit-wt" },
    area: { label: "Area", fields: ["no", "L", "B"], formula: "No × L × B" },
    volume: { label: "Volume", fields: ["no", "L", "B", "H"], formula: "No × L × B × H" },
    linear: { label: "Length", fields: ["no", "L"], formula: "No × L" },
    count: { label: "Count", fields: ["no"], formula: "No" },
    ls: { label: "Lump sum", fields: ["portion"], formula: "portion of 1" },
  };
  return map[mode];
}

export function measRowQty(
  mode: MeasModeName,
  r: { no?: number; L?: number; B?: number; H?: number; unitWt?: number; portion?: number }
): number {
  const n = Number(r.no) || 0;
  const L = Number(r.L) || 0;
  const B = Number(r.B) || 0;
  const H = Number(r.H) || 0;
  const w = Number(r.unitWt) || 0;
  const p = Number(r.portion) || 0;
  switch (mode) {
    case "weight":
      return n * w;
    case "area":
      return n * L * B;
    case "volume":
      return n * L * B * H;
    case "linear":
      return n * L;
    case "ls":
      return p;
    default:
      return n;
  }
}

/** Sum of a line's measurement rows — the source the spine total projects from. */
export function measSheetQty(m: BillMeas): number {
  const mode = measMode(m.uom);
  const q = (m.measurements || []).reduce((s, r) => s + measRowQty(mode, r), 0);
  return Math.round(q * 100) / 100;
}

const MEAS_STATUS_META: Record<MeasStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Measuring", color: "#6B6A68", bg: "#F0EFEB" },
  measured: { label: "Measuring", color: "#6B6A68", bg: "#F0EFEB" },
  submitted: { label: "Awaiting approval", color: "#854F0B", bg: "#FBF1E0" },
  approved: { label: "Approved", color: "#3B6D11", bg: "#EAF3DE" },
  rejected: { label: "Returned for revision", color: "#A32D2D", bg: "#FCEBEB" },
  billed: { label: "Billed", color: "#185FA5", bg: "#E6F1FB" },
};

export function measStatusMeta(status: MeasStatus): { label: string; color: string; bg: string } {
  return MEAS_STATUS_META[status] ?? MEAS_STATUS_META.draft;
}

/* ─────────────────────────── RA projections ─────────────────────────── */

/** Retention/GST/net for a client (AR) gross. */
export function clientTax(gross: number): { retention: number; gst: number; net: number } {
  const retention = Math.round(gross * RETENTION);
  const gst = Math.round((gross - retention) * GST);
  return { retention, gst, net: gross - retention + gst };
}

/** Retention/TDS/GST/net for a subcontractor (AP) gross. */
export function subcTax(gross: number): { retention: number; tds: number; gst: number; net: number } {
  const retention = Math.round(gross * RETENTION);
  const tds = Math.round(gross * TDS_SC);
  const gst = Math.round((gross - retention) * GST);
  return { retention, tds, gst, net: gross - retention - tds + gst };
}

/* ─────────────────────────── Cabin RA roll-up (seeded / derived) ─────────────────────────── */

/** A spine line is a "prelim" (sub-project scope) when milestone / lump-sum. */
export function isPrelim(m: BillMeas): boolean {
  return m.billingBasis === "milestone" || m.uom === "LS";
}

/**
 * Seeded per-cabin cabin-scope: for each cabin-scope spine line, a representative
 * per-cabin executed quantity. Client rate is the BOQ clientRate; SC rate is the
 * line's output-basis execution rate. (Prototype derives these live from the Ops
 * per-cabin spine; simplified here — the Billing module does not own Ops.)
 */
export const CABIN_SCOPE_QTY: Record<string, number> = {
  "SS-1001": 220,
  "EL-1001": 8,
  "WC-1001": 34,
  "SS-1004": 40,
};

function outputRate(exec: Execution[] | undefined): number {
  const row = (exec || []).find((e) => e.basis === "output");
  return row?.rate || 0;
}

/** Per-cabin AR gross and AP gross, derived once from the spine's cabin-scope lines. */
export function cabinScopeValues(spine: BillMeas[]): { perCabinAr: number; perCabinAp: number } {
  let perCabinAr = 0;
  let perCabinAp = 0;
  for (const m of spine) {
    const qty = CABIN_SCOPE_QTY[m.code];
    if (qty == null || isPrelim(m) || qcCodeIsMaterial(m.code)) continue;
    perCabinAr += Math.round(qty * (m.clientRate || 0));
    perCabinAp += Math.round(qty * outputRate(m.execution));
  }
  return { perCabinAr, perCabinAp };
}

/**
 * Seeded per-cabin QC status. Deterministic split: cabins 1..(units-9) pass,
 * next 5 hold (cleared with an open NCR), the last 9 are pending final QC.
 */
export function cabinQcStatus(n: number, units: number): CabinQcStatus {
  const pending = Math.min(9, Math.max(0, units - 1));
  const holdStart = units - pending - 5;
  if (n > units - pending) return "pending";
  if (n > holdStart) return "hold";
  return "pass";
}

function cabinCleared(status: CabinQcStatus): boolean {
  return status === "pass" || status === "hold";
}

/**
 * Seeded per-cabin lifecycle stage (mirrors `_seedCabinBills`): among cleared
 * cabins in order, the first 8 are paid, next 8 certified, next 8 billed, the
 * rest cleared-but-unbilled. Un-cleared cabins are "notready".
 */
export function cabinStage(n: number, units: number): CabinStage {
  const status = cabinQcStatus(n, units);
  if (!cabinCleared(status)) return "notready";
  let idx = 0;
  for (let i = 1; i < n; i++) if (cabinCleared(cabinQcStatus(i, units))) idx++;
  if (idx < 8) return "paid";
  if (idx < 16) return "certified";
  if (idx < 24) return "billed";
  return "unbilled";
}

export function cabinBillNo(n: number): string {
  return "MH/ORG/RA/C" + String(n).padStart(2, "0");
}

/** Per-cabin billable roll-up (AR/AP/margin + lifecycle) across all cabins. */
export function cabinRows(spine: BillMeas[], units: number): CabinRow[] {
  const { perCabinAr, perCabinAp } = cabinScopeValues(spine);
  const rows: CabinRow[] = [];
  for (let n = 1; n <= units; n++) {
    const qc = cabinQcStatus(n, units);
    const stage = cabinStage(n, units);
    const cleared = cabinCleared(qc);
    const ar = cleared ? perCabinAr : 0;
    const ap = cleared ? perCabinAp : 0;
    rows.push({
      n,
      qc,
      stage,
      ar,
      ap,
      margin: ar - ap,
      billNo: stage === "billed" || stage === "certified" || stage === "paid" ? cabinBillNo(n) : null,
      billDate: null,
    });
  }
  return rows;
}

/** Cabin-scope AR roll-up by lifecycle stage — the bridge into project AR. */
export function cabinArRollup(spine: BillMeas[], units: number): CabinRollup | null {
  if (units <= 1) return null;
  const rows = cabinRows(spine, units);
  const bucket = (stage: CabinStage) => {
    const rs = rows.filter((r) => r.stage === stage);
    const gross = rs.reduce((s, r) => s + r.ar, 0);
    const { net } = clientTax(gross);
    return { n: rs.length, gross, net };
  };
  const unbilled = bucket("unbilled");
  const billed = bucket("billed");
  const certified = bucket("certified");
  const paid = bucket("paid");
  const billableN = unbilled.n + billed.n + certified.n + paid.n;
  return {
    units,
    unbilled,
    billed,
    certified,
    paid,
    pending: Math.max(0, units - billableN),
    totalAr: rows.reduce((s, r) => s + r.ar, 0),
    totalAp: rows.reduce((s, r) => s + r.ap, 0),
  };
}

/* ─────────────────────────── Bill Register (AR/AP by cycle) ─────────────────────────── */

export interface RegArCycle {
  cycle: string;
  gross: number;
  ret: number;
  gst: number;
  net: number;
  status: "billed" | "partial" | "claimable";
  pending: number;
  certified: number;
  received: number;
  billedOn: string | null;
}

/** AR by RA cycle for a scope (cabin-aware: keeps prelim lines only when cabinized). */
export function regKeyAR(key: string, spine: BillMeas[], units: number): Record<string, RegArCycle> {
  const projId = key.split(".")[0] ?? "";
  const spId = key.split(".")[1] ?? "";
  const hasCab = units > 1;
  const isMat = (m: BillMeas) => qcCodeIsMaterial(m.code);
  const byCy: Record<string, RegArCycle & { allBilled: boolean }> = {};

  spine
    .filter(
      (m) => (m.status === "approved" || m.status === "billed") && !isMat(m) && !(hasCab && !isPrelim(m))
    )
    .forEach((m) => {
      const cy = m.cycle;
      const rec = (byCy[cy] ??= {
        cycle: cy,
        gross: 0,
        ret: 0,
        gst: 0,
        net: 0,
        status: "claimable",
        pending: 0,
        certified: 0,
        received: 0,
        billedOn: null,
        allBilled: true,
      });
      rec.gross += billMeasClientValue(m);
      if (m.status !== "billed") rec.allBilled = false;
      if (m.status === "billed" && m.billedOn) rec.billedOn = m.billedOn;
    });

  for (const cy of Object.keys(byCy)) {
    const o = byCy[cy]!;
    const fwdCy = spine.filter((m) => m.cycle === cy && !isMat(m));
    o.pending = fwdCy.filter((m) => !(m.status === "approved" || m.status === "billed")).length;
    const tax = clientTax(o.gross);
    o.ret = tax.retention;
    o.gst = tax.gst;
    o.net = tax.net;
    o.status = o.allBilled ? "billed" : o.pending > 0 ? "partial" : "claimable";
    const bill = (BILL_CLIENT[key] || []).find((b) => b.id === cy);
    o.certified =
      bill && ["certified", "invoiced", "paid"].includes(bill.status) ? bill.certifiedAmount || o.net : 0;
    o.received = FIN_RECEIPTS.filter(
      (r) => r.clientBillRef === cy && r.project === projId && r.subProj === spId
    ).reduce((s, r) => s + r.amount, 0);
  }
  return byCy;
}

export interface RegApCycle {
  cycle: string;
  gross: number;
  net: number;
  manGross: number;
  status: "paid" | "certified" | "pending";
  bySub: Record<string, { subbie: string; name: string; gross: number }>;
}

/** AP by RA cycle for a scope (line-item SC only; manpower rolled up separately). */
export function regKeyAP(_key: string, spine: BillMeas[], scPaidCycles: Set<string>, scCertCycles: Set<string>): Record<string, RegApCycle> {
  const byCy: Record<string, RegApCycle & { lineGross: number }> = {};
  spine
    .filter((m) => m.status === "approved" || m.status === "billed")
    .forEach((m) => {
      (m.execution || []).forEach((e) => {
        if (e.mode !== "lineitem" && e.mode !== "manpower") return;
        const cy = m.cycle;
        const o = (byCy[cy] ??= {
          cycle: cy,
          gross: 0,
          net: 0,
          manGross: 0,
          status: "pending",
          bySub: {},
          lineGross: 0,
        });
        if (e.mode === "manpower") {
          o.manGross += e.value || 0;
          return;
        }
        const k = e.subbie || "?";
        (o.bySub[k] ??= { subbie: k, name: e.subbieName || k, gross: 0 }).gross += e.value || 0;
        o.lineGross += e.value || 0;
      });
    });

  for (const cy of Object.keys(byCy)) {
    const o = byCy[cy]!;
    o.gross = o.lineGross;
    o.net = subcTax(o.gross).net;
    o.status = scPaidCycles.has(cy) ? "paid" : scCertCycles.has(cy) ? "certified" : "pending";
  }
  return byCy;
}
