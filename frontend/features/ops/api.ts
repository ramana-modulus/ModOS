import { apiGet } from "@/lib/http";
import type {
  CabinRollup,
  CatRollup,
  ScopeTick,
  StoreMaterial,
} from "@/features/ops/domain";
import type {
  Dlr,
  Dpr,
  GrnReceipt,
  Handover,
  Indent,
  IndentCat,
  IndentType,
  OpsProject,
  OpsSubProject,
  QcRequest,
  ScopeItem,
  SiteLogEntry,
  StoreIssue,
  VendorBill,
} from "@/features/ops/types";

export interface OpsKpis {
  progressPct: number;
  plan: number;
  done: number;
  linesActive: number;
  totalLines: number;
  hindOpen: number;
  indentsPending: number;
  indentsBreached: number;
  qcOpen: number;
}

/** A scope line enriched with its derived execution figures for the client. */
export interface ScopeLineView extends ScopeItem {
  cumQty: number;
  done: number;
  pct: number;
  ticks: ScopeTick[];
  checkpointCount: number;
  cabin: CabinRollup | null;
  variance: { bom: number; exec: number; varAbs: number; varPct: number };
  execMode: { label: string; sub: string; bg: string; fg: string } | null;
}

/** A GRN receipt flattened with its material code for register views. */
export interface GrnFlatRow extends GrnReceipt {
  code: string;
  materialName: string;
}

export interface OpsPayload {
  scope: string;
  today: string;
  projects: OpsProject[];
  project: OpsProject;
  subProjects: OpsSubProject[];
  subProject: OpsSubProject | null;
  units: number;
  kpis: OpsKpis;
  badges: { indents: number; sitelog: number; qcreq: number };

  scopeLines: ScopeLineView[];
  scopeCats: CatRollup[];
  scopeHeaderPct: number;

  reports: Dpr[];
  dlr: Dlr[];
  siteLog: SiteLogEntry[];

  indents: Indent[];
  indentTypes: IndentType[];
  indentCats: Record<string, IndentCat>;

  store: StoreMaterial[];
  storeIssues: StoreIssue[];
  grn: GrnFlatRow[];
  bills: VendorBill[];

  qcRequests: QcRequest[];
  handover: Handover | null;
}

export const opsApi = {
  getOps: (scope: { project: string; subProject: string }) =>
    apiGet<OpsPayload>("/ops", { project: scope.project, subProject: scope.subProject }),
};
