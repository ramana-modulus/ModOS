import { describe, expect, it } from "vitest";
import {
  buildCashflow,
  computeHealth,
  computeMetrics,
  getProjectActivity,
  isProjectExt,
  stagePillClass,
} from "@/features/projects/domain";
import { ACTIVITY_LOG, PROJ_CASHFLOW, PROJ_EXT } from "@/features/projects/data";
import { getProjects } from "@/features/projects/server/repository";

describe("computeHealth", () => {
  it("rates P1 as amber 'Watch' from SPI 0.94 + 2 open NCRs", () => {
    const h = computeHealth(PROJ_EXT.P1);
    expect(h.val).toBe("amber");
    expect(h.label).toBe("Watch");
    expect(h.auto).toBe(true);
    expect(h.reasons.length).toBe(2);
  });

  it("returns gray 'No data' for an empty ext stub", () => {
    const h = computeHealth(PROJ_EXT.P2);
    expect(h.val).toBe("gray");
    expect(h.label).toBe("No data");
  });
});

describe("computeMetrics", () => {
  it("derives progress delta, cost %, health, and total open risks for P1", () => {
    const ext = PROJ_EXT.P1;
    if (!isProjectExt(ext)) throw new Error("P1 ext missing");
    const mx = computeMetrics(ext);
    expect(mx.pgDelta).toBe(-3); // 62 actual − 65 planned
    expect(mx.scheduleVar).toBe(-3);
    expect(mx.costPct).toBe(59); // round(32.10 / 54.73 × 100)
    expect(mx.costHealth).toBe("green"); // forecast 53.60 ≤ revised 54.73
    expect(mx.totalRisks).toBe(9); // 3 RFI + 1 RFC + 2 NCR + 1 CO + 2 pending
  });
});

describe("buildCashflow", () => {
  it("computes per-month net + running balance and portfolio totals for P1", () => {
    const cf = buildCashflow(PROJ_CASHFLOW.P1!);
    expect(cf.months).toHaveLength(5);
    expect(cf.months[0]!.outTotal).toBeCloseTo(7.95, 2); // 5.20 + 1.80 + 0.95
    expect(cf.months[0]!.net).toBeCloseTo(8.23, 2); // 16.18 − 7.95
    expect(cf.months[0]!.balance).toBeCloseTo(8.23, 2);
    expect(cf.totalIn).toBeCloseTo(53.93, 2);
    expect(cf.totalOut).toBeCloseTo(46.25, 2);
    expect(cf.netCash).toBeCloseTo(7.68, 2);
    expect(cf.months[4]!.balance).toBeCloseTo(7.68, 2); // final running balance == netCash
    expect(cf.maxVal).toBeCloseTo(25.95, 2); // Aug inflow is the tallest bar
  });
});

describe("getProjectActivity", () => {
  it("filters to a project, sorts most-recent first, and caps at the limit", () => {
    const rows = getProjectActivity(ACTIVITY_LOG, "P1", 10);
    expect(rows).toHaveLength(10);
    expect(rows[0]!.id).toBe("A001");
    expect(rows[9]!.id).toBe("A010");
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i]!.ageMinutes).toBeGreaterThanOrEqual(rows[i - 1]!.ageMinutes);
    }
  });

  it("returns nothing for a project with no activity", () => {
    expect(getProjectActivity(ACTIVITY_LOG, "P2", 10)).toHaveLength(0);
  });
});

describe("stagePillClass", () => {
  it("maps known stages and falls back to gray", () => {
    expect(stagePillClass("Execution")).toBe("pg");
    expect(stagePillClass("Recce")).toBe("pa");
    expect(stagePillClass("Something Else")).toBe("pgr");
  });
});

describe("getProjects repository", () => {
  it("rolls up portfolio KPIs and per-project overviews", () => {
    const payload = getProjects();
    expect(payload.portfolio.total).toBe(5);
    expect(payload.portfolio.inExecution).toBe(4); // P1–P4 awarded & in Execution
    expect(payload.portfolio.awardedCount).toBe(4);
    expect(payload.portfolio.plansApproved).toBe(0); // all draft
    expect(payload.overviews.P1).not.toBeNull();
    expect(payload.overviews.P2).toBeNull();
    expect(payload.overviews.P1?.activity).toHaveLength(10);
    expect(payload.overviews.P1?.cashflow).not.toBeNull();
    expect(payload.planning.P1?.status).toBe("draft");
  });
});
