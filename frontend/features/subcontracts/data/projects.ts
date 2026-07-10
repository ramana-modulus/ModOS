import type { ScProject } from "@/features/subcontracts/types";

/**
 * Projects with their cabinized sub-projects — the subset of `PROJECTS` the
 * Subcontracts module needs. Inlined (rather than importing another feature's
 * data) to keep the module self-contained. Only P1 is sub-project scoped and
 * signed-off; the others carry no subcontract packages.
 */
export const SC_PROJECTS: ScProject[] = [
  {
    id: "P1",
    code: "DCL/127",
    name: "Oragadam Warehouse",
    client: "Kesavan",
    type: "PEB Warehouse",
    subProjects: [
      { id: "SP1", name: "Porta Cabin A", units: 59, spec: "19×14×9 ft" },
      { id: "SP2", name: "Porta Cabin B", units: 8, spec: "20×10×8.5 ft" },
    ],
  },
  { id: "P2", code: "EUPH013632", name: "Euphoria", client: "Sanjay Srivastav", type: "Residential", subProjects: [{ id: "SP1", name: "Euphoria", units: 1 }] },
  { id: "P3", code: "RDASH13528", name: "Urban Oasis", client: "Ganesh Vishwa", type: "Residential", subProjects: [{ id: "SP1", name: "Urban Oasis", units: 1 }] },
  { id: "P4", code: "PAINF13382", name: "Patel Infrastructure", client: "Patel Infrastructure", type: "Commercial", subProjects: [{ id: "SP1", name: "Patel Infrastructure", units: 1 }] },
];

/** Sub-projects that have a signed-off Planning kickoff (packages defined). */
export const SC_SIGNED_SCOPES = new Set<string>(["P1.SP1"]);
