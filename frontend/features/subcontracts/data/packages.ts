import type { ScPackage } from "@/features/subcontracts/types";

/**
 * Work packages for each scope — the kickoff "consumption view".
 *
 * SIMPLIFICATION: in the prototype `getSubcPackages()` derives these live from the
 * Planning kickoff make-vs-buy decisions (`KICKOFF_DECISIONS` / `getItemDecision`),
 * the estimation line items (`EST_ITEMS` / `getLineItems`) and the WBS-scaled
 * quantities (`spLineTotalQty`). That planning derivation is out of scope for this
 * module, so the packages are reproduced as static seed data — faithful to the
 * seeded `SEED_KO` decisions and `EST_ITEMS` rates/categories. `basisRate` follows
 * the prototype rule (labour → manpower rate; composite → material+machinery+manpower).
 * Quantities match the raised work-order quantities where one exists; the remainder
 * are the WBS-scaled (×units) estimates.
 *
 * Only P1.SP1 (Oragadam · Porta Cabin A) has a signed-off kickoff — every other
 * scope returns no packages (kickoff not signed), exactly like the prototype.
 */
export const SC_PACKAGES: Record<string, ScPackage[]> = {
  "P1.SP1": [
    { code: "SS-1001", name: "MS - Hot Rolled - Tubular RHS/SHS/CHS", cat: "Superstructure", catId: "SS", uom: "kg", scType: "manpower", matNature: "engineered", basisRate: 15, totalQty: 36000, budgetValue: 540000 },
    { code: "SS-1004", name: "MS - Welded Built-up - Open universal I/H/Channel/Angle", cat: "Superstructure", catId: "SS", uom: "kg", scType: "manpower", matNature: "engineered", basisRate: 18, totalQty: 4200, budgetValue: 75600 },
    { code: "SS-2001", name: "HDG - Hot Rolled - Tubular RHS/SHS/CHS", cat: "Superstructure", catId: "SS", uom: "kg", scType: "manpower", matNature: "boughtout", basisRate: 15, totalQty: 1450, budgetValue: 21750 },
    { code: "FN-4001", name: "WBC door shutter (35mm flush) — incl. hardware", cat: "Fenestrations", catId: "FN", uom: "sqm", scType: "lineitem", matNature: null, basisRate: 2436.4, totalQty: 124, budgetValue: 302114 },
    { code: "FN-4002", name: "WBC door frame (75×40mm section)", cat: "Fenestrations", catId: "FN", uom: "m", scType: "lineitem", matNature: null, basisRate: 400.8, totalQty: 307, budgetValue: 123046 },
    { code: "WC-1001", name: "PIR wall panel 40mm (two-skin colour-coated)", cat: "Wall System / Cladding", catId: "WS", uom: "sqm", scType: "manpower", matNature: "boughtout", basisRate: 370, totalQty: 1959, budgetValue: 724830 },
    { code: "WC-1002", name: "PIR wall panel 60mm", cat: "Wall System / Cladding", catId: "WS", uom: "sqm", scType: "manpower", matNature: "boughtout", basisRate: 370, totalQty: 1959, budgetValue: 724830 },
    { code: "RC-1001", name: "GI/PPGI profiled sheet", cat: "Roof", catId: "RF", uom: "sqm", scType: "manpower", matNature: "boughtout", basisRate: 100, totalQty: 604, budgetValue: 60400 },
    { code: "EL-1001", name: "Primary Light point", cat: "Electrical", catId: "EL", uom: "nos", scType: "lineitem", matNature: null, basisRate: 1057.15, totalQty: 80, budgetValue: 84572 },
    { code: "EL-2001", name: "6A SP MCB", cat: "Electrical", catId: "EL", uom: "nos", scType: "manpower", matNature: "boughtout", basisRate: 117, totalQty: 1180, budgetValue: 138060 },
    { code: "PL-1001", name: "CPVC exposed on wall - 15mm", cat: "Plumbing & Sanitary", catId: "PL", uom: "m", scType: "lineitem", matNature: null, basisRate: 131.71, totalQty: 240, budgetValue: 31610 },
    { code: "PL-5001", name: "EWC (European Water Closet)", cat: "Plumbing & Sanitary", catId: "PL", uom: "nos", scType: "manpower", matNature: "freeissue", basisRate: 1900, totalQty: 118, budgetValue: 224200 },
  ],
};

/** Category (trade) labels — ported from `EST_CATEGORIES` + the `PLANT` special-case. */
export const SC_CAT_LABELS: Record<string, string> = {
  SS: "Superstructure",
  FW: "Foundation / Substructure",
  WS: "Wall System / Cladding",
  RF: "Roof",
  FN: "Fenestrations",
  FL: "Finishes & Flooring",
  FC: "False Ceiling",
  FU: "Furniture & FF&E",
  RD: "Roadworks & External Dev.",
  LN: "Landscaping & Signage",
  EL: "Electrical",
  AC: "Air Conditioning / HVAC",
  PL: "Plumbing & Sanitary",
  FF: "Fire Fighting & Safety",
  PLANT: "Plant Hire",
};
