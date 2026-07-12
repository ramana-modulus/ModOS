import type { EstCategory, EstConfig, EstItem, EstSubProjectWf, EstVersion } from "@/features/estimation/types";
import { apiGet } from "@/lib/http";

/** A lead reduced to what the costing-queue selector needs. */
export interface EstLeadSummary {
  id: string;
  ref: string;
  co: string;
  client: string;
  tech: string[];
  dl: string | null;
}

/** A sub-project enriched with its computed unit rate + inclusive total. */
export interface EstSubProjectView {
  id: string;
  name: string;
  spec: string;
  units: number;
  consignee: string;
  deliveryDays: number;
  status: "costing" | "submitted" | "approved";
  items: EstItem[];
  /** Per-unit rate, excl. GST (Overview formula). */
  unitRateExcl: number;
  /** Total incl. GST across all units. */
  totalIncl: number;
  /** Maker → Checker → Approver → BD approval workflow for this sub-project. */
  wf: EstSubProjectWf;
}

/** The active lead/project header shown above the costing surface. */
export interface EstProjectHeader {
  id: string;
  ref: string;
  co: string;
  client: string;
  tech: string[];
  desc: string;
  area: number;
  dl: string | null;
  docs: string[];
  /** True once costing has been submitted for review — unlocks the Summary tab. */
  costingSubmitted: boolean;
}

export interface EstimationPayload {
  config: EstConfig;
  categories: EstCategory[];
  versions: EstVersion[];
  /** The full costing queue (for the project selector). */
  leads: EstLeadSummary[];
  /** The resolved active project. */
  project: EstProjectHeader;
  /** Sub-projects for the active project (may be empty). */
  subProjects: EstSubProjectView[];
  /** Grand total (incl. GST) summed across all sub-projects — Overview header. */
  overviewTotalIncl: number;
}

export const estimationApi = {
  getEstimation: (project?: string) =>
    apiGet<EstimationPayload>("/estimation", project ? { project } : undefined),
};
