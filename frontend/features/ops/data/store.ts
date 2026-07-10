import type { GrnReceipt, StoreIssue, VendorBill } from "@/features/ops/types";

/**
 * `OPS_STORE_ISSUES` — the site Store issue ledger (ported verbatim). Receipts
 * are NOT duplicated here; they come from the GRN spine (`OPS_GRN_RECEIPTS`).
 * Available = Σ received (net of rejects) − Σ issues.
 */
export const OPS_STORE_ISSUES: Record<string, StoreIssue[]> = {
  "P1.SP1": [
    { id: "ISS-008", date: "23 May 2026", matCode: "SS-M-101", qty: 1800, uom: "kg", toCode: "SS-1001", reason: "utilised", by: "Vinod K (Site Store)", note: "Column fab batch 5" },
    { id: "ISS-007", date: "22 May 2026", matCode: "SS-M-101", qty: 2400, uom: "kg", toCode: "SS-1001", reason: "utilised", by: "Vinod K (Site Store)", note: "Column fab batch 4" },
    { id: "ISS-006", date: "21 May 2026", matCode: "SS-M-101", qty: 2200, uom: "kg", toCode: "SS-1001", reason: "utilised", by: "Vinod K (Site Store)", note: "Column fab batch 4 — Bays 4-5" },
    { id: "ISS-005", date: "20 May 2026", matCode: "SS-M-101", qty: 2000, uom: "kg", toCode: "SS-1001", reason: "utilised", by: "Vinod K (Site Store)", note: "Bracings" },
    { id: "ISS-004", date: "18 May 2026", matCode: "SS-M-101", qty: 1800, uom: "kg", toCode: "SS-1001", reason: "utilised", by: "Vinod K (Site Store)", note: "Column fab batch 3" },
    { id: "ISS-003", date: "17 May 2026", matCode: "SS-M-101", qty: 2400, uom: "kg", toCode: "SS-1001", reason: "utilised", by: "Vinod K (Site Store)", note: "Rafter sections" },
    { id: "ISS-002", date: "12 May 2026", matCode: "SS-M-102", qty: 120, uom: "nos", toCode: "SS-1001", reason: "utilised", by: "Vinod K (Site Store)", note: "M16 bolts — column bases" },
    { id: "ISS-001", date: "28 Apr 2026", matCode: "SS-M-106", qty: 350, uom: "kg", toCode: "SS-1004", reason: "utilised", by: "Vinod K (Site Store)", note: "MS plate 12mm — built-up beam webs" },
  ],
};

/**
 * `OPS_GRN_RECEIPTS` — goods received on site, keyed by material code. Recorded
 * in the Goods Receipt tab against a PO; the same spine Procurement sees
 * read-only. Ported from the shared `PROC_GRN` store (P1.SP1 subset) with the
 * PO vendor + ordered qty flattened in for display.
 */
export const OPS_GRN_RECEIPTS: Record<string, Record<string, GrnReceipt[]>> = {
  "P1.SP1": {
    "SS-M-101": [{ grnId: "GRN-26-005", poNumber: "MH-PO-26-001", vendor: "Aahir Engineers", date: "17 May 2026", qtyReceived: 22000, orderedQty: 38000, uom: "kg", condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["AAH-26-04-510"], rejectedQty: 0, note: "Phase 1 delivery — 22,000 of 38,000 kg" }],
    "SS-M-102": [{ grnId: "GRN-26-001", poNumber: "MH-PO-26-002", vendor: "Inhouse Retails", date: "10 May 2026", qtyReceived: 200, orderedQty: 300, uom: "nos", condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["IHR-26-04-156"], rejectedQty: 0, note: "Partial delivery — 200/300 received in first lot" }],
    "SS-M-103": [{ grnId: "GRN-26-002", poNumber: "MH-PO-26-003", vendor: "Inhouse Retails", date: "10 May 2026", qtyReceived: 120, orderedQty: 120, uom: "nos", condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["IHR-26-04-157"], rejectedQty: 0, note: "Full delivery in 1 lot" }],
    "SS-M-106": [{ grnId: "GRN-26-003", poNumber: "MH-PO-26-006", vendor: "Aahir Engineers", date: "28 Apr 2026", qtyReceived: 350, orderedQty: 380, uom: "kg", condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["AAH-26-04-220"], rejectedQty: 0, note: "350 of 380 received, all good; 30 kg short on the order — vendor follow-up for the balance" }],
    "SS-M-107": [{ grnId: "GRN-26-004", poNumber: "MH-PO-26-007", vendor: "Aahir Engineers", date: "05 May 2026", qtyReceived: 25, orderedQty: 25, uom: "kg", condition: "good", receivedBy: "Vinod K (Site Store)", batchNos: ["AAH-26-05-101"], rejectedQty: 0, note: "Small HDG batch — fully received" }],
  },
};

/** Material master (code → description + uom), sourced from the Engineering BOM. */
export const OPS_MATERIALS: Record<string, { name: string; uom: string }> = {
  "SS-M-101": { name: "IS 2062 RHS/SHS Sections", uom: "kg" },
  "SS-M-102": { name: "M16 HDG Bolts", uom: "nos" },
  "SS-M-103": { name: "M20 HDG Bolts", uom: "nos" },
  "SS-M-105": { name: "Red Oxide Primer", uom: "litre" },
  "SS-M-106": { name: "MS Plate 12mm", uom: "kg" },
  "SS-M-107": { name: "IS 2062 HDG Sections", uom: "kg" },
  "SS-M-109": { name: "E7018 Welding Electrodes", uom: "kg" },
};

/**
 * `OPS_VENDOR_BILLS` — vendor invoices for the 3-way match (PO + GRN + Invoice).
 * Ops records the invoice; Procurement forwards to Finance. Ported from the
 * shared `PROC_INVOICES` store (P1.SP1 subset), keyed by material code.
 */
export const OPS_VENDOR_BILLS: Record<string, VendorBill[]> = {
  "P1.SP1": [
    { invId: "INV-IHR-2026-058", code: "SS-M-102", vendor: "Inhouse Retails", invDate: "11 May 2026", invQty: 200, invRate: 11.5, invValue: 2300, gstPct: 18, gst: 414, tdsPct: 1, tds: 23, netPayable: 2691, status: "forwarded_to_finance", matchPO: "match", matchGRN: "match", forwardedToFinance: "12 May 2026", paidOn: null, payRef: null, note: "Partial delivery — proportionate invoice OK" },
    { invId: "INV-IHR-2026-061", code: "SS-M-103", vendor: "Inhouse Retails", invDate: "12 May 2026", invQty: 120, invRate: 17, invValue: 2040, gstPct: 18, gst: 367, tdsPct: 1, tds: 20, netPayable: 2387, status: "paid", matchPO: "match", matchGRN: "match", forwardedToFinance: "13 May 2026", paidOn: "20 May 2026", payRef: "NEFT-MH-20May-0145", note: "" },
    { invId: "INV-AAH-2026-104", code: "SS-M-101", vendor: "Aahir Engineers", invDate: "08 May 2026", invQty: 16000, invRate: 90, invValue: 1440000, gstPct: 18, gst: 259200, tdsPct: 1, tds: 14400, netPayable: 1684800, status: "discrepancy", matchPO: "rate_mismatch", matchGRN: "no_grn", forwardedToFinance: null, paidOn: null, payRef: null, note: "Batch 2 balance (16,000 kg) invoiced ahead of delivery at ₹90/kg vs PO ₹67/kg — vendor claims price escalation (disputed). No GRN for batch 2 yet. HELD pending delivery + rate resolution." },
  ],
};
