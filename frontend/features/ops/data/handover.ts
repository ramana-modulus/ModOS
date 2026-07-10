import type { Handover } from "@/features/ops/types";

/** `OPS_HANDOVER` — FAC + DLP state per (project.subproject). Ported verbatim. */
export const OPS_HANDOVER: Record<string, Handover> = {
  "P1.SP1": {
    facStatus: "snag_closure",
    progressPct: 0,
    snagList: [
      { id: "SNAG-001", area: "Bay 2 / Grid C2", lineCode: "SS-1001", desc: "Touch-up paint at column base after grouting — 2 locations", severity: "minor", raisedBy: "Karthik (QA Engg.)", raisedAt: "20 May 2026", status: "open", fixedBy: null, fixedAt: null, evidence: "", verifiedBy: null, verifiedAt: null },
      { id: "SNAG-002", area: "Block A entrance", lineCode: "FN-4001", desc: "Door shutter alignment — 4 mm gap at top rail", severity: "minor", raisedBy: "Karthik (QA Engg.)", raisedAt: "20 May 2026", status: "rectified", fixedBy: "Site team", fixedAt: "22 May 2026", evidence: "Hinges re-set; gap within 2 mm — photo attached", verifiedBy: null, verifiedAt: null },
      { id: "SNAG-003", area: "Bay 3", lineCode: "WC-1001", desc: "Wall panel trim sealing incomplete at one corner", severity: "minor", raisedBy: "Karthik (QA Engg.)", raisedAt: "20 May 2026", status: "verified", fixedBy: "Site team", fixedAt: "21 May 2026", evidence: "Silicone bead completed", verifiedBy: "Karthik (QA Engg.)", verifiedAt: "22 May 2026" },
    ],
    asBuilts: [],
    dlpStart: null,
    dlpEnd: null,
    dlpIssues: [],
    projectedCompletion: "17 Aug 2026",
    note: "Block A (Porta Cabin A) completed for early handover — joint snag walk done 20 May; closing snags before FAC.",
  },
  "P1.SP2": {
    facStatus: "not_started",
    progressPct: 0,
    snagList: [],
    asBuilts: [],
    dlpStart: null,
    dlpEnd: null,
    dlpIssues: [],
    note: "Porta Cabin B still in design phase.",
  },
};
