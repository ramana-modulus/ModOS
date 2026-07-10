/**
 * `TENDER_PACKS` — the frozen contractual baseline assembled at deal-win (BD
 * lead docs + Estimation's approved BOQ). Engineering opens this on the
 * Incoming Docs tab as its Day-1 source of truth. Ported from
 * `modos_v436.html` (only the pre-built P1 pack is seeded).
 */
import type { TenderPacks } from "@/features/engineering/types";

export const TENDER_PACKS: TenderPacks = {
  P1: {
    projId: "P1",
    frozenAt: "01 Apr 2026 · 10:30 AM",
    frozenBy: "Aarumugam (BD Head)",
    sourceLeadId: "L4",
    sections: [
      {
        id: "client_info", label: "Client Information", icon: "ti-user-circle",
        items: [
          { label: "Client Name", value: "Daejun Container & Logistics (Kesavan, Director)" },
          { label: "Client Type", value: "Direct (B2B Repeat)" },
          { label: "Primary Contact", value: "Kesavan · +91-98401-21034 · kesavan@dcl-logistics.in" },
          { label: "Site Address", value: "Plot 47, Oragadam SIPCOT Industrial Park, Sriperumbudur, TN-602105" },
          { label: "GST Number", value: "33AAACR9876N1ZX" },
          { label: "PAN", value: "AAACR9876N" },
        ],
      },
      {
        id: "scope", label: "Scope of Work", icon: "ti-clipboard-text",
        items: [
          { label: "Project Type", value: "PEB Warehouse — 67 modular porta-cabin units" },
          { label: "Sub-projects", value: "Porta Cabin A (×59, 19×14×9 ft) + Porta Cabin B (×8, 20×10×8.5 ft)" },
          { label: "Total Built-up Area", value: "~17,500 sqft" },
          { label: "Build Type", value: "EPC (Engineering · Procurement · Construction)" },
          { label: "Site Conditions", value: "Cleared & levelled; soil-tested (CBR > 8); power & water available at boundary" },
          { label: "Special Reqs", value: "IS-875 wind zone IV compliance; ladder + roof safety harness anchor points; lightning arrester" },
        ],
      },
      {
        id: "commercial", label: "Commercial Terms", icon: "ti-cash",
        items: [
          { label: "Contract Value", value: "₹53.93 Cr (incl. GST)" },
          { label: "Payment Terms", value: "EPC: 20% advance, 60% milestone-linked, 15% on handover, 5% retention (12-mo DLP)" },
          { label: "Project Duration", value: "120 days from advance receipt (handover by 30 Jul 2026)" },
          { label: "LD Clause", value: "0.5% per week of delay, capped at 5% of contract value" },
          { label: "DLP", value: "12 months from handover" },
          { label: "Performance BG", value: "5% of contract value, valid till DLP end + 30 days" },
        ],
      },
      {
        id: "bd_docs", label: "BD Lead Documents", icon: "ti-files",
        items: [
          { label: "RFQ Document", value: "DCL_RFQ_Oragadam_v2.pdf", size: "2.4 MB", kind: "pdf", uploadedBy: "BD (Aarumugam)", uploadedOn: "12 Feb 2026" },
          { label: "Client Tender Drawings", value: "DCL_Tender_DWGs_Set.zip", size: "18.2 MB", kind: "zip", uploadedBy: "BD (Aarumugam)", uploadedOn: "12 Feb 2026" },
          { label: "Site Recce Photos", value: "Oragadam_Site_Recce_Photos.zip", size: "42.1 MB", kind: "zip", uploadedBy: "Vivek N. (Planning)", uploadedOn: "20 Feb 2026" },
          { label: "Soil Investigation", value: "GeoTech_Report_Oragadam.pdf", size: "5.7 MB", kind: "pdf", uploadedBy: "Client", uploadedOn: "25 Feb 2026" },
          { label: "Statutory Approvals", value: "SIPCOT_NOC_Building_Permit.pdf", size: "1.1 MB", kind: "pdf", uploadedBy: "Client", uploadedOn: "05 Mar 2026" },
          { label: "Client Email Trail", value: "Email_Chain_Oragadam_Pre-LOI.pdf", size: "810 KB", kind: "pdf", uploadedBy: "BD (Aarumugam)", uploadedOn: "25 Mar 2026" },
          { label: "Signed LOI", value: "DCL_LOI_Signed_30Mar2026.pdf", size: "620 KB", kind: "pdf", uploadedBy: "Legal", uploadedOn: "30 Mar 2026" },
        ],
      },
      {
        id: "est_boq", label: "Estimation Approved BOQ", icon: "ti-calculator",
        items: [
          { label: "BOQ Version (Frozen)", value: "V3 — Approved 28 Mar 2026 by Shreeram R" },
          { label: "BOQ Line Items", value: "37 items across 14 categories", linkTo: "estimation" },
          { label: "Prime Cost", value: "₹38.74 Cr (material + manpower + machinery + transport)" },
          { label: "Overheads (8%)", value: "₹3.10 Cr" },
          { label: "Margin (16.5%)", value: "₹7.49 Cr" },
          { label: "Quote Value (excl GST)", value: "₹49.33 Cr" },
          { label: "GST @ 18%", value: "₹8.88 Cr" },
          { label: "Final Quote (incl GST)", value: "₹58.21 Cr" },
          { label: "Negotiated to", value: "₹53.93 Cr (-7.4% from quote — final per LOI)" },
          { label: "Rate Analysis Snapshot", value: "EST_V3_Rate_Analysis.xlsx", size: "1.2 MB", kind: "xlsx", uploadedBy: "Ramana (Est. Head)", uploadedOn: "28 Mar 2026" },
        ],
      },
      {
        id: "sub_projects", label: "Sub-Project Breakdown", icon: "ti-building",
        items: [
          { label: "Sub-project 1", value: "Porta Cabin A — 19×14×9 ft, 59 units, single-skin PIR walls" },
          { label: "Sub-project 2", value: "Porta Cabin B — 20×10×8.5 ft, 8 units, double-skin PIR walls" },
          { label: "Common Spec", value: "PEB structure, GI/PPGI roof, aluminium fenestrations, vinyl flooring" },
          { label: "Tolerance", value: "±5mm on linear dimensions; ±2mm on connection points" },
        ],
      },
      {
        id: "contractual", label: "Contractual References", icon: "ti-file-text",
        items: [
          { label: "Master Service Agreement", value: "Modulus_DCL_MSA_2025.pdf — signed 15 Jan 2025", size: "2.8 MB", kind: "pdf" },
          { label: "Work Order", value: "DCL_WO_Oragadam_30Mar2026.pdf", size: "940 KB", kind: "pdf" },
          { label: "Insurance Requirement", value: "CAR + WC + Public Liability — minimum ₹10 Cr cover" },
          { label: "Statutory Compliances", value: "Labour licence (TN), Factory Act, PF/ESI registration for site workers" },
        ],
      },
    ],
    changeOrders: [
      {
        id: "CO-001", date: "28 Apr 2026", requestedBy: "Client (Kesavan)",
        title: "Additional 2 porta cabins for site office use",
        impact: "+2 units of Porta Cabin A; +₹1.68 Cr; +5 days timeline",
        status: "accepted", acceptedOn: "02 May 2026", acceptedBy: "Shreeram R (CEO)",
        sectionsAffected: ["scope", "commercial"],
      },
    ],
  },
};
