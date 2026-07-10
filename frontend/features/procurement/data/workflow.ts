import type { ProcKey, ProcTeam, WorkflowState } from "@/types/procurement";

/** `PROC_WORKFLOW` — per-item maker→checker→approver + PO/ack state. */
export const PROC_WORKFLOW: Record<ProcKey, WorkflowState> = {
  "P1.SP1.SS-M-101": { csStatus: "approved", leadStatus: "approved", approverStatus: "approved", poStatus: "sent", vendorAckStatus: "acknowledged", csDate: "02 May 2026", leadDate: "03 May 2026", approverDate: "04 May 2026", poDate: "05 May 2026", ackDate: "05 May 2026" },
  "P1.SP1.SS-M-102": { csStatus: "approved", leadStatus: "approved", approverStatus: "approved", poStatus: "sent", vendorAckStatus: "partial", csDate: "02 May 2026", leadDate: "04 May 2026", approverDate: "04 May 2026", poDate: "06 May 2026", ackDate: "06 May 2026" },
  "P1.SP1.SS-M-103": { csStatus: "approved", leadStatus: "approved", approverStatus: "approved", poStatus: "sent", vendorAckStatus: "acknowledged", csDate: "02 May 2026", leadDate: "04 May 2026", approverDate: "04 May 2026", poDate: "06 May 2026", ackDate: "06 May 2026" },
  "P1.SP1.SS-M-109": { csStatus: "approved", leadStatus: "approved", approverStatus: "approved", poStatus: "pending", vendorAckStatus: "pending", csDate: "05 May 2026", leadDate: "06 May 2026", approverDate: "07 May 2026" },
  "P1.SP1.SS-M-105": { csStatus: "approved", leadStatus: "approved", approverStatus: "approved", poStatus: "sent", vendorAckStatus: "pending", csDate: "05 May 2026", leadDate: "06 May 2026", approverDate: "07 May 2026", poDate: "07 May 2026" },
  "P1.SP1.SS-M-106": { csStatus: "in_progress", leadStatus: "pending", approverStatus: "pending", poStatus: "pending", vendorAckStatus: "pending", csDate: "07 May 2026" },
  "P1.SP1.FN-M-401": { csStatus: "in_progress", leadStatus: "pending", approverStatus: "pending", poStatus: "pending", vendorAckStatus: "pending", csDate: "08 May 2026" },
};

/**
 * `PROC_TEAM` — value-based approval matrix.
 *   < ₹5L → Aarumugam · ₹5L–₹25L → Gobinath (COO) · > ₹25L → Shreeram (CEO)
 */
export const PROC_TEAM: ProcTeam = {
  buyer: { name: "Naveen R", role: "Buyer · Procurement Engineer" },
  lead: { name: "Aarumugam", role: "Procurement Manager" },
  approvers: {
    manager: { name: "Aarumugam", role: "Procurement Manager", thresholdLabel: "< ₹5L", min: 0, max: 500000 },
    coo: { name: "Gobinath", role: "COO", thresholdLabel: "₹5L – ₹25L", min: 500000, max: 2500000 },
    ceo: { name: "Shreeram", role: "CEO", thresholdLabel: "> ₹25L", min: 2500000, max: Infinity },
  },
};
