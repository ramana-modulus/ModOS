import type { ProcKey, PurchaseOrder } from "@/types/procurement";

/** `PROC_POS` — POs raised against L1-selected quotes. `value` = rate × qty. */
export const PROC_POS: Record<ProcKey, PurchaseOrder> = {
  "P1.SP1.SS-M-101": { poNumber: "MH-PO-26-001", vCode: "MVDR052", vendor: "Aahir Engineers", qty: 38000, uom: "kg", rate: 67, value: 67 * 38000, status: "partial_delivery", poDate: "05 May 2026", expDelivery: "19 May 2026", zohoRef: "ZB-PO-2026-1234", deliveredQty: 22000, note: "22,000 of 38,000 received" },
  "P1.SP1.SS-M-102": { poNumber: "MH-PO-26-002", vCode: "MVDR055b", vendor: "Inhouse Retails", qty: 300, uom: "nos", rate: 11.5, value: 11.5 * 300, status: "partial_delivery", poDate: "06 May 2026", expDelivery: "11 May 2026", zohoRef: "ZB-PO-2026-1235", deliveredQty: 200, note: "200/300 received" },
  "P1.SP1.SS-M-103": { poNumber: "MH-PO-26-003", vCode: "MVDR055b", vendor: "Inhouse Retails", qty: 120, uom: "nos", rate: 17, value: 17 * 120, status: "delivered", poDate: "06 May 2026", expDelivery: "11 May 2026", zohoRef: "ZB-PO-2026-1236", deliveredQty: 120, note: "Delivered 10 May" },
  "P1.SP1.SS-M-109": { poNumber: "MH-PO-26-004", vCode: "MVDR058", vendor: "Industrial Welders Pvt Ltd", qty: 65, uom: "kg", rate: 275, value: 275 * 65, status: "approved", poDate: "07 May 2026", expDelivery: "14 May 2026", zohoRef: null, deliveredQty: 0, note: "Approved internally · Zoho push pending" },
  "P1.SP1.SS-M-105": { poNumber: "MH-PO-26-005", vCode: "MVDR057", vendor: "Asian Paints Industrial", qty: 100, uom: "litre", rate: 215, value: 215 * 100, status: "sent_to_zoho", poDate: "07 May 2026", expDelivery: "12 May 2026", zohoRef: "ZB-PO-2026-1237", deliveredQty: 0, note: "" },
  "P1.SP1.SS-M-106": { poNumber: "MH-PO-26-006", vCode: "MVDR052", vendor: "Aahir Engineers", qty: 380, uom: "kg", rate: 92, value: 92 * 380, status: "partial_delivery", poDate: "18 Apr 2026", expDelivery: "02 May 2026", zohoRef: "ZB-PO-2026-1238", deliveredQty: 350, note: "350 of 380 delivered" },
  "P1.SP1.SS-M-107": { poNumber: "MH-PO-26-007", vCode: "MVDR052", vendor: "Aahir Engineers", qty: 25, uom: "kg", rate: 115, value: 115 * 25, status: "delivered", poDate: "25 Apr 2026", expDelivery: "05 May 2026", zohoRef: "ZB-PO-2026-1239", deliveredQty: 25, note: "Fully delivered" },
};

/** `PROC_PO_AMENDMENTS` — post-issue change log per line. */
export const PROC_PO_AMENDMENTS: Record<ProcKey, import("@/types/procurement").PoAmendment[]> = {
  "P1.SP1.SS-M-101": [
    {
      amdId: "AMD-001",
      date: "10 May 2026",
      by: "Naveen R",
      type: "delivery_date",
      before: { expDelivery: "14 May 2026" },
      after: { expDelivery: "19 May 2026" },
      reason: "Vendor requested 5-day extension — raw material allocation",
      requiresReApproval: false,
      approvedBy: "Aarumugam",
      approvedOn: "10 May 2026",
    },
  ],
};
