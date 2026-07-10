/**
 * Engineering domain models — faithful ports of the prototype's ENG_* data
 * stores (drawings tracker, BOM versioning, deliverable versions, docs,
 * maker/checker/approver workflow, and the BOQ/drawing approval queues).
 */
import type { EngBomLine, EngStatus } from "@/types/procurement";

/** Alias for the BOQ-line status enum (re-exported for component pill maps). */
export type EngStatusLike = EngStatus;

export type Discipline = "structure" | "architecture" | "mep";
export type DisciplineFilter = "all" | Discipline;
export type StageKey = "preliminary" | "gfc" | "detailed" | "vetting";

/** Legacy per-stage status enum used by ENG_DRAWINGS_STATE cells. */
export type StageStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "not_submitted"
  | "submitted"
  | "vetted"
  | "rejected";

/** New per-drawing state machine. */
export type DrwStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "in_approval"
  | "rework"
  | "site_query"
  | "approved";

/* ─────────────────────────── Drawings tracker ─────────────────────────── */

export interface StageCell {
  status: StageStatus;
  count?: number;
  by?: string | null;
  at?: string | null;
  approver?: string;
  approvedAt?: string;
  note?: string;
  // vetting-only fields
  vetter?: string | null;
  submittedAt?: string | null;
  vettedAt?: string | null;
  remarks?: string | null;
}

export type DisciplineTrack = Partial<Record<StageKey, StageCell>>;
export type DrawingsStateTrack = Partial<Record<Discipline, DisciplineTrack>>;
export type EngDrawingsState = Record<string, DrawingsStateTrack>;

/* ─────────────────────────── Team ─────────────────────────── */

export interface TeamMaker {
  name: string;
  initials: string;
}
export interface TeamDiscipline {
  key: Discipline;
  label: string;
  icon: string;
  color: string;
  makers: TeamMaker[];
}
export interface EngTeam {
  head: { name: string; role: string; initials: string; color: string };
  disciplines: TeamDiscipline[];
}

/* ─────────────────────────── BOM version history (legacy) ─────────────── */

export interface BomHistoryEntry {
  ver: string;
  date: string;
  by: string;
  changes: string;
  released: boolean;
  releasedAt?: string;
}
export type EngBomHistory = Record<string, BomHistoryEntry[]>;

/* ─────────────────────────── RFI / RFC ─────────────────────────── */

export interface BomRfi {
  id: string;
  subject: string;
  raisedBy: string;
  age: string;
  status: string;
}
export interface BomRfc {
  id: string;
  subject: string;
  raisedBy: string;
  age: string;
  status: string;
  raisedFrom?: string;
  raisedOn?: string;
  forCode?: string;
  compCode?: string;
  fromSpec?: string;
  toSpec?: string;
  toName?: string;
  reason?: string;
  slId?: string | null;
  slKey?: string;
}
export type BomRfiMap = Record<string, BomRfi[]>;
export type BomRfcMap = Record<string, BomRfc[]>;

/* ─────────────────────────── Deliverable versions ─────────────────────── */

export interface EngVersionStats {
  drawings: number;
  bomItems: number;
  openRFI: number;
  openRFC: number;
}
export interface EngVersion {
  ver: string;
  label: string;
  active: boolean;
  released: boolean;
  date: string;
  by: string;
  releasedAt?: string;
  note: string;
  stats: EngVersionStats;
}
export type EngVersions = Record<string, EngVersion[]>;

/* ─────────────────────────── Docs ─────────────────────────── */

export interface EngDoc {
  name: string;
  type: string;
  uploaded: string;
  by: string;
  size: string;
  status: string;
}
export type EngDocsMap = Record<string, EngDoc[]>;

/* ─────────────────────────── Workflow ─────────────────────────── */

export interface WorkflowDiscipline {
  id: Discipline;
  name: string;
  assignee: string | null;
  sections: string[];
  status: "pending" | "in_progress" | "submitted";
  submittedOn?: string;
}
export interface EngWorkflow {
  disciplines: WorkflowDiscipline[];
  checker: string;
  checkerStatus: "pending" | "in_review" | "approved";
  approver: string;
  approverStatus: "pending" | "approved";
  vettingRequired: boolean;
  vettingStatus: "pending" | "submitted" | "vetted";
  procurementReleased: boolean;
}
export type EngWorkflowMap = Record<string, EngWorkflow>;

/* ─────────────────────────── Drawing list + pins ───────────────────────── */

export interface DrawingComment {
  id: string;
  by: string;
  role: string;
  text: string;
  x: number;
  y: number;
  date: string;
  resolved: boolean;
  rfi: string | null;
}
export interface DrwVersionEntry {
  v: string;
  submittedAt?: string;
  submittedBy?: string;
  sentForApprovalAt?: string;
  sentForApprovalBy?: string;
  batchId?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decision?: "approved" | "rejected";
  comments?: string;
  pinCount?: number;
}
export interface EngDrawing {
  id: string;
  name: string;
  disc: Discipline;
  stage: StageKey;
  status: StageStatus | DrwStatus;
  by: string;
  date: string;
  rev: string;
  size: string;
  apprBy?: string;
  comments: DrawingComment[];
  // per-drawing state machine (may be pre-seeded; else derived in domain)
  drwStatus?: DrwStatus;
  drwVersion?: string | null;
  drwVersionHistory?: DrwVersionEntry[];
}
export type EngDrawingList = Record<string, EngDrawing[]>;

/** Drawing with the per-drawing state machine fields guaranteed. */
export interface EngDrawingView extends EngDrawing {
  drwStatus: DrwStatus;
  drwVersion: string | null;
  drwVersionHistory: DrwVersionEntry[];
}

/* ─────────────────────────── Approval queues ─────────────────────────── */

export interface ApprovalQueueItem {
  projId: string;
  spId: string;
  boqCode?: string;
  drawingId?: string;
  kind: "boq" | "drawing";
  sentAt: string;
  sentBy: string;
  batchId: string;
  version?: string;
  stage?: StageKey;
  disc?: Discipline;
}
export type ApprovalQueues = Record<string, ApprovalQueueItem[]>;

/* ─────────────────────────── BOQ versioning ─────────────────────────── */

export interface BoqVersionEntry {
  v: string;
  submittedAt?: string;
  submittedBy?: string;
  sentForApprovalAt?: string;
  sentForApprovalBy?: string;
  batchId?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decision?: "approved" | "rejected";
  comments?: string;
}

/** ENG_BOM line enriched with the new version state-machine + derived variance. */
export interface EngBomLineView extends EngBomLine {
  engVersion: string | null;
  engVersionHistory: BoqVersionEntry[];
  variancePct: number | null;
  delta: number | null;
  openRfi: number;
  openRfc: number;
}

export interface BomCategoryGroup {
  cat: string;
  items: EngBomLineView[];
  approvedCount: number;
  bomCount: number;
  sumBoq: number;
  sumEng: number;
  delta: number;
  pct: number;
  uom: string | null;
}

/* ─────────────────────────── Tender pack ─────────────────────────── */

export interface TenderItem {
  label: string;
  value: string;
  size?: string;
  kind?: string;
  uploadedBy?: string;
  uploadedOn?: string;
  linkTo?: string;
}
export interface TenderSection {
  id: string;
  label: string;
  icon: string;
  items: TenderItem[];
}
export interface ChangeOrder {
  id: string;
  date: string;
  requestedBy: string;
  title: string;
  impact: string;
  status: string;
  acceptedOn?: string;
  acceptedBy?: string;
  sectionsAffected?: string[];
}
export interface TenderPack {
  projId: string;
  frozenAt: string;
  frozenBy: string;
  sourceLeadId: string;
  sections: TenderSection[];
  changeOrders: ChangeOrder[];
}
export type TenderPacks = Record<string, TenderPack>;

/* ─────────────────────────── Stage summary + KPIs ─────────────────────── */

export interface StageSummary {
  disc: Discipline;
  stage: StageKey;
  total: number;
  byStatus: Record<DrwStatus, number>;
  approved: number;
  pctApproved: number;
  derivedStatus: "empty" | "in_progress" | "approved";
  drawings: EngDrawingView[];
}

export interface EngKpis {
  drawings: number;
  stagesDone: number;
  stagesTotal: number;
  bomApproved: number;
  bomTotal: number;
  reworkedItems: number;
  maxVar: number;
  totalRfi: number;
  totalRfc: number;
  vettingLabel: string;
  vettingTone: "cg" | "ca" | "cr" | "";
}

export interface ApprovalQueueCounts {
  boq: number;
  drawing: number;
}
