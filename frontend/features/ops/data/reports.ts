import type { Dlr, Dpr } from "@/features/ops/types";

/**
 * `OPS_DPR` — Daily Progress Report register. Each DPR is a dated snapshot of
 * the day's qty deltas + carried manpower (DLR folded in), daily log lines,
 * blockers, tomorrow's plan, view points, reported % and expected end. Ported
 * verbatim.
 */
export const OPS_DPR: Record<string, Dpr[]> = {
  "P1.SP1": [
    {
      id: "DPR-053",
      date: "23 May 2026",
      status: "submitted",
      by: "Vignesh (Site Mgr)",
      deltas: [{ code: "SS-1001", qty: 1800, uom: "kg" }],
      log: [
        "Column fab batch 5 — 6 columns completed (factory, ready for dispatch)",
        "25T crane mobilised for Bay 1–3 erection",
      ],
      manpower: [
        { skill: "Fabricator", count: 8, forCode: "SS-1001" },
        { skill: "Welder", count: 5, forCode: "SS-1001" },
        { skill: "Helper", count: 4, forCode: "SS-1001" },
        { skill: "Rigger", count: 2, forCode: "SS-1001" },
      ],
      blockers: [],
      tomorrow: ["Begin column erection Bay 1–3 once crane setup verified"],
      viewpoints: [{ name: "Factory Bay 3", photos: ["col_batch5_23may.jpg"], date: "23 May 2026" }],
      reportedPct: 35,
      expectedEnd: "18 Aug 2026",
    },
    {
      id: "DPR-052",
      date: "22 May 2026",
      status: "submitted",
      by: "Vignesh (Site Mgr)",
      deltas: [
        { code: "SS-1001", qty: 2400, uom: "kg" },
        { code: "SS-1004", qty: 80, uom: "kg" },
      ],
      log: [
        "Column fab batch 4 completed — 8 columns",
        "Welded built-up beam Bay 3 complete (post NCR-007 repair)",
      ],
      manpower: [
        { skill: "Fabricator", count: 10, forCode: "SS-1001" },
        { skill: "Welder", count: 6, forCode: "SS-1004" },
        { skill: "Helper", count: 4, forCode: "SS-1001" },
      ],
      blockers: ["Bolt grade clarity for SS-1004 splice (RFI-002 open)"],
      tomorrow: ["Fab batch 5"],
      viewpoints: [],
      reportedPct: 34,
      expectedEnd: "18 Aug 2026",
    },
  ],
};

/**
 * `OPS_DLR` — Daily Labour Report. Retired in the prototype (manpower now lives
 * inside the DPR document) but kept as a faithful reference register; the
 * Progress Reports tab surfaces it as read-only historical labour detail.
 */
export const OPS_DLR: Record<string, Dlr[]> = {
  "P1.SP1": [
    {
      id: "DLR-022",
      date: "23 May 2026",
      mode: "detailed",
      by: "Vignesh",
      entries: [
        { skill: "Fabricator", count: 8, hours: 9, forCode: "SS-1001", rate: 850 },
        { skill: "Welder", count: 5, hours: 9, forCode: "SS-1001", rate: 1100 },
        { skill: "Helper", count: 4, hours: 9, forCode: "SS-1001", rate: 550 },
        { skill: "Rigger", count: 2, hours: 9, forCode: "SS-1001", rate: 950 },
      ],
    },
    {
      id: "DLR-021",
      date: "22 May 2026",
      mode: "detailed",
      by: "Vignesh",
      entries: [
        { skill: "Fabricator", count: 10, hours: 9, forCode: "SS-1001", rate: 850 },
        { skill: "Welder", count: 6, hours: 9, forCode: "SS-1004", rate: 1100 },
        { skill: "Helper", count: 4, hours: 9, forCode: "SS-1001", rate: 550 },
      ],
    },
    {
      id: "DLR-020",
      date: "21 May 2026",
      mode: "aggregated",
      by: "Vignesh",
      entries: [
        { skill: "Mixed (total)", count: 18, hours: 9, forCode: null, rate: null, note: "Crew shifted mid-day to support beam fab" },
      ],
    },
    {
      id: "DLR-019",
      date: "20 May 2026",
      mode: "detailed",
      by: "Manoj",
      entries: [
        { skill: "Fabricator", count: 8, hours: 9, forCode: "SS-1001", rate: 850 },
        { skill: "Welder", count: 4, hours: 8, forCode: "SS-1004", rate: 1100 },
        { skill: "Helper", count: 3, hours: 9, forCode: "SS-1001", rate: 550 },
      ],
    },
  ],
};
