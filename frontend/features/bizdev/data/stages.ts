import type { BdStage, StageId, StageThreshold } from "@/features/bizdev/types";

/** Reference "today" for deterministic mock stage-age display. */
export const DEMO_TODAY = "23 May 2026";

export const BD_STAGES: BdStage[] = [
  { id: "enquiry", label: "New Enquiry", prob: 10, color: "#F0EFED", tc: "#6B6A68" },
  { id: "costing", label: "Costing", prob: 30, color: "#FAEEDA", tc: "#854F0B" },
  { id: "proposal", label: "Proposal Sent", prob: 50, color: "#E6F1FB", tc: "#185FA5" },
  { id: "negotiation", label: "Negotiation", prob: 75, color: "#F3E8FB", tc: "#7B1FA2" },
  { id: "won", label: "Won", prob: 100, color: "#EAF3DE", tc: "#3B6D11" },
  { id: "lost", label: "Lost", prob: 0, color: "#FCEBEB", tc: "#A32D2D" },
  { id: "not_participated", label: "Not Participated", prob: 0, color: "#F5F4F2", tc: "#9B9894" },
];

/** Per-stage warn/stale thresholds in days (terminal stages omitted). */
export const STAGE_THRESHOLDS: Partial<Record<StageId, StageThreshold>> = {
  enquiry: { warn: 7, stale: 14 },
  costing: { warn: 10, stale: 21 },
  proposal: { warn: 14, stale: 30 },
  negotiation: { warn: 14, stale: 21 },
};

/** Tech-stack code → CSS class (`.tech-peb` etc. in the design system). */
export const TECH_TAGS: Record<string, string> = {
  PEB: "tech-peb",
  CISP: "tech-cisp",
  Portacabin: "tech-portacabin",
  LGSF: "tech-lgsf",
  Kiosk: "tech-kiosk",
  "Prefab Shelter": "tech-prefab",
};
