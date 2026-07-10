import type { EstVersion } from "@/features/estimation/types";

/** Costing version history — only the active version is editable in the prototype. */
export const EST_VERSIONS: EstVersion[] = [
  { v: "V3", label: "V3 — Current", date: "19 May 2024", by: "Ramana (Estimation Head)", note: "Scope revision: MEP added post client meeting", active: true },
  { v: "V2", label: "V2", date: "10 May 2024", by: "Ramana (Estimation Head)", note: "Markup revised from 20% to 22% after checker review", active: false },
  { v: "V1", label: "V1 — Initial", date: "02 May 2024", by: "Auravintharam (Civil & Structural)", note: "Initial estimation from BD brief", active: false },
];
