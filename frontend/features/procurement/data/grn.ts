import type { Grn, ProcKey } from "@/types/procurement";

/** `PROC_GRN` — goods receipt notes (multiple per PO for partial deliveries). */
export const PROC_GRN: Record<ProcKey, Grn[]> = {
  "P1.SP1.SS-M-101": [
    { grnId: "GRN-26-005", poNumber: "MH-PO-26-001", date: "17 May 2026", qtyReceived: 22000, condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["AAH-26-04-510"], rejectedQty: 0, note: "Phase 1 delivery — 22,000 of 38,000 kg" },
  ],
  "P1.SP1.SS-M-102": [
    { grnId: "GRN-26-001", poNumber: "MH-PO-26-002", date: "10 May 2026", qtyReceived: 200, condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["IHR-26-04-156"], rejectedQty: 0, note: "Partial delivery — 200/300 received in first lot" },
  ],
  "P1.SP1.SS-M-103": [
    { grnId: "GRN-26-002", poNumber: "MH-PO-26-003", date: "10 May 2026", qtyReceived: 120, condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["IHR-26-04-157"], rejectedQty: 0, note: "Full delivery in 1 lot" },
  ],
  "P1.SP1.SS-M-106": [
    { grnId: "GRN-26-003", poNumber: "MH-PO-26-006", date: "28 Apr 2026", qtyReceived: 350, condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["AAH-26-04-220"], rejectedQty: 0, note: "350 of 380 received, all good; 30 kg short on the order — vendor follow-up for the balance (delivery shortfall, not a QC rejection)" },
  ],
  "P1.SP1.SS-M-107": [
    { grnId: "GRN-26-004", poNumber: "MH-PO-26-007", date: "05 May 2026", qtyReceived: 25, condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["AAH-26-05-101"], rejectedQty: 0, note: "Small HDG batch — fully received" },
  ],
};
