import type { VendorBill } from "@/features/billing/types";

/**
 * BILL_VENDOR — incoming bills from material suppliers / services vendors
 * (modos_v436.html line 26230). Ported verbatim. The 3-way match (bill ↔ PO ↔
 * GRN + QC sign-off) drives the verify → certify → send-to-finance → paid
 * lifecycle. VB-003 is paid; VB-001 is an unverified advance (held).
 */
export const BILL_VENDOR: Record<string, VendorBill[]> = {
  "P1.SP1": [
    {
      id: "VB-003",
      billNo: "AAH/2026/118",
      vendor: "Aahir Engineers",
      vendorCode: "MVDR052",
      type: "material_supplier",
      billDate: "19 May 2026",
      receivedOn: "19 May 2026",
      poRef: "MH-PO-26-001",
      status: "paid",
      grossAmount: 1474000,
      tds: 0,
      retention: 0,
      gst: 265320,
      netPayable: 1739320,
      lineItems: [
        {
          bomCode: "SS-M-101",
          desc: "IS 2062 E250 raw steel (batch 1 of 2 — delivered, GRN-26-005)",
          qty: 22000,
          uom: "kg",
          rate: 67,
          amount: 1474000,
        },
      ],
      verifiedBy: "Vignesh",
      verifiedOn: "19 May 2026",
      qcSignOff: "IMIR-006",
      certifiedBy: "PM (Manoj)",
      certifiedOn: "19 May 2026",
      sentToFinanceOn: "19 May 2026",
      paidOn: "22 May 2026",
    },
    {
      id: "VB-001",
      billNo: "JAY/RENT/05",
      vendor: "JAY AMBE CONSTRUCTIONS",
      vendorCode: "MVVDR0758",
      type: "services",
      billDate: "23 May 2026",
      receivedOn: "23 May 2026",
      poRef: "MH-WO-26-005",
      status: "received",
      grossAmount: 180000,
      tds: 3600,
      retention: 0,
      gst: 32400,
      netPayable: 208800,
      lineItems: [
        { desc: "25T mobile crane hire — 5 days (26–30 May)", qty: 5, uom: "Day", rate: 36000, amount: 180000 },
      ],
      verifiedBy: null,
      verifiedOn: null,
      qcSignOff: null,
      certifiedBy: null,
      certifiedOn: null,
      sentToFinanceOn: null,
      paidOn: null,
      blockers: [
        "Advance bill — services not yet rendered. Hold for verification post-crane mobilization.",
      ],
    },
  ],
  "P1.SP2": [],
};
