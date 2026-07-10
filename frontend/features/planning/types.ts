/**
 * Planning & Control — WBS / Gantt module types.
 *
 * Faithful port of the MOD OS prototype's Planning surface (renderPlanning,
 * renderWBS, renderPlanningWBS, renderPlanningApproval, renderPlanningKickoff).
 * The prototype seeds `WBS_ITEMS`/`WBS_BLOCKS` at runtime from the approved
 * estimation BOQ (`getPlanningSourceItems`) + a per-cabin activity template
 * (`tplBlocks`). Those derivations are reproduced as pure functions in
 * `domain.ts`; the raw seed lives in `data/`.
 */

/** The five WBS execution lanes (departments). */
export type Dept = "engg" | "proc" | "subcontracts" | "ops" | "qa";

/** Kickoff execution-mode decision per line item (set in the Kickoff matrix). */
export type ScType = "manpower" | "lineitem" | "self" | "machinery";
export type MatNature = "engineered" | "boughtout" | "freeissue" | null;

export interface KickoffDecision {
  scType: ScType;
  matNature: MatNature;
}

/** Billing mode — BOQ (weekly RA) vs EPC (milestone RA). `null` inherits default. */
export type BillingMode = "boq" | "epc";

/** A source line item from the approved estimation BOQ (per-unit qty). */
export interface SourceItem {
  code: string;
  name: string;
  /** Category label (e.g. "Superstructure"). */
  cat: string;
  /** Category id (e.g. "SS"). */
  catId: string;
  uom: string;
  /** Per-unit quantity from estimation. */
  qtyPerUnit: number;
  /** Unit prime cost (material + machinery + manpower) — used for value weighting. */
  unitValue: number;
}

/** A Gantt bar — one activity block of an item on a single dept lane. */
export interface WbsBlock {
  id: string;
  /** 1-based day the bar starts on. */
  day: number;
  duration: number;
  qty: number;
  dept: Dept;
  label: string;
}

/** Per-department scheduling progress for one line item. */
export interface DeptProgress {
  dept: Dept;
  scheduled: number;
  total: number;
  pct: number;
  done: boolean;
}

/** A fully-derived WBS line item (the `WBS_ITEMS[projId]` shape + view extras). */
export interface WbsItem {
  code: string;
  name: string;
  cat: string;
  catId: string;
  uom: string;
  totalQty: number;
  unitValue: number;
  decision: KickoffDecision;
  /** Departments this item routes through (from its decision). */
  route: Dept[];
  billing: BillingMode;
  blocks: WbsBlock[];
  deptProgress: DeptProgress[];
  /** Value-weighted / average scheduling completeness across required depts. */
  overallPct: number;
  fullyScheduled: boolean;
  remaining: number;
}

/** A single segment inside an activity-rollup row (a dept envelope). */
export interface RowSegment {
  dept: Dept;
  start: number;
  dur: number;
}

/** Activity / item rollup row (port of `buildActivityWBSRows`). */
export interface ActivityRow {
  id: string;
  level: 1 | 2;
  parentId?: string;
  name: string;
  code?: string;
  start: number;
  dur: number;
  status: "not_started" | "in_progress" | "completed";
  progress: number;
  segments: RowSegment[];
}

/** A single row in the Dept-View gantt (one item × one dept lane). */
export interface DeptGanttRow {
  key: string;
  catId: string;
  cat: string;
  code: string;
  itemName: string;
  dept: Dept;
  /** First dept row for the item — carries the item name + exec badge. */
  isFirst: boolean;
  billing: BillingMode;
  decision: KickoffDecision;
  deptFull: boolean;
  blocks: WbsBlock[];
}

/** Category header (dark bar) row in the gantt. */
export interface GanttCatGroup {
  catId: string;
  cat: string;
  deptRows: DeptGanttRow[];
  activityRows: ActivityRowLite[];
}

/** Lightweight activity-view row: one dept envelope per category. */
export interface ActivityRowLite {
  dept: Dept;
  label: string;
  start: number;
  end: number;
  pct: number;
}

export interface WbsStats {
  totalActivities: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  schedulePct: number;
  scheduleStatus: string;
  plannedEndDate: string;
  projectedEndDate: string;
}

export interface WbsView {
  items: WbsItem[];
  groups: GanttCatGroup[];
  activityRows: ActivityRow[];
  stats: WbsStats;
  totalDays: number;
  startDate: string;
  todayDay: number;
}

/* ─── Kickoff decision matrix ─── */

export interface KickoffMatrixItem {
  code: string;
  name: string;
  uom: string;
  qtyPerUnit: number;
  decision: KickoffDecision;
  execLabel: string;
  route: Dept[];
}

export interface KickoffMatrixCat {
  catId: string;
  cat: string;
  items: KickoffMatrixItem[];
}

export interface KickoffMatrixView {
  signedOff: boolean;
  signedBy: string | null;
  signedOn: string | null;
  cats: KickoffMatrixCat[];
  total: number;
  decided: number;
  pct: number;
  counts: { manpower: number; lineitem: number; machinery: number; engineered: number; boughtout: number };
}

/* ─── Approval chain (Maker → COO → CEO → Client) ─── */

export type ApprovalStatus =
  | "draft"
  | "pending_coo"
  | "pending_ceo"
  | "internal_approved"
  | "sent_to_client";

export interface ApprovalStage {
  status: "pending" | "approved" | "rejected";
  by: string | null;
  on: string | null;
  note: string | null;
}

export interface ApprovalHistoryEntry {
  stage: string;
  status: string;
  by: string;
  at: string;
  note: string;
}

export interface ApprovalNode {
  role: string;
  person: string;
  state: "done" | "active" | "pending" | "rejected";
  status: string;
}

export interface ApprovalView {
  status: ApprovalStatus;
  coo: ApprovalStage;
  ceo: ApprovalStage;
  history: ApprovalHistoryEntry[];
  nodes: ApprovalNode[];
  locked: boolean;
  fullyScheduled: boolean;
  planner: string;
  cooName: string;
  ceoName: string;
  client: string;
  subProjectName: string;
}

/* ─── Signoff / kickoff tab ─── */

export interface ChecklistItem {
  ok: boolean;
  label: string;
  ref: string;
}

export interface DeptNotification {
  key: string;
  label: string;
  role: string;
  notified: boolean;
}

export interface KickoffMeeting {
  scheduled: string;
  venue: string;
  attendees: string[];
  notified: boolean;
  notifiedAt: string | null;
  notifiedDepts: string[];
}

export interface SignoffView {
  planApproved: boolean;
  kickedOff: boolean;
  checklist: ChecklistItem[];
  deptNotifications: DeptNotification[];
  meeting: KickoffMeeting | null;
}

/* ─── Planning state (per project) ─── */

export interface PlanHistoryEntry {
  status: string;
  by: string;
  at: string;
  note: string;
}

export interface PlanState {
  status: "draft" | "submitted" | "approved" | "rejected";
  autoPopulated: boolean;
  autoPopulatedAt?: string;
  history: PlanHistoryEntry[];
}

export interface ProjectMeta {
  id: string;
  code: string;
  name: string;
  client: string;
  value: string;
  stage: string;
  startDate: string | null;
  duration: number;
  awarded: boolean;
}

export interface SubProjectMeta {
  id: string;
  name: string;
  units: number;
  spec: string;
}

/** Top KPI card (metric-strip cell). */
export interface PlanningKpi {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}

/** Plan status pill descriptor. */
export interface PlanStatusPill {
  cls: "pg" | "pa" | "pr" | "pb" | "pgr" | "pac";
  label: string;
}
