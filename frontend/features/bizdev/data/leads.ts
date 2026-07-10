import type { Lead } from "@/features/bizdev/types";
import { LEADS_BASE } from "./leads-base";
import { STAGE_HISTORY } from "./stage-history";

/**
 * Leads with their backfilled stage history merged in. In production this comes
 * from a `lead_stage_transitions` table; most-recent entry = current stage.
 */
export const LEADS: Lead[] = LEADS_BASE.map((l) => ({
  ...l,
  stageHistory: (STAGE_HISTORY[l.id] ?? [[l.status, l.date]]).map(([stage, enteredAt]) => ({
    stage,
    enteredAt,
  })),
}));
