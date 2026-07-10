/**
 * Pure QA/QC helpers — faithful ports of the prototype's hold-point,
 * cabin-rollup, NCR-bucket, and inspection-label logic.
 */
import type {
  CabinRollup,
  CabinStatus,
  HpState,
  Inspection,
  Itp,
  Ncr,
  NcrBucket,
} from "@/features/qaqc/types";

const pad2 = (n: number): string => String(n).padStart(2, "0");

/* ─────────────────────────── Hold points ─────────────────────────── */

/** True when this inspection sits on a hold-point ITP gate (`inspIsHoldPoint`). */
export function inspIsHoldPoint(itps: Itp[], insp: Inspection | null | undefined): boolean {
  if (!insp) return false;
  if (insp.type === "FIR") return false; // a field audit never satisfies a planned ITP gate
  if (insp.itpRef) {
    const t = itps.find((x) => x.id === insp.itpRef);
    if (t) return !!t.holdPoint;
  }
  const grp = insp.type === "IMIR" ? ["incoming"] : ["wip", "final"];
  return itps.some((x) => x.bomCode === insp.bomCode && x.holdPoint && grp.includes(x.stage));
}

function isReleased(insp: Inspection): boolean {
  return !!(insp.hpRelease && (insp.hpRelease.status === "released" || insp.hpRelease.status === "released_conditional"));
}

/** Derived hold-point release state (`hpReleaseState`). */
export function hpReleaseState(insp: Inspection | null | undefined): HpState {
  if (!insp) return null;
  if (insp.status === "pending") return "awaiting_inspection";
  if (insp.status === "failed") return "held";
  if (isReleased(insp)) return insp.hpRelease!.status as HpState;
  if (insp.hpRelease && insp.hpRelease.status === "held") return "held";
  return "awaiting_release";
}

/** Human cabin label for an inspection (`inspCabinLabel`). */
export function inspCabinLabel(i: Inspection | null | undefined): string {
  if (!i || i.type === "IMIR") return "Site-wide";
  const c = i.cabins;
  if (!c || !c.length) return "Site-wide";
  if (c.length === 1) return "Cabin " + pad2(c[0]!);
  const srt = c.map(Number).sort((a, b) => a - b);
  const contig = srt.every((v, idx) => idx === 0 || v === srt[idx - 1]! + 1);
  return contig ? "Cabins " + pad2(srt[0]!) + "–" + pad2(srt[srt.length - 1]!) : c.length + " cabins";
}

/* ─────────────────────────── NCR ─────────────────────────── */

/** Does an open NCR hold the line's RA billing? (`ncrBlocks`). */
export function ncrBlocks(n: Ncr): boolean {
  return n.blocksBilling != null ? n.blocksBilling : n.severity === "major" || n.severity === "critical";
}

/** Workflow bucket for the NCR filter tabs (`_ncrBucket`). */
export function ncrBucket(n: Ncr): NcrBucket {
  if (n.status === "open") return "awaiting";
  if (["rca_pending", "rca_review", "action_planned", "action_taken"].includes(n.status)) return "rework";
  return "cleared";
}

/* ─────────────────────────── Cabin sign-off ─────────────────────────── */

const allPass = (checklistLen: number): Record<number, "pass"> => {
  const o: Record<number, "pass"> = {};
  for (let i = 0; i < checklistLen; i++) o[i] = "pass";
  return o;
};

/**
 * Seed per-cabin final-QC status (`qcSeedCabinQc`): 28 cleared, cabin 29 failed
 * with an NCR, cabin 30 in-progress, the rest pending.
 */
export function seedCabinQc(units: number, checklist: string[]): CabinStatus[] {
  const passN = 28;
  const out: CabinStatus[] = [];
  for (let i = 1; i <= units; i++) {
    if (i <= passN) {
      out.push({ cabin: i, status: "pass", by: "Karthik (QA Engg.)", date: "22 May 2026", checks: allPass(checklist.length) });
    } else if (i === 29) {
      const checks = allPass(checklist.length) as Record<number, "pass" | "fail">;
      checks[2] = "fail";
      out.push({
        cabin: i,
        status: "fail",
        by: "Karthik (QA Engg.)",
        date: "23 May 2026",
        checks,
        ncr: { note: "Cladding fastener spacing out of spec (>300mm) on north face", by: "Karthik (QA Engg.)", date: "23 May 2026" },
      });
    } else if (i === 30) {
      out.push({ cabin: i, status: "in_progress", checks: { 0: "pass", 1: "pass" } });
    } else {
      out.push({ cabin: i, status: "pending", checks: {} });
    }
  }
  return out;
}

/** An open, billing-blocking LINE NCR pinned to this cabin (`qcCabinOpenLineNcr`). */
export function cabinOpenLineNcr(ncrs: Ncr[], cabinN: number): boolean {
  return ncrs.some(
    (nc) =>
      nc.status !== "closed" &&
      !!nc.forCode &&
      (nc.disposition === "reject" || ncrBlocks(nc)) &&
      Number(nc.cabin) === cabinN
  );
}

/** Effective (derive-on-read) cabin status — a cleared cabin with an open NCR reads as `hold` (`qcCabinEffStatus`). */
export function cabinEffStatus(cabin: CabinStatus, ncrs: Ncr[]): CabinStatus["status"] {
  return cabin.status === "pass" && cabinOpenLineNcr(ncrs, cabin.cabin) ? "hold" : cabin.status;
}

/** Roll up raw cabin statuses (`qcCabinRollup`). */
export function cabinRollup(cabins: CabinStatus[]): CabinRollup {
  let cleared = 0,
    ncr = 0,
    inprog = 0,
    pending = 0;
  for (const c of cabins) {
    if (c.status === "pass") cleared++;
    else if (c.status === "fail") ncr++;
    else if (c.status === "in_progress") inprog++;
    else pending++;
  }
  return { cleared, ncr, inprog, pending };
}
