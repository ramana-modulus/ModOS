import { describe, expect, it } from "vitest";
import {
  calcRow,
  categoryTotals,
  componentTotals,
  grandTotals,
  groupByCategory,
  subProjectTotalIncl,
  subProjectUnitRateExcl,
} from "@/features/estimation/domain";
import { EST_CATEGORIES } from "@/features/estimation/data/categories";
import { EST_CONFIG } from "@/features/estimation/data/config";
import { EST_ITEMS_TEMPLATE } from "@/features/estimation/data/items";
import { getEstimation } from "@/features/estimation/server/repository";
import type { EstItem } from "@/features/estimation/types";

const cfg = EST_CONFIG;
const SS1001 = EST_ITEMS_TEMPLATE.find((i) => i.code === "SS-1001")!;

describe("calcRow — per-line costing math", () => {
  it("derives transport/wastage from base when not overridden, and computes prime cost", () => {
    const c = calcRow(SS1001, cfg); // base = 88+17+15 = 120
    expect(c.tr).toBeCloseTo(6, 6); // 120 × 5%
    expect(c.wa).toBeCloseTo(6, 6); // 120 × 5%
    expect(c.prime).toBeCloseTo(132, 6); // 120 + 6 + 6
  });

  it("layers overheads + markup into the excl-GST rate, then GST into the incl rate", () => {
    const c = calcRow(SS1001, cfg);
    expect(c.oh).toBeCloseTo(13.2, 6); // 132 × 10%
    expect(c.mu).toBeCloseTo(29.04, 6); // 132 × 22%
    expect(c.rateExcl).toBeCloseTo(174.24, 6); // 132 + 13.2 + 29.04
    expect(c.rateIncl).toBeCloseTo(205.6032, 4); // × 1.18
  });

  it("multiplies rate by qty for line amounts", () => {
    const c = calcRow(SS1001, cfg);
    expect(c.amtExcl).toBeCloseTo(174.24 * 36000, 2);
    expect(c.amtIncl).toBeCloseTo(205.6032 * 36000, 1);
  });

  it("respects an explicit transport/wastage override", () => {
    const overridden: EstItem = { ...SS1001, transport: 10, wastage: 2 };
    const c = calcRow(overridden, cfg);
    expect(c.tr).toBe(10);
    expect(c.wa).toBe(2);
    expect(c.prime).toBeCloseTo(88 + 17 + 15 + 10 + 2, 6); // 132
  });
});

describe("aggregation", () => {
  it("groups items into categories, leaving empty categories present but empty", () => {
    const grouped = groupByCategory(EST_ITEMS_TEMPLATE, EST_CATEGORIES);
    expect(grouped.SS?.length).toBe(3);
    expect(grouped.FW?.length).toBe(0); // Foundation — no items in the template
    const cats = categoryTotals(grouped, EST_CATEGORIES, cfg);
    expect(cats.SS).toBeCloseTo(grouped.SS!.reduce((s, it) => s + calcRow(it, cfg).amtExcl, 0), 2);
  });

  it("GST is applied uniformly, so the incl total is exactly 1.18× the excl total", () => {
    const { grandTotalExcl, grandTotalIncl } = grandTotals(EST_ITEMS_TEMPLATE, cfg);
    expect(grandTotalIncl).toBeCloseTo(grandTotalExcl * 1.18, 2);
  });

  it("component totals sum to the prime cost total", () => {
    const { primeCostTotal } = grandTotals(EST_ITEMS_TEMPLATE, cfg);
    const { matTotal, machTotal, manTotal, transTotal, wasteTotal } = componentTotals(EST_ITEMS_TEMPLATE, cfg);
    expect(matTotal + machTotal + manTotal + transTotal + wasteTotal).toBeCloseTo(primeCostTotal, 2);
  });
});

describe("sub-project totals (Overview formula)", () => {
  it("equals the grand excl-GST total when no per-item overrides exist", () => {
    const unitRate = subProjectUnitRateExcl(EST_ITEMS_TEMPLATE, cfg);
    const { grandTotalExcl } = grandTotals(EST_ITEMS_TEMPLATE, cfg);
    expect(unitRate).toBeCloseTo(grandTotalExcl, 2);
  });

  it("scales by units and applies GST", () => {
    const unitRate = subProjectUnitRateExcl(EST_ITEMS_TEMPLATE, cfg);
    expect(subProjectTotalIncl(EST_ITEMS_TEMPLATE, 59, cfg)).toBeCloseTo(unitRate * 1.18 * 59, 1);
  });
});

describe("repository payload", () => {
  it("defaults to the first queued lead (L4) with its two sub-projects", () => {
    const payload = getEstimation();
    expect(payload.leads.length).toBe(3);
    expect(payload.project.id).toBe("L4");
    expect(payload.project.costingSubmitted).toBe(false);
    expect(payload.subProjects.map((s) => s.id)).toEqual(["L4.SP1", "L4.SP2"]);
  });

  it("unlocks the Summary for a submitted lead (L9) and derives overview totals", () => {
    const payload = getEstimation("L9");
    expect(payload.project.costingSubmitted).toBe(true);
    expect(payload.subProjects[0]!.units).toBe(4);

    const l4 = getEstimation("L4");
    const perUnitIncl = l4.subProjects[0]!.unitRateExcl * (1 + cfg.gstPct / 100);
    expect(l4.overviewTotalIncl).toBeCloseTo(perUnitIncl * (59 + 8), 1);
  });
});
