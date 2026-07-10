import type { OpsProject } from "@/features/ops/types";

/** Demo "today" — Day 53 of P1 (matches the prototype's `OPS_TODAY`). */
export const OPS_TODAY = "23 May 2026";

/**
 * `PROJECTS` for the Operations project/sub-project bar. Only P1 (Oragadam) has
 * seeded execution data; the others render empty-state faithfully.
 */
export const OPS_PROJECTS: OpsProject[] = [
  {
    id: "P1",
    code: "DCL/127",
    name: "Oragadam Warehouse",
    client: "Kesavan",
    type: "PEB Warehouse",
    duration: 120,
    subProjects: [
      { id: "SP1", name: "Porta Cabin A", units: 59, spec: "19×14×9 ft" },
      { id: "SP2", name: "Porta Cabin B", units: 8, spec: "20×10×8.5 ft" },
    ],
  },
  { id: "P2", code: "EUPH013632", name: "Euphoria", client: "Sanjay Srivastav", type: "Residential", duration: 90 },
  { id: "P3", code: "RDASH13528", name: "Urban Oasis", client: "Ganesh Vishwa", type: "Residential", duration: 75 },
  { id: "P4", code: "PAINF13382", name: "Patel Infrastructure", client: "Patel Infrastructure", type: "Commercial", duration: 100 },
  { id: "P5", code: "RDASH18196", name: "DMagica", client: "Ajak", type: "Residential", duration: 60 },
];
