import type { EstLead } from "@/features/estimation/types";

/**
 * The Estimation "costing queue" — BD leads whose status is `costing`. Ported
 * from the BD `LEADS` store (only the costing-stage subset that Estimation
 * consumes) plus the project-level workflow status from `EST_WORKFLOW`.
 * `wfStatus` gates the Summary tab: it unlocks once costing is submitted.
 */
export const EST_LEADS: EstLead[] = [
  {
    id: "L4",
    ref: "DCL/127",
    co: "Oragadam Warehouse",
    client: "Kesavan",
    tech: ["PEB"],
    desc: "PEB Warehouse Oragadam Industrial Park — 14,100 sqft",
    area: 14100,
    dl: "28 May 2026",
    docs: ["Site_Plan.pdf", "Requirements.docx", "Oragadam_Drawings.pdf"],
    wfStatus: "in_progress",
  },
  {
    id: "L8",
    ref: "DCL/134",
    co: "NTPC Multi Location",
    client: "NTPC",
    tech: ["Portacabin"],
    desc: "Security Cabin NTPC Multi Location — Supply & Install",
    area: 500,
    dl: "08 Jun 2026",
    docs: ["NTPC_Tender.pdf", "NTPC_BOQ.xlsx", "NTPC_Drawings.pdf"],
    wfStatus: "pending_assignment",
  },
  {
    id: "L9",
    ref: "DCL/027",
    co: "Neyveli Lignite Corporation",
    client: "Neyveli Lignite",
    tech: ["Portacabin"],
    desc: "4 Nos portable steel cabins",
    area: 4000,
    dl: "20 May 2026",
    docs: ["NLC_Tender.pdf"],
    wfStatus: "submitted_review",
  },
];
