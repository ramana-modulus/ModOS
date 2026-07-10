import type { ActivityEntry } from "@/features/projects/types";

/**
 * `ACTIVITY_LOG` — cross-module activity feed surfaced on the project overview.
 * Ported verbatim from the prototype; the runtime `ts:Date.now()-…` sort key is
 * replaced with a static `ageMinutes` (smaller = more recent) so the roll-up is
 * deterministic. Ordering and `when` labels are unchanged.
 */
export const ACTIVITY_LOG: ActivityEntry[] = [
  { id: "A001", projId: "P1", dept: "Engineering", deptKey: "engineering", icon: "ti-ruler-2", by: "Suresh Iyer", action: "Marked Structural GFC ready for client review", ref: "DWG-STR-005", when: "2 h ago", ageMinutes: 120 },
  { id: "A002", projId: "P1", dept: "Procurement", deptKey: "procurement", icon: "ti-shopping-cart", by: "Gobinath M.", action: "Uploaded L1 quote for RC-1001 GI/PPGI roof sheet — JSW Steel", ref: "Q013", when: "4 h ago", ageMinutes: 240 },
  { id: "A003", projId: "P1", dept: "Operations", deptKey: "ops", icon: "ti-hammer", by: "Vikram Shetty", action: "Logged DPR — SS-1001 fabrication 28% complete (Day 22)", ref: "DPR-22May", when: "6 h ago", ageMinutes: 360 },
  { id: "A004", projId: "P1", dept: "QA / QC", deptKey: "qaqc", icon: "ti-shield-check", by: "Anand Pillai", action: "Raised NCR-002 — Bolt grade mismatch in SS-M-102 batch", ref: "NCR-002", when: "Yesterday", ageMinutes: 1560, severity: "warn" },
  { id: "A005", projId: "P1", dept: "Billing", deptKey: "billing", icon: "ti-file-invoice", by: "Priya Raman", action: "Raised RA-Bill 03 to client — ₹8.4 Cr against milestone", ref: "RA-03", when: "Yesterday", ageMinutes: 1800 },
  { id: "A006", projId: "P1", dept: "Engineering", deptKey: "engineering", icon: "ti-ruler-2", by: "Tharun Kumar", action: "Raised RFI-003 — Clarification on SS-1004 bolt grade", ref: "RFI-003", when: "2 days ago", ageMinutes: 2880 },
  { id: "A007", projId: "P1", dept: "Procurement", deptKey: "procurement", icon: "ti-shopping-cart", by: "Gobinath M.", action: "PO-001 sent to Zoho Books — Aahir Engineers ₹33.4 L", ref: "MH-PO-26-001", when: "2 days ago", ageMinutes: 3168 },
  { id: "A008", projId: "P1", dept: "Planning & Control", deptKey: "planning", icon: "ti-clipboard-list", by: "Arun S.", action: "Updated WBS — added activity for WC-1002 wall cladding", ref: "WBS-V3", when: "3 days ago", ageMinutes: 4320 },
  { id: "A009", projId: "P1", dept: "Finance", deptKey: "finance", icon: "ti-cash", by: "Karthik S.", action: "Received ₹4.2 Cr from client against RA-Bill 02", ref: "RCT-02", when: "4 days ago", ageMinutes: 5760, severity: "good" },
  { id: "A010", projId: "P1", dept: "Operations", deptKey: "ops", icon: "ti-hammer", by: "Vikram Shetty", action: "Raised RFC-001 — Roof panel thickness change request", ref: "RFC-001", when: "5 days ago", ageMinutes: 7200 },
  { id: "A011", projId: "P1", dept: "Engineering", deptKey: "engineering", icon: "ti-ruler-2", by: "Suresh Iyer", action: "Released BOM v2 to Procurement after qty rework", ref: "BOM-V2", when: "6 days ago", ageMinutes: 8640 },
  { id: "A012", projId: "P1", dept: "QA / QC", deptKey: "qaqc", icon: "ti-shield-check", by: "Anand Pillai", action: "IMIR closed — SS-M-101 batch 1 cleared inspection", ref: "IMIR-001", when: "7 days ago", ageMinutes: 10080, severity: "good" },
];
