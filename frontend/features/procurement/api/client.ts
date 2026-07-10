import { apiGet, apiPost } from "@/lib/http";
import type {
  Grn,
  Project,
  ProcKey,
  PurchaseOrder,
  Quote,
  RateContract,
} from "@/types/procurement";
import type {
  BillRow,
  BomListResponse,
  GrnGroup,
  PoRow,
  QuoteGroup,
  QuotesView,
  RfqRow,
  RfqView,
  DocsView,
  ReleaseEvent,
  WorkflowView,
  ScopeParams,
  VendorRow,
} from "./types";

const toParams = (scope: ScopeParams) => ({ project: scope.project, subProject: scope.subProject });

/** Typed client SDK for the procurement mock API. All calls go through `/api`. */
export const procurementApi = {
  getProjects: () => apiGet<{ projects: Project[] }>("/procurement/projects"),
  getBom: (scope: ScopeParams) => apiGet<BomListResponse>("/procurement/bom", toParams(scope)),
  getRfqs: (scope: ScopeParams) => apiGet<RfqRow[]>("/procurement/rfqs", toParams(scope)),
  getRfqView: (scope: ScopeParams) => apiGet<RfqView>("/procurement/rfqs/view", toParams(scope)),
  getQuotes: (scope: ScopeParams) => apiGet<QuoteGroup[]>("/procurement/quotes", toParams(scope)),
  getQuotesView: (scope: ScopeParams) => apiGet<QuotesView>("/procurement/quotes/view", toParams(scope)),
  getPurchaseOrders: (scope: ScopeParams) =>
    apiGet<PoRow[]>("/procurement/purchase-orders", toParams(scope)),
  getGrn: (scope: ScopeParams) => apiGet<GrnGroup[]>("/procurement/grn", toParams(scope)),
  getBills: (scope: ScopeParams) => apiGet<BillRow[]>("/procurement/bills", toParams(scope)),
  getVendors: () => apiGet<VendorRow[]>("/procurement/vendors"),
  getDocs: (scope: ScopeParams) => apiGet<DocsView>("/procurement/docs", toParams(scope)),
  getReleaseLog: (scope: ScopeParams) => apiGet<ReleaseEvent[]>("/procurement/releaselog", toParams(scope)),
  getWorkflow: (scope: ScopeParams) => apiGet<WorkflowView>("/procurement/workflow", toParams(scope)),
  getRateContracts: () => apiGet<RateContract[]>("/procurement/rate-contracts"),

  selectL1: (key: ProcKey, quoteId: string) =>
    apiPost<{ quotes: Quote[] }>("/procurement/quotes/select", { key, quoteId }),
  revertL1: (key: ProcKey) => apiPost<{ quotes: Quote[] }>("/procurement/quotes/revert", { key }),
  generatePurchaseOrder: (scope: ScopeParams, key: ProcKey, quoteId?: string) =>
    apiPost<{ po: PurchaseOrder }>("/procurement/purchase-orders", { ...toParams(scope), key, quoteId }),
  recordGrn: (key: ProcKey, qtyReceived: number, receivedBy: string) =>
    apiPost<{ grn: Grn }>("/procurement/grn", { key, qtyReceived, receivedBy }),
};
