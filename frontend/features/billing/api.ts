import { apiGet } from "@/lib/http";
import type { BillingView, ProjectsPayload } from "@/features/billing/types";

export interface BillingScope {
  project: string;
  subProject: string;
}

/** Typed client SDK for the billing mock API. */
export const billingApi = {
  getProjects: () => apiGet<ProjectsPayload>("/billing/projects"),
  getBilling: (scope: BillingScope) =>
    apiGet<BillingView>("/billing", { project: scope.project, subProject: scope.subProject }),
};

export type { BillingView, ProjectsPayload } from "@/features/billing/types";
