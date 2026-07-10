import { describe, it, expect } from "vitest";
import { getPlanning } from "@/features/planning/server/repository";
import {
  buildActivityRows,
  buildBlocks,
  buildWbsItems,
  demoTodayDay,
  deriveRoute,
  plannedEndDate,
  projectedEndDate,
} from "@/features/planning/domain";
import { KICKOFF_DECISIONS, SOURCE_ITEMS } from "@/features/planning/data";

describe("deriveRoute", () => {
  it("routes line-item SC through Subcontracts → Ops → QA", () => {
    expect(deriveRoute({ scType: "lineitem", matNature: null })).toEqual(["subcontracts", "ops", "qa"]);
  });
  it("routes manpower + engineered through all five lanes", () => {
    expect(deriveRoute({ scType: "manpower", matNature: "engineered" })).toEqual([
      "engg",
      "proc",
      "subcontracts",
      "ops",
      "qa",
    ]);
  });
  it("drops Procurement for client free-issue material", () => {
    expect(deriveRoute({ scType: "manpower", matNature: "freeissue" })).toEqual(["engg", "subcontracts", "ops", "qa"]);
  });
});

describe("buildBlocks (per-cabin template)", () => {
  const bySode = (code: string) => SOURCE_ITEMS.find((s) => s.code === code)!;

  it("gives a line-item SC three bars (subcontracts, ops, qa) at full qty", () => {
    const item = bySode("FN-4001");
    const blocks = buildBlocks(item, KICKOFF_DECISIONS["FN-4001"]!);
    expect(blocks.map((b) => b.dept)).toEqual(["subcontracts", "ops", "qa"]);
    expect(blocks.every((b) => b.qty === item.qtyPerUnit)).toBe(true);
  });

  it("starts the Procurement bar on day 8 for engineered material", () => {
    const proc = buildBlocks(bySode("SS-1001"), KICKOFF_DECISIONS["SS-1001"]!).find((b) => b.dept === "proc");
    expect(proc).toBeDefined();
    expect(proc!.day).toBe(8);
    expect(proc!.duration).toBe(18);
  });

  it("omits the Procurement bar entirely for free-issue material (PL-5001)", () => {
    const blocks = buildBlocks(bySode("PL-5001"), KICKOFF_DECISIONS["PL-5001"]!);
    expect(blocks.some((b) => b.dept === "proc")).toBe(false);
    expect(blocks.map((b) => b.dept)).toEqual(["engg", "subcontracts", "ops", "qa"]);
  });

  it("leaves WC-1001 ops/qa partially scheduled at 60%", () => {
    const item = bySode("WC-1001");
    const ops = buildBlocks(item, KICKOFF_DECISIONS["WC-1001"]!).find((b) => b.dept === "ops")!;
    expect(ops.qty).toBeCloseTo(Math.round(item.qtyPerUnit * 0.6 * 100) / 100, 5);
    expect(ops.qty).toBeLessThan(item.qtyPerUnit);
  });
});

describe("buildWbsItems rollup", () => {
  const items = buildWbsItems(SOURCE_ITEMS);

  it("derives 12 line items with 51 activity blocks", () => {
    expect(items).toHaveLength(12);
    expect(items.reduce((s, i) => s + i.blocks.length, 0)).toBe(51);
  });

  it("marks only WC-1001 and RC-1001 as not fully scheduled (84%)", () => {
    const partial = items.filter((i) => !i.fullyScheduled).map((i) => i.code).sort();
    expect(partial).toEqual(["RC-1001", "WC-1001"]);
    expect(items.find((i) => i.code === "WC-1001")!.overallPct).toBe(84);
  });

  it("keeps every other item fully scheduled (100%)", () => {
    const full = items.filter((i) => i.fullyScheduled);
    expect(full).toHaveLength(10);
    expect(full.every((i) => i.overallPct === 100)).toBe(true);
  });
});

describe("buildActivityRows (category rollup)", () => {
  const { rows, overallPct } = buildActivityRows(buildWbsItems(SOURCE_ITEMS));
  const cats = rows.filter((r) => r.level === 1);

  it("produces 6 category activities: 4 completed, 2 in progress, 0 not started", () => {
    expect(cats).toHaveLength(6);
    expect(cats.filter((r) => r.status === "completed")).toHaveLength(4);
    expect(cats.filter((r) => r.status === "in_progress")).toHaveLength(2);
    expect(cats.filter((r) => r.status === "not_started")).toHaveLength(0);
  });

  it("computes a value-weighted overall schedule of 100% (dominated by SS-1001)", () => {
    expect(overallPct).toBe(100);
  });
});

describe("calendar helpers", () => {
  it("places DEMO_TODAY (23 May 2026) at day 53 of the 01 Apr 2026 start", () => {
    expect(demoTodayDay("01 Apr 2026", "23 May 2026")).toBe(53);
  });
  it("computes planned end (+120d) and projected end (+125d)", () => {
    expect(plannedEndDate("01 Apr 2026", 120)).toBe("30 Jul 2026");
    expect(projectedEndDate("01 Apr 2026", 120)).toBe("04 Aug 2026");
  });
});

describe("getPlanning payload", () => {
  const payload = getPlanning();

  it("returns the P1 project pinned to SP1 with a Draft plan pill", () => {
    expect(payload.project.id).toBe("P1");
    expect(payload.subProject).toBe("SP1");
    expect(payload.planPill.label).toBe("Draft");
    expect(payload.signoffStatus).toBe("Awaiting plan approval");
  });

  it("carries the WBS stats and a signed-off kickoff matrix", () => {
    expect(payload.wbs.stats.totalActivities).toBe(6);
    expect(payload.wbs.stats.completed).toBe(4);
    expect(payload.wbs.stats.plannedEndDate).toBe("30 Jul 2026");
    expect(payload.kickoffMatrix.signedOff).toBe(true);
    expect(payload.kickoffMatrix.decided).toBe(12);
    expect(payload.kickoffMatrix.counts.lineitem).toBe(4);
  });
});
