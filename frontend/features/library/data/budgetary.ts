/**
 * Budgetary Costing line-item library — the pre-canned, per-technology rate
 * cards used for indicative (enquiry-stage) costing.
 *
 * This is the SINGLE SOURCE OF TRUTH. It is surfaced two ways:
 *   1. Item Libraries → Line Items tab renders it as a "Budgetary Costing"
 *      sub-category (grouped by technology).
 *   2. The BizDev lead panel's Budgetary Costing calculator inherits its
 *      default line items + rates from here (see
 *      features/bizdev/components/budgetary-costing.tsx), then lets the user
 *      tweak rates / floor area / inclusion per lead.
 */
export interface BudgetaryLineItem {
  code: string;
  name: string;
  /** Indicative prime rate, ₹ per sqft. */
  rate: number;
  /** Whether the item is included by default in the budgetary quote. */
  sel: boolean;
}

/** Markup applied to the prime rate to reach the quoted rate (percent). */
export const BQ_MARKUP_PCT = 22;

/** Technologies that have a budgetary rate card, in display order. */
export const BQ_TECHS = ["PEB", "CISP", "Portacabin", "LGSF"] as const;

export const LIB_BUDGETARY: Record<string, BudgetaryLineItem[]> = {
  PEB: [
    { code: "BQ-FW", name: "Substructure / Foundation", rate: 55, sel: true },
    { code: "BQ-SS", name: "Structural Steel (PEB Frame)", rate: 135, sel: true },
    { code: "BQ-RF", name: "Roof Cladding (Lysaght/PUF)", rate: 85, sel: true },
    { code: "BQ-WL", name: "Wall Cladding (Colour Coated)", rate: 65, sel: true },
    { code: "BQ-FN", name: "Fenestrations (Doors & Windows)", rate: 45, sel: true },
    { code: "BQ-FL", name: "Flooring (Concrete/Tile)", rate: 40, sel: false },
    { code: "BQ-FC", name: "False Ceiling", rate: 35, sel: false },
    { code: "BQ-EL", name: "Electrical (Basic)", rate: 55, sel: true },
    { code: "BQ-AC", name: "Air Conditioning", rate: 120, sel: false },
    { code: "BQ-PL", name: "Plumbing & Sanitary", rate: 40, sel: false },
    { code: "BQ-FI", name: "Fire Fighting", rate: 25, sel: false },
  ],
  CISP: [
    { code: "BQ-FW", name: "Substructure / Foundation", rate: 65, sel: true },
    { code: "BQ-SS", name: "Structural Steel (CISP Frame)", rate: 150, sel: true },
    { code: "BQ-PN", name: "CISP Insulated Panel (Wall+Roof)", rate: 220, sel: true },
    { code: "BQ-FN", name: "Fenestrations", rate: 60, sel: true },
    { code: "BQ-FL", name: "Flooring", rate: 50, sel: true },
    { code: "BQ-FC", name: "False Ceiling", rate: 40, sel: true },
    { code: "BQ-EL", name: "Electrical", rate: 65, sel: true },
    { code: "BQ-AC", name: "Air Conditioning", rate: 140, sel: false },
    { code: "BQ-PL", name: "Plumbing & Sanitary", rate: 50, sel: false },
    { code: "BQ-FI", name: "Fire Fighting", rate: 30, sel: false },
  ],
  Portacabin: [
    { code: "BQ-FW", name: "Substructure / Foundation", rate: 30, sel: true },
    { code: "BQ-FR", name: "Steel Frame Structure", rate: 180, sel: true },
    { code: "BQ-PN", name: "Panel System (Wall + Roof)", rate: 280, sel: true },
    { code: "BQ-FN", name: "Doors & Windows", rate: 80, sel: true },
    { code: "BQ-FL", name: "Flooring (Vinyl/Tile)", rate: 60, sel: true },
    { code: "BQ-FC", name: "False Ceiling", rate: 40, sel: true },
    { code: "BQ-EL", name: "Electrical (Full)", rate: 80, sel: true },
    { code: "BQ-AC", name: "Air Conditioning", rate: 150, sel: false },
    { code: "BQ-PL", name: "Plumbing & Sanitary", rate: 60, sel: false },
  ],
  LGSF: [
    { code: "BQ-FW", name: "Substructure / Foundation", rate: 60, sel: true },
    { code: "BQ-SS", name: "LGSF Frame (Cold Formed Steel)", rate: 160, sel: true },
    { code: "BQ-RF", name: "Roof (Tiles / Sheet)", rate: 90, sel: true },
    { code: "BQ-WL", name: "Wall (Drywall / Cladding)", rate: 75, sel: true },
    { code: "BQ-FN", name: "Fenestrations", rate: 70, sel: true },
    { code: "BQ-FL", name: "Flooring", rate: 55, sel: true },
    { code: "BQ-EL", name: "Electrical", rate: 65, sel: true },
    { code: "BQ-AC", name: "Air Conditioning", rate: 130, sel: false },
    { code: "BQ-PL", name: "Plumbing", rate: 50, sel: false },
  ],
};

// Technology aliases share a rate card with their base type (matches the prototype).
LIB_BUDGETARY["Kiosk"] = LIB_BUDGETARY.Portacabin!;
LIB_BUDGETARY["Prefab Shelter"] = LIB_BUDGETARY.PEB!;

/** A fresh, mutable copy of the budgetary line items for a technology (falls back to PEB). */
export function getBudgetaryItems(tech: string): BudgetaryLineItem[] {
  const card = LIB_BUDGETARY[tech] ?? LIB_BUDGETARY.PEB!;
  return card.map((i) => ({ ...i }));
}

/** Quoted rate = prime rate + markup, rounded to the rupee. */
export function quotedRate(rate: number): number {
  return Math.round(rate * (1 + BQ_MARKUP_PCT / 100));
}
