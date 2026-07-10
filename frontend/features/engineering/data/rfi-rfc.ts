/**
 * Open RFIs / RFCs per BOM line item — drives the inline badge next to each
 * BOQ line in the BOM tab, and the site material-change-request banner.
 * Keyed by `"{proj}.{sub}.{code}"`.
 */
import type { BomRfcMap, BomRfiMap } from "@/features/engineering/types";

export const BOM_RFIS: BomRfiMap = {
  "P1.SP1.SS-1004": [{ id: "RFI-002", subject: "Bolt grade for SS-1004 connections", raisedBy: "Vikram (Ops)", age: "2 days", status: "open" }],
  "P1.SP1.SS-1001": [{ id: "RFI-003", subject: "Clarification on SS-1001 anchor bolt spacing", raisedBy: "Tharun (PM)", age: "1 day", status: "open" }],
  "P1.SP1.FN-4001": [{ id: "RFI-001", subject: "Door swing direction confirmation", raisedBy: "Vikram (Ops)", age: "5 days", status: "open" }],
};

export const BOM_RFCS: BomRfcMap = {
  "P1.SP1.RC-1001": [{
    id: "RFC-001", subject: "Roof sheet 0.5mm → 0.6mm GI — site cyclonic wind uplift", raisedBy: "Vignesh (Site Mgr)", age: "5 days",
    status: "raised", raisedFrom: "ops", raisedOn: "18 May 2026", forCode: "RC-1001",
    compCode: "RC-M-101", fromSpec: "GI Profiled Sheet 0.5mm", toSpec: "GI Profiled Sheet 0.6mm", toName: "GI Profiled Sheet 0.6mm",
    reason: "Coastal site — 0.5mm sheet flags on wind-uplift check at eaves; 0.6mm gauge recommended by site for the cyclonic zone.",
    slId: null, slKey: "P1.SP1",
  }],
};
