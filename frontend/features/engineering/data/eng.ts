/**
 * Engineering data stores — ported verbatim from `modos_v436.html`
 * ([DATA-ENG] blocks). Keyed by `"{proj}.{sub}"` unless noted.
 */
import type {
  ApprovalQueues,
  EngBomHistory,
  EngDocsMap,
  EngDrawingsState,
  EngTeam,
  EngVersions,
  EngWorkflowMap,
} from "@/features/engineering/types";

export const ENG_DRAWINGS_STATE: EngDrawingsState = {
  "P1.SP1": {
    structure: {
      preliminary: { status: "approved", count: 4, by: "Vigneshwaran (Struct. Engg.)", at: "28 Mar 2026", approver: "Rohith R (Engg. Head)", approvedAt: "30 Mar 2026", note: "Concept frame layout, foundation scheme, column setting-out" },
      gfc: { status: "in_review", count: 3, by: "Vigneshwaran (Struct. Engg.)", at: "18 Apr 2026", approver: "Rohith R (Engg. Head)", note: "Foundation GFC + column schedule submitted; bolt schedule under review" },
      detailed: { status: "pending", count: 0, by: null, at: null, note: "Awaits GFC approval" },
      vetting: { status: "not_submitted", vetter: null, submittedAt: null, vettedAt: null, remarks: null, note: "Submit GFC drawings to IIT for proof checking after internal approval" },
    },
    architecture: {
      preliminary: { status: "approved", count: 2, by: "Dushyanth K (Architect)", at: "02 Apr 2026", approver: "Rohith R (Engg. Head)", approvedAt: "05 Apr 2026", note: "Floor plan + elevations finalized" },
      gfc: { status: "in_review", count: 1, by: "Dushyanth K (Architect)", at: "22 Apr 2026", approver: "Rohith R (Engg. Head)", note: "Door/window schedule GFC submitted" },
      detailed: { status: "pending", count: 0, by: null, at: null, note: "Awaits GFC approval" },
    },
    mep: {
      preliminary: { status: "in_review", count: 2, by: "Hariharan (MEP)", at: "10 Apr 2026", approver: "Rohith R (Engg. Head)", note: "Electrical SLD + plumbing layout drafted" },
      gfc: { status: "pending", count: 0, by: null, at: null, note: "Awaits Preliminary approval" },
      detailed: { status: "pending", count: 0, by: null, at: null, note: "Awaits GFC" },
    },
  },
  "P1.SP2": {
    structure: {
      preliminary: { status: "in_review", count: 3, by: "Yogalakshmi (Struct. Engg.)", at: "15 Apr 2026", approver: "Rohith R (Engg. Head)", note: "Concept frame submitted (variant of SP1 design)" },
      gfc: { status: "pending", count: 0, by: null, at: null, note: "Awaits Preliminary approval" },
      detailed: { status: "pending", count: 0, by: null, at: null, note: "Awaits GFC" },
      vetting: { status: "not_submitted", vetter: null, submittedAt: null, vettedAt: null, remarks: null, note: "Vetting required after structural GFC approval" },
    },
    architecture: {
      preliminary: { status: "in_review", count: 2, by: "Hariharan (Architect)", at: "18 Apr 2026", approver: "Rohith R (Engg. Head)", note: "Initial layout for 20×10×8.5 ft variant" },
      gfc: { status: "pending", count: 0, by: null, at: null, note: "Awaits Preliminary approval" },
      detailed: { status: "pending", count: 0, by: null, at: null, note: "Awaits GFC" },
    },
    mep: {
      preliminary: { status: "pending", count: 0, by: null, at: null, note: "Not started — awaits Arch Prelim" },
      gfc: { status: "pending", count: 0, by: null, at: null, note: "Awaits Preliminary" },
      detailed: { status: "pending", count: 0, by: null, at: null, note: "Awaits GFC" },
    },
  },
};

export const ENG_TEAM: EngTeam = {
  head: { name: "Rohith R", role: "Head of Engineering & Research", initials: "RR", color: "#C84B2F" },
  disciplines: [
    { key: "structure", label: "Structural", icon: "ti-ruler-2", color: "#185FA5", makers: [{ name: "Vigneshwaran", initials: "VG" }, { name: "Yogalakshmi", initials: "YL" }] },
    { key: "architecture", label: "Architecture", icon: "ti-building", color: "#7B1FA2", makers: [{ name: "Dushyanth K", initials: "DK" }, { name: "Hariharan", initials: "HR" }] },
    { key: "mep", label: "MEP", icon: "ti-bolt", color: "#854F0B", makers: [{ name: "Hariharan", initials: "HR" }] },
  ],
};

export const ENG_BOM_HISTORY: EngBomHistory = {
  "P1.SP1.SS-1001": [
    { ver: "v3", date: "22 Apr 2026 · 14:20", by: "Vigneshwaran", changes: "Added 2 BOM lines (E7018 electrodes, Red Oxide primer) per Rohith review", released: true, releasedAt: "22 Apr 2026 · 16:00" },
    { ver: "v2", date: "12 Apr 2026 · 11:30", by: "Vigneshwaran", changes: "Reworked qty +6.67% (36,000 → 38,400 kg) based on detailed frame layout", released: false },
    { ver: "v1", date: "01 Apr 2026 · 09:00", by: "System (auto)", changes: "Initial from Estimation V3 BOQ handoff", released: false },
  ],
  "P1.SP1.SS-1004": [
    { ver: "v3", date: "20 May 2026 · 09:30", by: "Vigneshwaran", changes: "Post-PO rework: increased plate qty +5% (380 → 399 kg) after revised connection details. ⚠ Procurement to review impact on PO-001.", released: false },
    { ver: "v2", date: "18 Apr 2026 · 10:15", by: "Vigneshwaran", changes: "Reworked qty +8.57% (350 → 380 kg). Added MS Plate 12mm as primary material.", released: true, releasedAt: "19 Apr 2026 · 11:00" },
    { ver: "v1", date: "01 Apr 2026 · 09:00", by: "System (auto)", changes: "Initial from Estimation V3 BOQ handoff", released: false },
  ],
  "P1.SP1.FN-4001": [
    { ver: "v2", date: "20 Apr 2026 · 15:40", by: "Dushyanth K", changes: "Components added — flush shutter core, lipping, ironmongery set (WBC door)", released: false },
    { ver: "v1", date: "01 Apr 2026 · 09:00", by: "System (auto)", changes: "Initial from Estimation V3 BOQ handoff", released: false },
  ],
  "P1.SP1.WC-1001": [
    { ver: "v2", date: "21 Apr 2026 · 09:00", by: "Dushyanth K", changes: "BOM components drafted; awaits Rohith review", released: false },
    { ver: "v1", date: "01 Apr 2026 · 09:00", by: "System (auto)", changes: "Initial from Estimation V3 BOQ handoff", released: false },
  ],
};

export const ENG_VERSIONS: EngVersions = {
  "P1.SP1": [
    { ver: "V3", label: "Engineering V3 — Current Working Set", active: true, released: false, date: "22 Apr 2026", by: "Rohith R", note: "BOM v3 for SS-1001 with welding electrodes & primer added. Awaiting external vetting sign-off before release.", stats: { drawings: 12, bomItems: 12, openRFI: 3, openRFC: 1 } },
    { ver: "V2", label: "Engineering V2 — Post-RFC Updates", active: false, released: true, date: "15 Apr 2026", by: "Rohith R", releasedAt: "19 Apr 2026", note: "Bolt grade clarifications closed, base plate sizing reworked per Vikram's feedback. SS-1001 & SS-1004 released to Procurement.", stats: { drawings: 9, bomItems: 12, openRFI: 0, openRFC: 0 } },
    { ver: "V1", label: "Engineering V1 — Initial GFC Submission", active: false, released: false, date: "05 Apr 2026", by: "Rohith R", note: "Preliminary drawings approved. BOM auto-derived from Estimation V3 BOQ handover.", stats: { drawings: 6, bomItems: 12, openRFI: 0, openRFC: 0 } },
  ],
  "P1.SP2": [
    { ver: "V1", label: "Engineering V1 — Preliminary (current)", active: true, released: false, date: "18 Apr 2026", by: "Rohith R", note: "Initial frame layout for Porta Cabin B (20×10×8.5 ft variant). Under internal review.", stats: { drawings: 5, bomItems: 0, openRFI: 0, openRFC: 0 } },
  ],
};

export const ENG_DOCS: EngDocsMap = {
  "P1.SP1": [
    { name: "DBR_Oragadam_PortaCabin_A_Rev2.pdf", type: "Design Basis Report", uploaded: "05 Apr 2026", by: "Vigneshwaran", size: "2.8 MB", status: "Active" },
    { name: "Structural_Calcs_Frame_Analysis.xlsx", type: "Calculations", uploaded: "08 Apr 2026", by: "Vigneshwaran", size: "1.4 MB", status: "Active" },
    { name: "Wind_Load_Calcs_IS875.pdf", type: "Calculations", uploaded: "08 Apr 2026", by: "Vigneshwaran", size: "0.9 MB", status: "Active" },
    { name: "Seismic_Analysis_IS1893.pdf", type: "Calculations", uploaded: "10 Apr 2026", by: "Yogalakshmi", size: "1.1 MB", status: "Active" },
    { name: "Soil_Test_Report_Oragadam.pdf", type: "Site Report", uploaded: "15 Mar 2026", by: "External Vendor", size: "5.2 MB", status: "Reference" },
    { name: "Tech_Spec_Structural_Steel_IS2062.pdf", type: "Tech Spec", uploaded: "05 Apr 2026", by: "Rohith R", size: "1.1 MB", status: "Active" },
    { name: "Tech_Spec_PUF_Wall_Panel_60mm.pdf", type: "Tech Spec", uploaded: "10 Apr 2026", by: "Dushyanth K", size: "0.8 MB", status: "Active" },
    { name: "IS_Code_References_Used.pdf", type: "Reference", uploaded: "05 Apr 2026", by: "Rohith R", size: "0.4 MB", status: "Reference" },
    { name: "IIT_Vetting_Cover_Submission.pdf", type: "Vetting", uploaded: "23 May 2026", by: "Rohith R", size: "0.6 MB", status: "In Review" },
  ],
  "P1.SP2": [
    { name: "DBR_Oragadam_PortaCabin_B_Draft.pdf", type: "Design Basis Report", uploaded: "13 Apr 2026", by: "Yogalakshmi", size: "2.2 MB", status: "Draft" },
    { name: "Structural_Calcs_PCB_Frame.xlsx", type: "Calculations", uploaded: "15 Apr 2026", by: "Yogalakshmi", size: "1.2 MB", status: "Draft" },
  ],
};

export const ENG_WORKFLOW: EngWorkflowMap = {
  "P1.SP1": {
    disciplines: [
      { id: "structure", name: "Structural", assignee: "Vigneshwaran", sections: ["Frame", "Foundation", "Columns", "Roof Truss", "Bolt Schedule"], status: "submitted", submittedOn: "18 Apr 2026" },
      { id: "architecture", name: "Architecture", assignee: "Dushyanth K", sections: ["Floor Plan", "Elevations", "Door/Window Schedule"], status: "submitted", submittedOn: "22 Apr 2026" },
      { id: "mep", name: "MEP", assignee: "Hariharan", sections: ["Electrical SLD", "Plumbing Layout"], status: "in_progress" },
    ],
    checker: "Rohith R",
    checkerStatus: "in_review",
    approver: "Rohith R",
    approverStatus: "pending",
    vettingRequired: true,
    vettingStatus: "pending",
    procurementReleased: false,
  },
  "P1.SP2": {
    disciplines: [
      { id: "structure", name: "Structural", assignee: "Yogalakshmi", sections: ["Frame", "Foundation"], status: "in_progress" },
      { id: "architecture", name: "Architecture", assignee: "Hariharan", sections: ["Floor Plan", "Elevations"], status: "in_progress" },
      { id: "mep", name: "MEP", assignee: null, sections: [], status: "pending" },
    ],
    checker: "Rohith R",
    checkerStatus: "pending",
    approver: "Rohith R",
    approverStatus: "pending",
    vettingRequired: true,
    vettingStatus: "pending",
    procurementReleased: false,
  },
};

/** Approver registry — Engineering BOQs + drawings all route to Rohith R. */
export const ENG_APPROVERS: Record<string, string> = {
  engg_bom: "rohith",
  engg_drawing: "rohith",
};

export const USERS_REG: Record<string, { name: string; role: string }> = {
  rohith: { name: "Rohith R", role: "Engineering Head" },
  dushyanth: { name: "Dushyanth K", role: "Design Engineer" },
  vigneshwaran: { name: "Vigneshwaran", role: "Structural Engineer" },
  tharun: { name: "Tharun Kumar", role: "Architectural Engineer" },
};

/**
 * Seeded approval queue — one queue per approver, keyed by user id. Items
 * carry the batch metadata shown to the approver. `boqCode`/`drawingId`
 * identify the unit under review.
 */
export const ENG_APPROVAL_QUEUES: ApprovalQueues = {
  rohith: [
    { projId: "P1", spId: "SP1", boqCode: "WC-1001", kind: "boq", sentAt: "21 May 2026 · 14:00", sentBy: "Dushyanth K", batchId: "BATCH-SEED-001", version: "v1" },
  ],
};
