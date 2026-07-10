import { describe, expect, it } from "vitest";
import { calcTotalRate } from "@/features/library/types";
import { LIB_ITEMS } from "@/features/library/data/items";
import { LIB_BOM } from "@/features/library/data/materials";

describe("calcTotalRate", () => {
  it("rolls component rates up with wastage", () => {
    // (4700 + 600 + 1200 + 235) × 1.05 = 7071.75
    expect(calcTotalRate({ matRate: 4700, machRate: 600, manRate: 1200, transRate: 235, wastePct: 5 })).toBeCloseTo(7071.75);
  });
  it("returns 0 for an all-zero item", () => {
    expect(calcTotalRate({ matRate: 0, machRate: 0, manRate: 0, transRate: 0, wastePct: 0 })).toBe(0);
  });
});

describe("library seed data", () => {
  it("loads the full costing library", () => {
    expect(LIB_ITEMS.length).toBe(52);
    expect(LIB_BOM.length).toBe(106);
  });
  it("every BOQ line item carries a category and group", () => {
    for (const item of LIB_ITEMS) {
      expect(item.cat).toBeTruthy();
      expect(item.group).toBeTruthy();
    }
  });
  it("computes FW-4001's derived total from its BOM", () => {
    const fw = LIB_ITEMS.find((i) => i.code === "FW-4001")!;
    expect(calcTotalRate(fw)).toBeCloseTo(7071.75);
    expect(fw.bom.length).toBe(5);
  });
});
