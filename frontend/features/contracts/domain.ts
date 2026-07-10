/**
 * Pure derivation helpers for Contracts & Legal — faithful ports of the metric
 * strips, tab counts, and gating logic in the prototype's render functions.
 * No side effects; safe to unit-test.
 */
import type {
  ArbitrationCase,
  ContractStage,
  ContractTender,
  EmdRecord,
  FinInstrument,
  Obligation,
  ProjectDoc,
  Rfi,
  Submittal,
} from "@/features/contracts/types";

export const STAGE_LABEL: Record<ContractStage, string> = {
  screening: "Screening",
  bid_prep: "Bid Prep",
  submitted: "Submitted",
  awarded: "Awarded",
  lost: "Lost",
};

export function stageLabel(stage: ContractStage): string {
  return STAGE_LABEL[stage] ?? stage;
}

/** Number of submittals marked ready. */
export function submittalReadyCount(subs: Submittal[]): number {
  return subs.filter((s) => s.status === "ready").length;
}

/** Open RFIs for a given tender. */
export function openRfiCount(rfis: Rfi[], tenderId: string): number {
  return rfis.filter((r) => r.tenderId === tenderId && r.status === "open").length;
}

/** Documents already uploaded to the project folder. */
export function docsUploadedCount(docs: ProjectDoc[]): number {
  return docs.filter((d) => d.status === "uploaded").length;
}

/** Active financial instruments. */
export function activeInstrumentCount(fin: FinInstrument[]): number {
  return fin.filter((f) => f.status === "active").length;
}

/** Obligations currently flagged at risk. */
export function obligationsAtRisk(obl: Obligation[]): number {
  return obl.filter((o) => o.status === "at_risk").length;
}

/** Open disputes in the arbitration register. */
export function openDisputes(arb: ArbitrationCase[]): number {
  return arb.filter((a) => a.status === "open").length;
}

/** High-value contracts (> ₹50L) require the CEO sign-off node. */
export function isHighValue(contractValue: number): boolean {
  return (contractValue || 0) > 5_000_000;
}

/** Whether Finance has issued both the EMD instrument and the tender fee. */
export function financeDocsReceived(emd: EmdRecord | undefined): boolean {
  if (!emd) return false;
  return emd.emdStatus === "paid" && emd.feeStatus === "paid";
}

export interface BidGates {
  subsReady: boolean;
  subsCount: number;
  subsTotal: number;
  finOk: boolean;
  canSubmit: boolean;
}

/** Pre-submission gate evaluation for the Bid Submission tab. */
export function bidGates(subs: Submittal[], emd: EmdRecord | undefined, submitted: boolean): BidGates {
  const subsTotal = subs.length;
  const subsCount = submittalReadyCount(subs);
  const subsReady = subsTotal > 0 && subs.every((s) => s.status === "ready");
  const finOk = financeDocsReceived(emd);
  return { subsReady, subsCount, subsTotal, finOk, canSubmit: subsReady && finOk && !submitted };
}

/** Faithful port of `isCostingReceived` (own-data path): the explicit BD flag. */
export function isCostingReceived(dealId: string, leadCosting: Record<string, boolean>): boolean {
  return Boolean(leadCosting[dealId]);
}

export interface MetricCellData {
  l: string;
  v: string;
  c?: string;
  sub?: string;
}

/** Pre-sales metric strip cells for the selected tender. */
export function tenderMetrics(
  t: ContractTender,
  subs: Submittal[],
  rfis: Rfi[],
  emd: EmdRecord | undefined
): MetricCellData[] {
  const ready = submittalReadyCount(subs);
  const openRfi = openRfiCount(rfis, t.dealId);
  const emdAmt = emd?.emdAmt ?? 0;
  const emdStatus = emd?.emdStatus ?? "";
  return [
    { l: "Stage", v: stageLabel(t.stage), c: "#7B1FA2" },
    { l: "Est. Value", v: "₹" + Math.round(t.estValue / 100000).toLocaleString("en-IN") + "L" },
    { l: "Submittals", v: `${ready}/${subs.length}`, c: ready === subs.length ? "#3B6D11" : "#854F0B", sub: "ready" },
    { l: "Open RFIs", v: `${openRfi}`, c: openRfi ? "#A32D2D" : "#3B6D11" },
    {
      l: "EMD",
      v: "₹" + Math.round(emdAmt / 1000).toLocaleString("en-IN") + "K",
      c: emdStatus === "paid" || emdStatus === "requested" ? "#3B6D11" : "#854F0B",
      sub: emdStatus,
    },
    { l: "Due Date", v: t.dueDate, sub: "submission" },
  ];
}
