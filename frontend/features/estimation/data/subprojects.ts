import type { EstSubProject } from "@/features/estimation/types";
import { EST_ITEMS_TEMPLATE } from "@/features/estimation/data/items";

/** Deep, mutation-safe copy of the template item list (prototype JSON-deep-copies
 * a frozen `EST_ITEMS_TEMPLATE` into each sub-project's own `items` array). */
function cloneItems() {
  return structuredClone(EST_ITEMS_TEMPLATE);
}

/**
 * Sub-projects keyed by lead id — each sub-project owns its own item snapshot,
 * unit count, and approval workflow. Ported verbatim from `EST_SUBPROJECTS`.
 */
export const EST_SUBPROJECTS: Record<string, EstSubProject[]> = {
  L4: [
    {
      id: "L4.SP1",
      name: "Porta Cabin A (19×14×9 ft)",
      spec: "19ft×14ft×9ft with PPGI roof, electric fittings, door, window, hinges, painting & lighting",
      units: 59,
      consignee: "ConsigneeOC510",
      deliveryDays: 120,
      status: "costing",
      items: cloneItems(),
      wf: {
        status: "in_progress",
        trades: [
          { id: "civil", name: "Civil & Structural", assignee: "Auravintharam", status: "in_progress", submittedOn: null, sections: ["Superstructure", "Foundation"] },
          { id: "electrical", name: "Electrical & ELV", assignee: "Tharun", status: "pending", submittedOn: null, sections: ["Electrical"] },
          { id: "plumbing", name: "Plumbing & HVAC", assignee: "Anand", status: "pending", submittedOn: null, sections: ["Plumbing"] },
        ],
        checker: "Ramana (Estimation Head)",
        checkerStatus: "pending",
        checkerNote: null,
        approver: "Shreeram R (CEO)",
        approverStatus: "pending",
        approverNote: null,
        quoteGenerated: false,
      },
    },
    {
      id: "L4.SP2",
      name: "Porta Cabin B (20×10×8.5 ft)",
      spec: "20ft×10ft×8.5ft with PPGI roof, electric fittings, door, window, hinges, painting & lighting",
      units: 8,
      consignee: "ConsigneeOC510",
      deliveryDays: 120,
      status: "costing",
      items: cloneItems(),
      wf: {
        status: "in_progress",
        trades: [
          { id: "civil", name: "Civil & Structural", assignee: "Mukunthan", status: "pending", submittedOn: null, sections: ["Superstructure", "Foundation"] },
          { id: "electrical", name: "Electrical & ELV", assignee: "Tharun", status: "pending", submittedOn: null, sections: ["Electrical"] },
          { id: "plumbing", name: "Plumbing & HVAC", assignee: "Anand", status: "pending", submittedOn: null, sections: ["Plumbing"] },
        ],
        checker: "Ramana (Estimation Head)",
        checkerStatus: "pending",
        checkerNote: null,
        approver: "Shreeram R (CEO)",
        approverStatus: "pending",
        approverNote: null,
        quoteGenerated: false,
      },
    },
  ],
  // L8 — NTPC B2G security cabin (small), single sub-project.
  L8: [
    {
      id: "L8.SP1",
      name: "Security Cabin (8×8×9 ft)",
      spec: "8ft×8ft×9ft PPGI cabin — supply & install, NTPC multi-location",
      units: 1,
      consignee: "NTPC Multi Location",
      deliveryDays: 60,
      status: "costing",
      items: cloneItems(),
      wf: {
        status: "in_progress",
        trades: [
          { id: "civil", name: "Civil & Structural", assignee: "Auravintharam", status: "in_progress", submittedOn: null, sections: ["Superstructure", "Foundation"] },
          { id: "electrical", name: "Electrical & ELV", assignee: "Tharun", status: "pending", submittedOn: null, sections: ["Electrical"] },
        ],
        checker: "Ramana (Estimation Head)",
        checkerStatus: "pending",
        checkerNote: null,
        approver: "Shreeram R (CEO)",
        approverStatus: "pending",
        approverNote: null,
        quoteGenerated: false,
      },
    },
  ],
  // L9 — Neyveli (NLC) B2G, portable steel cabins. Costing submitted for review.
  L9: [
    {
      id: "L9.SP1",
      name: "Portable Steel Cabin (19×14×9 ft)",
      spec: "19ft×14ft×9ft PPGI cabin — supply, transport & erection, NLC",
      units: 4,
      consignee: "Neyveli Lignite Corporation",
      deliveryDays: 90,
      status: "submitted",
      items: cloneItems(),
      wf: {
        status: "submitted_review",
        trades: [
          { id: "civil", name: "Civil & Structural", assignee: "Auravintharam", status: "submitted", submittedOn: "12 Mar 2026", sections: ["Superstructure", "Foundation", "Roof", "Wall"] },
          { id: "electrical", name: "Electrical & ELV", assignee: "Tharun", status: "submitted", submittedOn: "12 Mar 2026", sections: ["Electrical"] },
          { id: "plumbing", name: "Plumbing & HVAC", assignee: "Anand", status: "submitted", submittedOn: "12 Mar 2026", sections: ["Plumbing"] },
        ],
        checker: "Ramana (Estimation Head)",
        checkerStatus: "approved",
        checkerNote: "Verified",
        approver: "Shreeram R (CEO)",
        approverStatus: "approved",
        approverNote: "Approved for quote",
        quoteGenerated: false,
      },
    },
  ],
};
