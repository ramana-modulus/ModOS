/**
 * Subcontracts pure domain helpers — faithful ports of the prototype's `sc*`
 * functions (key math, bill math, value-based approval, lifecycle staging,
 * measurement/claim rollups, subbie scorecard). No DOM, no mutation.
 */
import {
  SC_APPROVAL,
  SC_BILLS,
  SC_CAT_LABELS,
  SC_ENQUIRIES,
  SC_EXEC_LOG,
  SC_MEASUREMENTS,
  SC_PACKAGES,
  SC_SUBBIE_ONTIME,
  SC_SUBBIES,
  SC_WORKORDERS,
} from "@/features/subcontracts/data";
import type {
  ScApprovalTier,
  ScBill,
  ScBillCalc,
  ScLifecycleStage,
  ScPackage,
  ScSubbie,
} from "@/features/subcontracts/types";

/* ─────────────────────────── Key helpers ─────────────────────────── */

export function scProjSp(lineKey: string): string {
  return lineKey.split(".").slice(0, 2).join(".");
}
export function scCodeOf(lineKey: string): string {
  return lineKey.split(".").slice(2).join(".");
}
export function scSubbieOf(lineKey: string): string | null {
  return SC_WORKORDERS[lineKey]?.subbie ?? null;
}
export function scRaBillKey(projsp: string, sub: string, week: number): string {
  return `${projsp}.${sub}~RA${week}`;
}
export function scBillWeek(bk: string): number | null {
  const m = /~RA(\d+)$/.exec(bk);
  return m ? parseInt(m[1]!, 10) : null;
}
export function scRaBillKeysFor(projsp: string): string[] {
  return Object.keys(SC_BILLS)
    .filter((bk) => bk.startsWith(projsp + "."))
    .sort((a, b) => (scBillWeek(a) ?? 0) - (scBillWeek(b) ?? 0));
}

/** True if any recorded SC bill covers this line-item key. */
export function anySubcBill(lineKey: string): boolean {
  const sub = scSubbieOf(lineKey);
  if (!sub) return false;
  const pre = `${scProjSp(lineKey)}.${sub}~RA`;
  const code = scCodeOf(lineKey);
  return Object.keys(SC_BILLS).some(
    (bk) => bk.startsWith(pre) && (SC_BILLS[bk]!.lines || []).some((l) => l.code === code)
  );
}

/** The bill (if any) for a line-item key in a given RA week. */
export function scBillForLineWeek(lineKey: string, week: number): { bk: string; b: ScBill } | null {
  const sub = scSubbieOf(lineKey);
  if (!sub) return null;
  const bk = scRaBillKey(scProjSp(lineKey), sub, week);
  const b = SC_BILLS[bk];
  return b && b.lines.some((l) => l.code === scCodeOf(lineKey)) ? { bk, b } : null;
}

/* ─────────────────────────── Bill / approval math ─────────────────────────── */

/** SC bill money math (gross → retention → taxable → +GST −TDS → net). */
export function scBillCalc(b: Pick<ScBill, "gross" | "retentionPct" | "gstPct" | "tdsPct">): ScBillCalc {
  const retention = Math.round((b.gross * b.retentionPct) / 100);
  const taxable = b.gross - retention;
  const gst = Math.round((taxable * b.gstPct) / 100);
  const tds = Math.round((taxable * b.tdsPct) / 100);
  return { retention, taxable, gst, tds, net: taxable + gst - tds };
}

/** Value-based approver tier for a work-order value. */
export function scApprover(value: number): ScApprovalTier {
  return SC_APPROVAL.find((a) => value <= a.max) ?? SC_APPROVAL[SC_APPROVAL.length - 1]!;
}

/** Approver + threshold-band label for a work-order value. */
export function scApproverMeta(value: number): { who: string; role: string; thresholdLabel: string } {
  const idx = SC_APPROVAL.findIndex((a) => value <= a.max);
  const a = (idx >= 0 ? SC_APPROVAL[idx] : SC_APPROVAL[SC_APPROVAL.length - 1])!;
  const label = idx === 0 ? "< ₹5L" : idx === 1 ? "₹5L – ₹25L" : "> ₹25L";
  return { who: a.who, role: a.role, thresholdLabel: label };
}

/* ─────────────────────────── Compliance / lifecycle ─────────────────────────── */

/** Labour-law compliance gate — a lapsed ESI/PF or pending licence blocks WO release. */
export function scCompliant(s: ScSubbie): boolean {
  const c = s.compliance;
  return !(c.esi === "lapsed" || c.licence === "pending" || c.pf === "lapsed");
}

/** Derived lifecycle stage for a package key. */
export function scLifecycleStage(k: string, rfqExists = false): ScLifecycleStage {
  const enq = SC_ENQUIRIES[k] ?? [];
  const l1 = enq.find((e) => e.selected);
  const wo = SC_WORKORDERS[k];
  const ms = SC_MEASUREMENTS[k] ?? [];
  if (anySubcBill(k)) return "bill";
  if (wo && wo.status === "released") return ms.length ? "measuring" : "released";
  if (wo) return "wo_pending";
  if (l1) return "l1";
  if (enq.length) return "compare";
  if (rfqExists) return "floated";
  return "none";
}

/** Per-package headline status (drives the bill-status pill on the packages table). */
export function scPackageStatus(k: string): string {
  const sub = scSubbieOf(k);
  const code = scCodeOf(k);
  const pre = `${scProjSp(k)}.${sub}~RA`;
  const statuses = sub
    ? Object.keys(SC_BILLS)
        .filter((bk) => bk.startsWith(pre) && (SC_BILLS[bk]!.lines || []).some((l) => l.code === code))
        .map((bk) => SC_BILLS[bk]!.status)
    : [];
  if (statuses.length) {
    if (statuses.every((x) => x === "paid")) return "paid";
    if (statuses.some((x) => x === "discrepancy")) return "discrepancy";
    if (statuses.some((x) => x === "matched")) return "matched";
    return "forwarded_to_finance";
  }
  if (SC_MEASUREMENTS[k]) return "matched";
  const wo = SC_WORKORDERS[k];
  if (wo) return wo.status;
  const enq = SC_ENQUIRIES[k];
  if (enq) return enq.some((e) => e.selected) ? "l1" : "enquiry";
  return "none";
}

/* ─────────────────────────── Measurement / RA rollups ─────────────────────────── */

export function scExecToDate(lineKey: string): number {
  return (SC_EXEC_LOG[lineKey] ?? []).reduce((s, e) => s + (e.qty || 0), 0);
}
export function scCertToDate(lineKey: string): number {
  const ms = SC_MEASUREMENTS[lineKey] ?? [];
  return ms.length ? Math.max(...ms.map((m) => m.cumQty)) : 0;
}

/** Next weekly RA cycle number for a scope. */
export function scNextRaWeek(projsp: string): number {
  let mx = 0;
  for (const k of Object.keys(SC_MEASUREMENTS)) {
    if (scProjSp(k) === projsp) for (const m of SC_MEASUREMENTS[k]!) if (m.ra > mx) mx = m.ra;
  }
  return Math.max(mx + 1, 1);
}

/**
 * (subbie|week) → certified-but-not-yet-billed line items (awaiting the subbie claim).
 */
export function scAwaitingSubWeeks(projsp: string): Record<string, { code: string; certQty: number; woRate: number }[]> {
  const out: Record<string, { code: string; certQty: number; woRate: number }[]> = {};
  for (const k of Object.keys(SC_MEASUREMENTS)) {
    if (scProjSp(k) !== projsp) continue;
    const sub = scSubbieOf(k);
    if (!sub) continue;
    const code = scCodeOf(k);
    const wo = SC_WORKORDERS[k];
    for (const m of SC_MEASUREMENTS[k]!) {
      if (SC_BILLS[scRaBillKey(projsp, sub, m.ra)]) continue;
      const id = `${sub}|${m.ra}`;
      (out[id] ??= []).push({ code, certQty: m.qtyThis, woRate: wo?.rate ?? 0 });
    }
  }
  return out;
}

/* ─────────────────────────── Packages / trades ─────────────────────────── */

export function scPackagesFor(projId: string, spId: string): ScPackage[] {
  return SC_PACKAGES[`${projId}.${spId}`] ?? [];
}
export function scPkgFromKey(k: string): ScPackage | null {
  const parts = k.split(".");
  const pkgs = SC_PACKAGES[`${parts[0]}.${parts[1]}`] ?? [];
  return pkgs.find((x) => x.code === parts[2]) ?? null;
}
export function scCatLabel(catId: string): string {
  return SC_CAT_LABELS[catId] ?? catId ?? "Other";
}

/** Subbies qualified for a trade (catId), excluding blacklisted. */
export function scQualifiedSubbies(catId: string): ScSubbie[] {
  return Object.values(SC_SUBBIES).filter((s) => s.status !== "blacklisted" && (s.trades || []).includes(catId));
}

/* ─────────────────────────── Subbie scorecard ─────────────────────────── */

export function scSubbieOnTime(code: string): number | null {
  return code in SC_SUBBIE_ONTIME ? SC_SUBBIE_ONTIME[code]! : null;
}

export function scSubbieTier(s: ScSubbie): { bg: string; fg: string; label: string } {
  if (s.status === "blacklisted") return { bg: "#FCEBEB", fg: "#A32D2D", label: "✗ Blacklisted" };
  if (s.status === "onboarding") return { bg: "#FEF6E7", fg: "#854F0B", label: "⚠ New" };
  const r = s.rating || 0;
  if (r >= 4.5) return { bg: "#EAF3DE", fg: "#3B6D11", label: "★ Preferred" };
  if (r >= 4) return { bg: "#FBF9F6", fg: "#6B6A68", label: "Standard" };
  return { bg: "#FAEEDA", fg: "#854F0B", label: "⚠ Watch" };
}

/** Trade-scoped WO spend + count for a subbie (across all scopes). */
export function scSubbieTradeSpend(code: string, trade: string): { spend: number; n: number } {
  let spend = 0;
  let n = 0;
  for (const k of Object.keys(SC_WORKORDERS)) {
    const wo = SC_WORKORDERS[k]!;
    if (wo.subbie !== code) continue;
    const p = scPkgFromKey(k);
    if (p && p.catId === trade) {
      spend += wo.value || 0;
      n++;
    }
  }
  return { spend, n };
}

/** Total WO count for a subbie (any trade / scope). */
export function scSubbieWoCount(code: string): number {
  return Object.keys(SC_WORKORDERS).filter((k) => SC_WORKORDERS[k]!.subbie === code).length;
}
