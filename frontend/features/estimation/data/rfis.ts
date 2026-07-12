import type { EstRfi } from "@/features/estimation/types";

/**
 * Seed RFIs (queries Estimation raises to Contracts to unblock costing).
 * Keyed by tender/lead id. The RFI tab clones these into client state and the
 * raise/answer/close flow mutates that local copy (demo, no persistence) —
 * faithful to the prototype's in-memory `RFIS` store.
 */
export const EST_RFIS_SEED: EstRfi[] = [
  {
    id: "RFI-001",
    tenderId: "L4",
    raisedBy: "gautham.g (Estimation)",
    raisedOn: "07 May 2026",
    question: "BOQ silent on floor finish — vinyl or screed? Rate impact ±₹180/sqft.",
    answer: "Vinyl finish confirmed (2mm homogeneous). Screed base already in civil scope.",
    answeredBy: "visvaprasad (Contracts)",
    answeredOn: "09 May 2026",
    status: "answered",
  },
  {
    id: "RFI-002",
    tenderId: "L4",
    raisedBy: "gautham.g (Estimation)",
    raisedOn: "10 May 2026",
    question: "Is crane access available at Oragadam site for erection, or do we price a hydra?",
    answer: "",
    answeredBy: "",
    answeredOn: "",
    status: "open",
  },
];

let counter = EST_RFIS_SEED.length;
/** Next RFI id (module-local, demo only). */
export function nextRfiId(): string {
  counter += 1;
  return `RFI-${String(counter).padStart(3, "0")}`;
}
