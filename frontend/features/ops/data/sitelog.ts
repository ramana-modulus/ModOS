import type { SiteLogEntry } from "@/features/ops/types";

/**
 * `OPS_SITE_LOG` — one register, two kinds: passive `event` (site diary) and
 * `hindrance` (blocks work; carries routing + a closure loop). Drawing
 * hindrances route to Engineering (RFI), material to Procurement, others
 * escalate internally. Ported verbatim.
 */
export const OPS_SITE_LOG: Record<string, SiteLogEntry[]> = {
  "P1.SP1": [
    { id: "SL-010", date: "23 May 2026", kind: "event", cat: "milestone", text: "Column erection started Bay 1–3 — 25T crane mobilised", by: "Vignesh (Site Mgr)", status: "logged" },
    {
      id: "SL-009",
      date: "22 May 2026",
      kind: "hindrance",
      cat: "material",
      text: "PIR wall panel lot 2 (WC-1002) — shade mismatch vs approved sample (RAL 9002 ordered, lot looks RAL 7035). Brand/spec mismatch — hold installation.",
      by: "Manoj (Asst. Site Engg.)",
      status: "routed",
      routedTo: "proc",
      routedOn: "22 May 2026",
      forCode: "WC-1002",
      chain: [{ at: "22 May 2026 · 15:30", note: "Raised to Procurement — vendor to be notified", by: "Manoj" }],
    },
    {
      id: "SL-008",
      date: "18 May 2026",
      kind: "hindrance",
      cat: "drawing",
      text: "Bolt grade for SS-1004 connections — drawing shows mix of 8.8 and HDG grades at Bay 3 splice. Need clarification before next splice batch.",
      by: "Vignesh (Site Mgr)",
      status: "routed",
      routedTo: "engg",
      routedOn: "18 May 2026",
      forCode: "SS-1004",
      refId: "RFI-002",
      chain: [{ at: "18 May 2026 · 15:45", note: "RFI-002 raised to Engineering; pin-comment added on SS-1004 section detail", by: "Vignesh" }],
    },
    { id: "SL-007", date: "19 May 2026", kind: "event", cat: "visitor", text: "Client (Kesavan) site walk — reviewed column fab progress at factory; OK to proceed", by: "Vignesh (Site Mgr)", status: "logged" },
    {
      id: "SL-006",
      date: "16 May 2026",
      kind: "hindrance",
      cat: "weather",
      text: "Pre-monsoon showers 14:00–17:00 — erection paused, crane demobbed for the day",
      by: "Vignesh (Site Mgr)",
      status: "resolved",
      resolvedOn: "17 May 2026",
      chain: [{ at: "17 May 2026", note: "Weather cleared; erection resumed", by: "Vignesh" }],
    },
    { id: "SL-005", date: "10 May 2026", kind: "event", cat: "qc", text: "Material QC done — M16 bolts batch 1 (200 nos, Inhouse Retails) passed incoming inspection", by: "Karthik (QA Engg.)", status: "logged" },
  ],
  "P1.SP2": [
    {
      id: "SL-101",
      date: "19 May 2026",
      kind: "hindrance",
      cat: "drawing",
      text: "GFC drawings pending for Porta Cabin B variant (20×10×8.5 ft) — site cannot start setting-out",
      by: "Vignesh (Site Mgr)",
      status: "routed",
      routedTo: "engg",
      routedOn: "19 May 2026",
      forCode: "SS-1001",
      chain: [{ at: "19 May 2026 · 10:00", note: "Raised to Engineering — Design Lead notified", by: "Vignesh" }],
    },
  ],
};
