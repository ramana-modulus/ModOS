import type { AwardedProject } from "@/features/contracts/types";

/**
 * Awarded projects available in Post-Sales (the `PROJECTS.filter(p=>p.awarded)`
 * picker). Only `id` + `name` are needed here; contracts-side seed data
 * currently exists for P1 (Oragadam Warehouse).
 */
export const CONTRACT_PROJECTS: AwardedProject[] = [
  { id: "P1", name: "Oragadam Warehouse" },
  { id: "P2", name: "Euphoria" },
  { id: "P3", name: "Urban Oasis" },
  { id: "P4", name: "Patel Infrastructure" },
];
