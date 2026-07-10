import type { Project } from "@/types/procurement";

/** `PROJECTS` — projects with their cabinized sub-projects. */
export const PROJECTS: Project[] = [
  {
    id: "P1",
    code: "DCL/127",
    name: "Oragadam Warehouse",
    client: "Kesavan",
    type: "PEB Warehouse",
    stage: "Execution",
    value: "₹53.93 Cr",
    steelApplicable: true,
    startDate: "01 Apr 2026",
    duration: 120,
    awarded: true,
    subProjects: [
      { id: "SP1", name: "Porta Cabin A", units: 59, spec: "19×14×9 ft" },
      { id: "SP2", name: "Porta Cabin B", units: 8, spec: "20×10×8.5 ft" },
    ],
  },
  {
    id: "P2",
    code: "EUPH013632",
    name: "Euphoria",
    client: "Sanjay Srivastav",
    type: "Residential",
    stage: "Execution",
    value: "₹9L",
    steelApplicable: false,
    startDate: "15 Mar 2024",
    duration: 90,
    awarded: true,
  },
  {
    id: "P3",
    code: "RDASH13528",
    name: "Urban Oasis",
    client: "Ganesh Vishwa",
    type: "Residential",
    stage: "Execution",
    value: "₹30L",
    steelApplicable: false,
    startDate: "01 May 2024",
    duration: 75,
    awarded: true,
  },
  {
    id: "P4",
    code: "PAINF13382",
    name: "Patel Infrastructure",
    client: "Patel Infrastructure",
    type: "Commercial",
    stage: "Execution",
    value: "₹80L",
    steelApplicable: false,
    startDate: "10 Apr 2024",
    duration: 100,
    awarded: true,
  },
  {
    id: "P5",
    code: "RDASH18196",
    name: "DMagica",
    client: "Ajak",
    type: "Residential",
    stage: "Recce",
    value: "₹10L",
    steelApplicable: false,
    startDate: null,
    duration: 60,
    awarded: false,
  },
];

/** Fixed "today" for the demo (Day 53 of P1). */
export const MODOS_TODAY = "23 May 2026";

/** Project start dates — Day 1 anchor for block-day → calendar-date maths. */
export const PROJ_START: Record<string, string> = { P1: "01 Apr 2026" };
