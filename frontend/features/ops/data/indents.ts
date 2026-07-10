import type { Indent, IndentCat, IndentType } from "@/features/ops/types";

/** `OPS_INDENT_TYPES` — the site-relevant indent catalogue (ported verbatim). */
export const OPS_INDENT_TYPES: IndentType[] = [
  { id: 1, name: "Material Indent (consumables / top-up)", cat: "material", routesTo: "proc", indentor: "Site Mgr/PM/Site Engg.", approver: "SCM Executive", escalation: "SCM Lead", docs: "BOQ ref, qty calc, site photos", sla: "24–48 hrs", priority: "Urgent → same day" },
  { id: 2, name: "Urgent / Critical Material", cat: "material", routesTo: "proc", indentor: "Site Mgr/PM/Site Engg.", approver: "SCM Lead", escalation: "COO", docs: "Exact qty, urgency justification, impact note", sla: "Same Day", priority: "Immediate vendor coord" },
  { id: 33, name: "Concreting / RMC works demand", cat: "material", routesTo: "subcontracts", indentor: "Site Mgr / PM", approver: "Project Manager", escalation: "SCM Lead", docs: "Pour card, grade, qty (cum), pump access plan", sla: "24–48 hrs", priority: "Pour scheduled 1–2 days ahead — subcontracts lines up RMC vendor (supply+pump+placing)" },
  { id: 12, name: "Fabrication Start Request (Factory)", cat: "logistics", routesTo: null, indentor: "Site Mgr/PM/Site Engg.", approver: "Design Lead → Manuf. Lead", escalation: "COO", docs: "Final GFC drawings, BOM, cut list", sla: "24 hrs", priority: "Urgent = same shift" },
  { id: 13, name: "Dispatch Request (Factory → Site)", cat: "logistics", routesTo: null, indentor: "Site Mgr/PM/Site Engg.", approver: "Logistics Coordinator", escalation: "SCM Lead", docs: "Packing list, material readiness, site confirmation", sla: "24–48 hrs", priority: "Urgent = same-day dispatch" },
  { id: 14, name: "Vehicle Booking (Truck/Tempo)", cat: "logistics", routesTo: null, indentor: "Site Mgr/PM/Site Engg.", approver: "Logistics Coordinator", escalation: "SCM Lead", docs: "Material list, destination, route", sla: "24 hrs", priority: "Emergency = same day" },
  { id: 22, name: "PPE / Safety Material Request", cat: "safety", routesTo: "proc", indentor: "Site Mgr / PM", approver: "EHS Officer", escalation: "Project Manager", docs: "PPE issue register, requirement forecast", sla: "24–48 hrs", priority: "Safety-critical = same day" },
  { id: 23, name: "Permit To Work (Height / Confined Space)", cat: "safety", routesTo: null, indentor: "Site Mgr/PM/Site Engg.", approver: "EHS Officer", escalation: "Project Manager", docs: "JSA, Method Statement", sla: "Immediate", priority: "No work without PTW" },
  { id: 24, name: "Manpower Request (Skilled / Unskilled)", cat: "hr_equipment", routesTo: "subcontracts", indentor: "Site Mgr / PM", approver: "Site Manager", escalation: "HR Lead", docs: "Manpower plan, requirement duration", sla: "24–48 hrs", priority: "Urgent → deploy local resources" },
  { id: 25, name: "Equipment / Plant Hire (Crane, Boom Lift)", cat: "hr_equipment", routesTo: "subcontracts", indentor: "Operations team", approver: "PM / SCM", escalation: "SCM Lead", docs: "Equipment requirement, lifting plan", sla: "24 hrs", priority: "Critical lift = same-day mobilisation" },
  { id: 26, name: "Equipment Breakdown / Repair", cat: "hr_equipment", routesTo: null, indentor: "Operations team", approver: "Equipment / Ops Mgr", escalation: "Project Manager", docs: "Breakdown photo, equipment ID", sla: "Same Day", priority: "Serious breakdown → emergency replacement" },
];

/** `OPS_INDENT_CATS` — category → label + colour chip. */
export const OPS_INDENT_CATS: Record<string, IndentCat> = {
  material: { label: "Materials & Vendor", color: "#854F0B", bg: "#FAEEDA" },
  workorder: { label: "Work Orders & Contractors", color: "#3B6D11", bg: "#EAF3DE" },
  logistics: { label: "Fabrication & Logistics", color: "#185FA5", bg: "#E6F1FB" },
  design: { label: "Design Coordination", color: "#5C2E91", bg: "#F0E8F8" },
  qaqc: { label: "QA / QC", color: "#0F766E", bg: "#D4EFEB" },
  safety: { label: "Safety", color: "#A32D2D", bg: "#FAE9E4" },
  hr_equipment: { label: "Manpower & Equipment", color: "#854F0B", bg: "#FBF0EC" },
  finance_legal: { label: "Finance & Legal", color: "#1A1917", bg: "#F0EFEB" },
  handover: { label: "Handover & Closure", color: "#5C2E91", bg: "#EFE5F8" },
};

/** `OPS_INDENTS` — raised indents per (project.subproject). */
export const OPS_INDENTS: Record<string, Indent[]> = {
  "P1.SP1": [
    { id: "IND-023", typeId: 25, cat: "hr_equipment", raisedAt: "23 May 2026 · 07:40", raisedBy: "Vignesh (Site Mgr)", forCode: "SS-1004", subject: "Hydra crane hire — 12T for built-up beam lifts (Bay 3–5, ~20 days)", priority: "high", status: "approved", approver: "Project Manager / SCM", slaDeadline: "24 May 2026 · 07:40", slaState: "within", docs: ["Lifting_plan_BeamBay3.pdf"], approvedAt: "23 May 2026 · 10:15", approvedBy: "PM", machineCode: "MC-3007", machineName: "Hydra Crane — 12T (site request)", hireQty: 20, hireUom: "Day", estRate: 3500, neededBy: "28 May 2026", routedTo: "subcontracts" },
    { id: "IND-020", typeId: 23, cat: "safety", raisedAt: "23 May 2026 · 08:15", raisedBy: "Vignesh (Site Mgr)", forCode: "SS-1001", subject: "PTW — Working at height for column erection (8m, Bay 1–3, today)", priority: "high", status: "approved", approver: "EHS Officer", slaDeadline: "23 May 2026 · 09:15", slaState: "within", docs: ["JSA_Column_Erection.pdf", "Method_Statement_v2.pdf"], approvedAt: "23 May 2026 · 08:55", approvedBy: "EHS Officer" },
    { id: "IND-019", typeId: 1, cat: "material", raisedAt: "22 May 2026 · 16:00", raisedBy: "Vignesh (Site Mgr)", forCode: "SS-M-103", subject: "Additional M20 bolts (50 nos) — site measurement adjustment for SS-1004", priority: "high", status: "pending_approval", approver: "SCM Executive", slaDeadline: "24 May 2026 · 16:00", slaState: "within", docs: ["BOQ_ref_SS-1004.pdf", "Site_measurement_001.jpg"] },
    { id: "IND-017", typeId: 13, cat: "logistics", raisedAt: "21 May 2026 · 11:20", raisedBy: "Vignesh (Site Mgr)", forCode: "SS-1001", subject: "Dispatch — fabricated columns batch 3 (12 columns) factory → Oragadam site", priority: "med", status: "approved", approver: "Logistics Coordinator", slaDeadline: "22 May 2026 · 11:20", slaState: "within", docs: ["Packing_list_b3.pdf", "Truck_booking.pdf"], approvedAt: "21 May 2026 · 14:30", approvedBy: "Logistics Coordinator" },
    { id: "IND-016", typeId: 25, cat: "hr_equipment", raisedAt: "21 May 2026 · 09:00", raisedBy: "Vignesh (Site Mgr)", forCode: "SS-1001", subject: "Crane hire — 25T mobile crane for column erection (5 days, 26–30 May)", priority: "high", status: "approved", approver: "Project Manager / SCM", slaDeadline: "22 May 2026 · 09:00", slaState: "within", docs: ["Lifting_plan.pdf"], approvedAt: "21 May 2026 · 16:20", approvedBy: "PM", machineCode: "MC-3002", machineName: "Mobile Crane — 25T (site request)", hireQty: 5, hireUom: "Day", estRate: 7850, neededBy: "26 May 2026", routedTo: "subcontracts" },
    { id: "IND-015", typeId: 24, cat: "hr_equipment", raisedAt: "20 May 2026 · 17:00", raisedBy: "Vignesh (Site Mgr)", forCode: null, subject: "Manpower — 4 additional erectors needed for column erection phase (1 week)", priority: "med", status: "approved", approver: "Site Manager", slaDeadline: "22 May 2026 · 17:00", slaState: "within", docs: ["Manpower_plan_w22.pdf"], approvedAt: "21 May 2026 · 12:00", approvedBy: "HR Lead" },
  ],
  "P1.SP2": [],
};
