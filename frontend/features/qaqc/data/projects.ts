import type { Project } from "@/features/qaqc/types";

/** Project + sub-project scope for the QA/QC view (mirrors the prototype `PROJECTS`). */
export const QC_PROJECTS: Project[] = [
  {
    id: "P1",
    code: "DCL/127",
    name: "Oragadam Warehouse",
    client: "Kesavan",
    qaEngineer: "Karthik",
    subProjects: [
      { id: "SP1", name: "Porta Cabin A", units: 59, spec: "19×14×9 ft" },
      { id: "SP2", name: "Porta Cabin B", units: 8, spec: "20×10×8.5 ft" },
    ],
  },
];

/** Demo "today" — matches the prototype timeline. */
export const QC_TODAY = "27 May 2026";
