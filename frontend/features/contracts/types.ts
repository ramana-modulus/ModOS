/**
 * Contracts & Legal domain models — faithful to the `CONTRACT_*` / `RFIS`
 * seed stores in the prototype. The module has two top modes:
 *   • Pre-Sales  — B2G tender pipeline (keyed to BD B2G deal ids, e.g. `L9`)
 *   • Post-Sales — per-awarded-project contract obligations (keyed to `P1`)
 */

/* ── Pre-Sales ─────────────────────────────────────────────────────────── */

export type ContractStage = "screening" | "bid_prep" | "submitted" | "awarded" | "lost";

/** A pre-sales tender — extends a BD B2G deal with contracts-side fields. */
export interface ContractTender {
  dealId: string;
  portal: string;
  portalRef: string;
  client: string;
  title: string;
  issued: string;
  preBid: string;
  dueDate: string;
  emdAmt: number;
  tenderFee: number;
  estValue: number;
  financialOk: boolean;
  technicalOk: boolean;
  stage: ContractStage;
  owner: string;
}

export type SubmittalStatus = "ready" | "pending" | "na";

/** A row in a tender's submittal checklist. */
export interface Submittal {
  doc: string;
  cat: string;
  status: SubmittalStatus;
  by: string;
}

export type RfiStatus = "open" | "answered" | "closed";

/** Shared RFI — Estimation raises, Contracts answers & circulates back. */
export interface Rfi {
  id: string;
  tenderId: string;
  raisedBy: string;
  raisedOn: string;
  question: string;
  answer: string;
  answeredBy: string;
  answeredOn: string;
  status: RfiStatus;
}

export type BidStatus = "awaiting_estimation" | "ready_to_submit" | "submitted";

/** Bid submission record (post estimation + BD margin). */
export interface ContractBid {
  quotedAmount: number;
  margin: number;
  submittedOn: string;
  submittedBy: string;
  portalFormat: string;
  ack: string;
  status: BidStatus;
  portal?: string;
}

export type EmdStatus = "paid" | "requested" | "refunded" | "pending";

/** EMD / tender-fee coordination with Finance. */
export interface EmdRecord {
  emdAmt: number;
  emdMode: string;
  emdStatus: EmdStatus;
  tenderFee: number;
  feeStatus: EmdStatus;
  financeRef: string;
}

/** Past-tender intelligence (bidders, L1/L2/L3). */
export interface SimilarWork {
  ref: string;
  title: string;
  issued: string;
  bidders: number;
  l1: string;
  l1Rate: number;
  l2Rate: number;
  l3Rate: number;
  outcome: string;
  forTender: string;
}

/* ── Post-Sales ────────────────────────────────────────────────────────── */

/** Minimal awarded-project descriptor for the project picker. */
export interface AwardedProject {
  id: string;
  name: string;
}

export type DocStatus = "uploaded" | "pending" | "na";

/** A project-folder document. */
export interface ProjectDoc {
  doc: string;
  cat: string;
  status: DocStatus;
  on: string;
  by: string;
}

/** Captured contractual / legal terms for an awarded project. */
export interface LegalTerms {
  dlpMonths: number;
  dlpStart: string;
  ldPct: number;
  ldCap: number;
  ldBasis: string;
  manpowerClause: string;
  warranty: string;
  opsFeasibility: string;
  opsNote: string;
  reviewedBy: string;
}

export type FinInstrumentStatus = "active" | "refund_pending" | "closed";

/** A Finance-fed financial instrument (BG / EMD / Solvency / Bank cert). */
export interface FinInstrument {
  type: string;
  amount: number;
  ref: string;
  issued: string;
  expiry: string;
  status: FinInstrumentStatus;
}

export type ObligationStatus = "on_track" | "at_risk" | "breached" | "met";

/** A milestone / penalty-linked contractual obligation. */
export interface Obligation {
  obligation: string;
  type: string;
  due: string;
  linkedTo: string;
  status: ObligationStatus;
  penalty?: string;
}

export type WorkflowStatus = "done" | "active" | "pending" | "rejected";

/** A single sign-off node in the contract approval workflow. */
export interface WorkflowNode {
  person: string;
  status: WorkflowStatus;
  on: string;
  threshold?: string;
}

/** Per-project contract sign-off workflow (maker → checker → approver [+ CEO]). */
export interface ContractWorkflow {
  maker: WorkflowNode;
  checker: WorkflowNode;
  approver: WorkflowNode;
  ceo: WorkflowNode;
  contractValue: number;
}

export type ArbitrationStage = "notice" | "conciliation" | "arbitration" | "settled";
export type ArbitrationStatus = "open" | "closed";

/** An arbitration / mitigation register entry. */
export interface ArbitrationCase {
  id: string;
  raisedOn: string;
  raisedBy: string;
  against: string;
  reason: string;
  claimAmt: number;
  stage: ArbitrationStage;
  settlementAmt: number;
  status: ArbitrationStatus;
  note: string;
}
