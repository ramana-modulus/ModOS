/**
 * Projects (landing dashboard) domain models — faithful port of the prototype's
 * `PROJ_EXT` / `ACTIVITY_LOG` / `PLANNING_STATE` / `PROJ_CASHFLOW` stores and the
 * `renderProjOverview` ERP dashboard. The base project list is reused from
 * `@/features/procurement/data/projects` (`PROJECTS` === the prototype's `PROJ_LIST`).
 */

/* ─────────────────────────── Extended project metadata ─────────────────────────── */

export type HealthVal = "green" | "amber" | "red" | "gray";

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface ClientSpoc extends TeamMember {
  org: string;
}

export interface ProjectTeam {
  pm: TeamMember;
  planning: TeamMember;
  engg: TeamMember;
  proc: TeamMember;
  ops: TeamMember;
  qa: TeamMember;
  billing: TeamMember;
  finance: TeamMember;
  clientSpoc: ClientSpoc;
}

export interface ProjectDates {
  loi: string;
  contract: string;
  siteHandover: string;
  plannedStart: string;
  actualStart: string;
  plannedEnd: string;
  forecastEnd: string;
  dlpEnd: string;
}

export interface ProjectContract {
  type: string;
  billingMode?: string;
  paymentTerms: string;
  retention: number;
  ldClause: string;
  dlpMonths: number;
}

export interface ProjectProgress {
  plannedPct: number;
  actualPct: number;
}

export interface ProjectCost {
  contractCr: number;
  changeOrderCr: number;
  revisedCr: number;
  incurredCr: number;
  committedCr: number;
  toCompleteCr: number;
  forecastFinalCr: number;
  plannedMarginPct: number;
  forecastMarginPct: number;
}

export interface PulseRow {
  dept: string;
  icon: string;
  val: number;
  sub: string;
  kind: string;
  goTo: string;
  warn?: boolean;
}

export interface ProjectRisks {
  rfis: number;
  rfcs: number;
  ncrs: number;
  changeOrders: number;
  criticalProc: number;
  pendingApprovals: number;
}

export interface ProjectLocation {
  addr: string;
  distFromFactory: string;
}

export interface HealthOverride {
  val: HealthVal;
  label: string;
  note?: string;
  by?: string;
  on?: string;
}

export interface ProjectExt {
  location: ProjectLocation;
  team: ProjectTeam;
  dates: ProjectDates;
  contract: ProjectContract;
  progress: ProjectProgress;
  spi: number;
  cpi: number;
  cost: ProjectCost;
  pulse: PulseRow[];
  risks: ProjectRisks;
  healthOverride: HealthOverride | null;
}

/** Sparse map: P1 fully populated, P2–P5 are empty stubs (fallback overview). */
export type ProjectExtEntry = ProjectExt | Record<string, never>;

/* ─────────────────────────── Activity feed ─────────────────────────── */

export type ActivitySeverity = "good" | "warn";

export interface ActivityEntry {
  id: string;
  projId: string;
  dept: string;
  deptKey: string;
  icon: string;
  by: string;
  action: string;
  ref: string;
  when: string;
  /** Minutes-ago sort key (smaller = more recent). Replaces the prototype's runtime `ts`. */
  ageMinutes: number;
  severity?: ActivitySeverity;
}

/* ─────────────────────────── Planning state ─────────────────────────── */

export type PlanningStatus = "draft" | "submitted" | "approved" | "rejected";

export interface PlanningHistory {
  status: PlanningStatus;
  by: string;
  at: string;
  note: string;
}

export interface PlanningState {
  status: PlanningStatus;
  autoPopulated: boolean;
  autoPopulatedAt?: string;
  history: PlanningHistory[];
  kickoff: null;
}

/* ─────────────────────────── Cashflow ─────────────────────────── */

export interface CashflowOutflow {
  proc: number;
  labour: number;
  oh: number;
}

export interface CashflowMonth {
  m: string;
  inflow: number;
  outflow: CashflowOutflow;
}

export interface ProjectCashflow {
  monthly: CashflowMonth[];
  asOf: string;
  todayMonth: string;
}

/* ─────────────────────────── Derived view models ─────────────────────────── */

export interface Health {
  val: HealthVal;
  label: string;
  auto: boolean;
  reasons: string[];
}

export interface OverviewMetrics {
  plannedPct: number;
  actualPct: number;
  pgDelta: number;
  costIncurredCr: number;
  costRevisedCr: number;
  costPct: number;
  costHealth: "green" | "amber";
  forecastFinalCr: number;
  forecastMarginPct: number;
  spi: number;
  cpi: number;
  scheduleVar: number;
  totalRisks: number;
}

export interface CashflowMonthRollup extends CashflowMonth {
  outTotal: number;
  net: number;
  balance: number;
}

export interface CashflowView {
  months: CashflowMonthRollup[];
  totalIn: number;
  totalOut: number;
  totalProc: number;
  totalLabour: number;
  totalOh: number;
  netCash: number;
  maxVal: number;
  asOf: string;
  todayMonth: string;
}

export interface ProjectOverview {
  ext: ProjectExt;
  health: Health;
  metrics: OverviewMetrics;
  activity: ActivityEntry[];
  cashflow: CashflowView | null;
}

export interface PlanningStatusView {
  status: PlanningStatus;
}

export interface PortfolioKpis {
  total: number;
  inExecution: number;
  portfolioValue: string;
  plansApproved: number;
  awardedCount: number;
}
