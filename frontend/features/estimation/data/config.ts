import type { EstConfig } from "@/features/estimation/types";

/** Global costing rates (prototype `OVERHEADS_PCT` … `GST_PCT`).
 * These are hardcoded in the prototype; in prod they would be backend config. */
export const EST_CONFIG: EstConfig = {
  overheadsPct: 0.1,
  markupPct: 0.22,
  transportPct: 0.05,
  wastagePct: 0.05,
  gstPct: 18,
};
