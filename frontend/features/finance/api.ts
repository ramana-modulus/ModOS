import { apiGet } from "@/lib/http";
import type { FinancePayload } from "@/features/finance/types";

export type { FinancePayload } from "@/features/finance/types";

export interface FinanceScope {
  project: string;
  subProject: string;
}

/** Typed client SDK for the finance mock API. All calls go through `/api`. */
export const financeApi = {
  getFinance: (scope: FinanceScope) =>
    apiGet<FinancePayload>("/finance", { project: scope.project, subProject: scope.subProject }),
};
