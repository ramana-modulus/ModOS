/** Business Development domain models — faithful to `LEADS` / `BD_STAGES`. */

export type LeadKind = "B2B" | "B2G";
export type LeadHeat = "Hot" | "Warm" | "Cold" | "Tender";
export type StageId =
  | "enquiry"
  | "costing"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost"
  | "not_participated";

export interface LeadBase {
  id: string;
  ref: string;
  type: LeadKind;
  lt: LeadHeat;
  client: string;
  co: string;
  owner: string;
  tech: string[];
  desc: string;
  area: number;
  ev: number | null;
  ch: number;
  src: string;
  status: StageId;
  date: string;
  dl: string | null;
  docs: string[];
  tr?: string;
  costingSubmitted?: boolean;
}

export interface StageTransition {
  stage: string;
  enteredAt: string;
}

export interface Lead extends LeadBase {
  stageHistory: StageTransition[];
}

/** Lead enriched with derived age + costing status (the API view model). */
export interface LeadView extends Lead {
  daysInStage: number;
  daysSinceCreated: number;
  costingReceived: boolean;
}

export interface BdStage {
  id: StageId;
  label: string;
  prob: number;
  color: string;
  tc: string;
}

export interface StageThreshold {
  warn: number;
  stale: number;
}

export interface BizDevStats {
  pipelineValue: number;
  pipelineCount: number;
  won: number;
  wonCount: number;
  costingNeeded: number;
  activeDeals: number;
}
