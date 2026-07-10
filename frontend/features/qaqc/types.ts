/**
 * QA / QC domain models — faithful to the prototype's `QC_ITP`,
 * `QC_INSPECTIONS`, `QC_NCR`, `QC_TPT`, and `QC_CABIN_CHECKLIST` stores.
 */

/** Scope key, e.g. "P1.SP1". */
export type QcKey = string;

/* ─────────────────────────── Projects / scope ─────────────────────────── */

export interface SubProject {
  id: string;
  name: string;
  units: number;
  spec: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  qaEngineer: string;
  subProjects: SubProject[];
}

/* ─────────────────────────── ITP (rulebook) ─────────────────────────── */

export type ItpStage = "incoming" | "wip" | "final";

export interface ItpCheck {
  check: string;
  criteria: string;
  method: string;
}

export interface Itp {
  id: string;
  bomCode: string;
  name: string;
  stage: ItpStage;
  holdPoint: boolean;
  witnessPoint: boolean;
  checks: ItpCheck[];
}

/* ─────────────────────────── Inspections ─────────────────────────── */

export type InspectionType = "IMIR" | "WIR" | "FIR";
export type InspectionStatus = "pending" | "passed" | "partial_pass" | "failed";
export type CheckResult = "pass" | "fail" | "partial" | "pending" | "na" | null;

export interface InspectionCheckResult {
  check: string;
  result: CheckResult;
  note?: string;
}

export interface HpRelease {
  status: "released" | "released_conditional" | "held";
  by?: string;
  at?: string;
  conditions?: string | null;
  decision?: string;
}

export interface Inspection {
  id: string;
  type: InspectionType;
  date: string;
  poRef: string | null;
  bomCode: string;
  itpRef: string | null;
  cabins?: number[];
  orderedQty: number | null;
  receivedQty: number | null;
  uom: string;
  status: InspectionStatus;
  inspector: string | null;
  checkResults: InspectionCheckResult[];
  ncrTriggered: boolean;
  ncrId?: string;
  note: string;
  grnRef?: string;
  hpRelease?: HpRelease;
}

/** Derived hold-point release state. */
export type HpState =
  | "awaiting_inspection"
  | "held"
  | "released"
  | "released_conditional"
  | "awaiting_release"
  | null;

/** Inspection enriched with derived display data (the API view model). */
export interface InspectionView extends Inspection {
  isHoldPoint: boolean;
  hpState: HpState;
  cabinLabel: string;
  itpName: string | null;
}

/* ─────────────────────────── NCR / CAR ─────────────────────────── */

export type NcrSeverity = "minor" | "major" | "critical";
export type NcrStatus =
  | "open"
  | "rca_pending"
  | "rca_review"
  | "action_planned"
  | "action_taken"
  | "verified"
  | "closed";
export type NcrDisposition = "rework" | "repair" | "use_as_is" | "reject";
export type NcrBucket = "awaiting" | "rework" | "cleared";

export interface Ncr {
  id: string;
  raisedAt: string;
  raisedBy: string;
  forCode: string;
  linkedInspection?: string;
  source?: string;
  cabin?: number;
  defect: string;
  inspNote?: string;
  severity: NcrSeverity;
  status: NcrStatus;
  blocksBilling?: boolean;
  disposition?: NcrDisposition;
  qty?: number;
  uom?: string;
  responsibleParty?: string;
  targetDate?: string;
  rootCause?: string | null;
  correction?: string | null;
  correctiveAction?: string | null;
  verifyNote?: string | null;
  actionPlan?: string;
  actionPlanBy?: string;
  actionPlanAt?: string;
  opsNotifiedAt?: string;
  opsNotifiedTo?: string;
  actionTaken?: string;
  actionTakenBy?: string;
  actionTakenAt?: string;
  reworkRounds?: number;
  verifyFailReason?: string;
  closedAt?: string | null;
  closedBy?: string | null;
  verifiedAt?: string | null;
  opsIndent?: string;
  attachments?: string[];
}

/** NCR enriched with derived bucket + billing-block flag. */
export interface NcrView extends Ncr {
  bucket: NcrBucket;
  blocks: boolean;
}

/* ─────────────────────────── Third-Party Testing ─────────────────────────── */

export type TptStatus =
  | "scheduled"
  | "sample_collected"
  | "at_lab"
  | "report_received"
  | "passed"
  | "rejected";

export interface Tpt {
  id: string;
  testType: string;
  bomCode: string;
  lab: string;
  sampleSize?: string;
  standard?: string;
  acceptance?: string;
  requestedBy?: string;
  scheduledFor: string | null;
  sampleCollected?: string | null;
  sentToLab?: string | null;
  status: TptStatus;
  result: string | null;
  reportFile?: string | null;
  reportDate?: string;
  linkedGRN?: string;
  batch?: string;
  resultNote?: string;
  attestedBy?: string | null;
  note?: string;
  linkedNCR?: string;
  linkedNCROut?: string;
  linkedResupply?: string;
}

/* ─────────────────────────── Cabin sign-off ─────────────────────────── */

export type CabinQcStatus = "pass" | "hold" | "fail" | "in_progress" | "pending";

export interface CabinStatus {
  cabin: number;
  status: CabinQcStatus;
  checks: Record<number, "pass" | "fail" | undefined>;
  by?: string;
  date?: string;
  ncr?: { note: string; by: string; date: string };
}

export interface CabinRollup {
  cleared: number;
  ncr: number;
  inprog: number;
  pending: number;
}

/** Cabin status enriched with derive-on-read effective status. */
export interface CabinStatusView extends CabinStatus {
  eff: CabinQcStatus;
}

/* ─────────────────────────── KPIs / payload ─────────────────────────── */

export interface QaqcKpis {
  inspections: number;
  passed: number;
  partial: number;
  failed: number;
  pending: number;
  openNCR: number;
  majorCritical: number;
  inspQueue: number;
  tptTotal: number;
  tptPassed: number;
  tptPending: number;
  tptFailed: number;
  itpsInScope: number;
  holdPoints: number;
  hpAwaiting: number;
}
