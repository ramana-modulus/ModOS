import type { PlanningState } from "@/features/projects/types";

/**
 * `PLANNING_STATE` — per-project planning/WBS approval status. Drives the
 * portfolio "Plans Approved" KPI and the fallback overview pill. Ported verbatim.
 */
export const PLANNING_STATE: Record<string, PlanningState> = {
  'P1': {  // Oragadam Warehouse — WBS in progress, not yet approved
    status: 'draft',
    autoPopulated: true,
    autoPopulatedAt: '04 Apr 2026 · 09:15 AM',
    history: [
      {status:'draft', by:'Suhas Darsi (Planner)', at:'04 Apr 2026 · 09:15 AM', note:'Auto-populated WBS from approved BOQ (12 line items)'},
    ],
    kickoff: null,
  },
  // Other projects: default to draft state (no planning done yet)
  'P2': {status:'draft', autoPopulated:false, history:[], kickoff:null},
  'P3': {status:'draft', autoPopulated:false, history:[], kickoff:null},
  'P4': {status:'draft', autoPopulated:false, history:[], kickoff:null},
  'P5': {status:'draft', autoPopulated:false, history:[], kickoff:null},
};
