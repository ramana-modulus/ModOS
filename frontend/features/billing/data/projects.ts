import type { BillProject } from "@/features/billing/types";

/**
 * Billing-scoped subset of the prototype PROJECTS array (line 4320).
 * `contractValue` on the sub-project is SEEDED here — the prototype PROJECTS
 * array carries no per-sub-project contract value, so the KPI "Contract Value"
 * would otherwise read ₹0. Seeded to a representative figure for display only.
 */
export const BILL_PROJECTS: BillProject[] = [
  {
    id: "P1",
    code: "DCL/127",
    name: "Oragadam Warehouse",
    client: "Kesavan",
    type: "PEB Warehouse",
    estimate: 12000000,
    subProjects: [
      { id: "SP1", name: "Porta Cabin A", units: 59, spec: "19×14×9 ft", contractValue: 12000000 },
      { id: "SP2", name: "Porta Cabin B", units: 8, spec: "20×10×8.5 ft", contractValue: 1600000 },
    ],
  },
  {
    id: "P2",
    code: "EUPH013632",
    name: "Euphoria",
    client: "Sanjay Srivastav",
    type: "Residential",
    estimate: 900000,
    subProjects: [{ id: "SP1", name: "Euphoria", units: 1, spec: "", contractValue: 900000 }],
  },
];
