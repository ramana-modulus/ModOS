import type { QcRequest } from "@/features/ops/types";

/**
 * `OPS_QC_REQUESTS` — the intimation loop that unblocks Billing: work progressed
 * → Ops requests inspection → QA inspects (WIR) → QC sign-off → Billing measures
 * → RA. Ported verbatim. status: requested → scheduled → inspected → closed.
 */
export const OPS_QC_REQUESTS: Record<string, QcRequest[]> = {
  "P1.SP1": [
    { id: "QCR-003", code: "SS-1001", week: "W8", requestedOn: "23 May 2026", by: "Vignesh (Site Mgr)", status: "requested", note: "Column fab batches 4–5 (~4,200 kg this week) ready for stage inspection" },
    { id: "QCR-002", code: "SS-1004", week: "W7", requestedOn: "20 May 2026", by: "Vignesh (Site Mgr)", status: "inspected", inspRef: "WIR-003", note: "Built-up beam welds — Bay 3", closedNote: "WIR-003 partial pass → NCR-007 raised; repair done, DPT pending" },
    { id: "QCR-001", code: "SS-2001", week: "W6", requestedOn: "12 May 2026", by: "Vignesh (Site Mgr)", status: "closed", inspRef: "WIR-006", note: "HDG canopy frame — site work inspection", closedNote: "Passed — cleared for RA measurement" },
  ],
};
