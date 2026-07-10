import { describe, expect, it } from "vitest";
import { aggregateBOM, spUnits } from "@/features/procurement/domain/aggregate";
import { ENG_BOM } from "@/features/procurement/data/eng-bom";
import { PROJECTS } from "@/features/procurement/data/projects";

const P1 = PROJECTS.find((p) => p.id === "P1")!;
const rows = aggregateBOM(ENG_BOM["P1.SP1"]!, { units: spUnits(P1, "SP1") });
const byCode = new Map(rows.map((r) => [r.code, r]));

describe("aggregateBOM (P1.SP1)", () => {
  it("rolls the same material up across multiple BOQ lines", () => {
    // M16 bolts: 240 (SS-1001) + 60 (SS-1004) = 300
    expect(byCode.get("SS-M-102")?.totalQty).toBe(300);
    // Welding electrodes: 50 + 15 = 65
    expect(byCode.get("SS-M-109")?.totalQty).toBe(65);
    // Primer: 80 + 20 = 100
    expect(byCode.get("SS-M-105")?.totalQty).toBe(100);
  });

  it("records every consuming BOQ source", () => {
    expect(byCode.get("SS-M-102")?.sourceBOQs.sort()).toEqual(["SS-1001", "SS-1004"]);
    expect(byCode.get("SS-M-101")?.sourceBOQs).toEqual(["SS-1001"]);
  });

  it("includes an approved + released line's components", () => {
    expect(byCode.get("FN-M-401")?.totalQty).toBeCloseTo(2.1);
    expect(byCode.get("FN-M-407")).toBeDefined();
  });

  it("gates out non-approved / unreleased lines", () => {
    // FN-4002 is 'submitted', WC-1001 'in_approval', RC-1001 'rework'
    expect(byCode.get("FN-M-408")).toBeUndefined();
    expect(byCode.get("WC-M-101")).toBeUndefined();
    expect(byCode.get("RC-M-101")).toBeUndefined();
  });

  it("returns rows sorted by code", () => {
    const codes = rows.map((r) => r.code);
    expect(codes).toEqual([...codes].sort());
  });

  it("scales per-unit lines by units and leaves lot lines untouched", () => {
    const perUnit = aggregateBOM(ENG_BOM["P1.SP1"]!, {
      units: 59,
      lineBasis: (code) => (code === "SS-2001" ? "per_unit" : "lot"),
    });
    const byCodePU = new Map(perUnit.map((r) => [r.code, r]));
    // SS-M-107 comes only from SS-2001 (now per-unit) → 25 × 59
    expect(byCodePU.get("SS-M-107")?.totalQty).toBe(25 * 59);
    // SS-M-101 stays on a lot line → unchanged
    expect(byCodePU.get("SS-M-101")?.totalQty).toBe(38000);
  });

  it("drops lines routed away from procurement", () => {
    const routed = aggregateBOM(ENG_BOM["P1.SP1"]!, {
      units: 59,
      routesToProc: (code) => code !== "SS-2001",
    });
    expect(routed.find((r) => r.code === "SS-M-107")).toBeUndefined();
  });
});
