import { beforeEach, describe, expect, it } from "vitest";
import { getBizDev, moveStage, createLead, resetBizDevStore } from "@/features/bizdev/server/repository";
import { daysBetween, getDaysInStage, getDaysSinceCreated, parseLeadDate } from "@/features/bizdev/domain";
import { LEADS } from "@/features/bizdev/data/leads";
import { DEMO_TODAY } from "@/features/bizdev/data/stages";

describe("date helpers", () => {
  it("parses DD MMM YYYY", () => {
    expect(parseLeadDate("23 May 2026")?.getFullYear()).toBe(2026);
    expect(parseLeadDate("bad")).toBeNull();
  });
  it("counts whole days, clamped at 0", () => {
    expect(daysBetween("01 May 2026", "23 May 2026")).toBe(22);
    expect(daysBetween("23 May 2026", "01 May 2026")).toBe(0);
  });
});

describe("stage age", () => {
  const byId = new Map(LEADS.map((l) => [l.id, l]));
  it("measures days in the current stage from the last transition", () => {
    // L7 entered proposal on 22 May → 1d as of 23 May
    expect(getDaysInStage(byId.get("L7")!, DEMO_TODAY)).toBe(1);
    // L4 entered costing on 05 May → 18d
    expect(getDaysInStage(byId.get("L4")!, DEMO_TODAY)).toBe(18);
  });
  it("measures total lead age from the first transition", () => {
    // L6 first entered enquiry on 01 Mar → 83d
    expect(getDaysSinceCreated(byId.get("L6")!, DEMO_TODAY)).toBe(83);
  });
  it("backfills stageHistory for every lead", () => {
    for (const l of LEADS) expect(l.stageHistory.length).toBeGreaterThan(0);
  });
});

describe("bizdev lifecycle mutations", () => {
  beforeEach(() => resetBizDevStore());

  it("converts a lead (enquiry → costing) and resets the stage clock", () => {
    const before = getBizDev().leads.find((l) => l.id === "L1")!;
    expect(before.status).toBe("enquiry");
    const moved = moveStage("L1", "costing");
    expect(moved.status).toBe("costing");
    expect(moved.daysInStage).toBe(0); // entered on DEMO_TODAY
    expect(moved.stageHistory[moved.stageHistory.length - 1]!.stage).toBe("costing");
  });

  it("advances proposal → negotiation → won", () => {
    expect(moveStage("L7", "negotiation").status).toBe("negotiation");
    expect(moveStage("L7", "won").status).toBe("won");
    // won now counts in stats
    expect(getBizDev().stats.wonCount).toBeGreaterThanOrEqual(2);
  });

  it("supports back-moves and mark-lost", () => {
    expect(moveStage("L6", "proposal").status).toBe("proposal"); // negotiation → back to proposal
    expect(moveStage("L6", "lost").status).toBe("lost");
  });

  it("rejects an invalid stage", () => {
    expect(() => moveStage("L1", "nonsense")).toThrow();
    expect(() => moveStage("NOPE", "costing")).toThrow();
  });

  it("creates a new lead in the enquiry stage", () => {
    const lead = createLead({ client: "Acme Corp", desc: "Test warehouse — 5000 sqft", lt: "Hot", type: "B2B" });
    expect(lead.status).toBe("enquiry");
    expect(lead.ch).toBe(55); // Hot → 55%
    expect(lead.id).toBe("L13");
    expect(lead.ref).toBe("DCL/013");
    expect(getBizDev().leads.some((l) => l.id === "L13")).toBe(true);
  });
});
