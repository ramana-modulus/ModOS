import type { ProjectCashflow } from "@/features/projects/types";

/**
 * `PROJ_CASHFLOW` — monthly inflow (client AR) vs outflow (proc + labour + OH)
 * for the cashflow schedule. Ported verbatim. Only P1 is populated.
 */
export const PROJ_CASHFLOW: Record<string, ProjectCashflow> = {
  'P1':{
    monthly:[
      {m:'Apr 2026', inflow:16.18, outflow:{proc:5.20, labour:1.80, oh:0.95}},  // 30% advance
      {m:'May 2026', inflow:0.00,  outflow:{proc:8.40, labour:2.10, oh:1.05}},
      {m:'Jun 2026', inflow:11.80, outflow:{proc:9.60, labour:2.80, oh:1.20}},  // material-at-site milestone (partial)
      {m:'Jul 2026', inflow:0.00,  outflow:{proc:4.20, labour:3.10, oh:1.10}},
      {m:'Aug 2026', inflow:25.95, outflow:{proc:1.50, labour:2.40, oh:0.85}},  // remaining + handover
    ],
    asOf:'23 May 2026',
    todayMonth:'May 2026'
  }
};
