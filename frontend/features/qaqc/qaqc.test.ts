import { describe, it, expect } from "vitest";
import { getQAQC } from "@/features/qaqc/server/repository";
import {
  cabinEffStatus,
  cabinRollup,
  hpReleaseState,
  inspCabinLabel,
  ncrBucket,
  seedCabinQc,
} from "@/features/qaqc/domain";
import type { CabinStatus, Inspection, Ncr } from "@/features/qaqc/types";

describe("getQAQC repository — derived KPIs (P1.SP1)", () => {
  const view = getQAQC("P1", "SP1");

  it("counts inspections by status", () => {
    expect(view.kpis.inspections).toBe(14);
    expect(view.kpis.passed).toBe(10);
    expect(view.kpis.partial).toBe(2);
    expect(view.kpis.failed).toBe(1);
    expect(view.kpis.pending).toBe(1);
  });

  it("counts open NCRs and their severity", () => {
    expect(view.kpis.openNCR).toBe(1); // NCR-007 is action_taken (not closed)
    expect(view.kpis.majorCritical).toBe(1);
  });

  it("classifies third-party tests", () => {
    expect(view.kpis.tptTotal).toBe(4);
    expect(view.kpis.tptPassed).toBe(2);
    expect(view.kpis.tptPending).toBe(2);
    expect(view.kpis.tptFailed).toBe(0);
  });

  it("derives ITP scope + hold points", () => {
    expect(view.kpis.itpsInScope).toBe(16);
    expect(view.kpis.holdPoints).toBe(8);
  });

  it("surfaces exactly one hold point awaiting release", () => {
    // WIR-03-007 (SS-1004 / ITP-004) passed but not yet released; the back-filled
    // IMIRs and WIR-004 carry a historical release, so they don't count.
    expect(view.kpis.hpAwaiting).toBe(1);
    const awaiting = view.inspections.filter((i) => i.hpState === "awaiting_release");
    expect(awaiting.map((i) => i.id)).toEqual(["WIR-03-007"]);
  });

  it("back-fills a historical release onto seeded hold points", () => {
    const imir = view.inspections.find((i) => i.id === "IMIR-009");
    expect(imir?.hpState).toBe("released");
    expect(imir?.hpRelease?.by).toBe("Karthik (QA Engg.)");
  });
});

describe("getQAQC repository — cabin sign-off (59 units)", () => {
  const view = getQAQC("P1", "SP1");

  it("rolls up seeded cabin statuses", () => {
    expect(view.cabin.units).toBe(59);
    expect(view.cabin.rollup).toEqual({ cleared: 28, ncr: 1, inprog: 1, pending: 29 });
  });

  it("derives 'hold' for a cleared cabin carrying an open line NCR", () => {
    const cabin3 = view.cabin.cabins.find((c) => c.cabin === 3);
    expect(cabin3?.status).toBe("pass"); // raw checklist result
    expect(cabin3?.eff).toBe("hold"); // NCR-007 (cabin 3, major, open) downgrades it
  });
});

describe("domain helpers", () => {
  it("classifies NCR workflow buckets", () => {
    const mk = (status: Ncr["status"]): Ncr => ({ id: "x", raisedAt: "", raisedBy: "", forCode: "C", defect: "", severity: "major", status });
    expect(ncrBucket(mk("open"))).toBe("awaiting");
    expect(ncrBucket(mk("action_taken"))).toBe("rework");
    expect(ncrBucket(mk("closed"))).toBe("cleared");
  });

  it("formats cabin labels (single, contiguous range, scatter, site-wide)", () => {
    const base = { type: "WIR" } as Inspection;
    expect(inspCabinLabel({ ...base, cabins: [3] })).toBe("Cabin 03");
    expect(inspCabinLabel({ ...base, cabins: [1, 2, 3, 4, 5, 6, 7, 8] })).toBe("Cabins 01–08");
    expect(inspCabinLabel({ ...base, cabins: [1, 3, 9] })).toBe("3 cabins");
    expect(inspCabinLabel({ type: "IMIR" } as Inspection)).toBe("Site-wide");
  });

  it("derives hold-point release state from inspection status", () => {
    expect(hpReleaseState({ status: "pending" } as Inspection)).toBe("awaiting_inspection");
    expect(hpReleaseState({ status: "failed" } as Inspection)).toBe("held");
    expect(hpReleaseState({ status: "passed" } as Inspection)).toBe("awaiting_release");
    expect(hpReleaseState({ status: "passed", hpRelease: { status: "released" } } as Inspection)).toBe("released");
  });

  it("seeds and rolls up an arbitrary cabin count", () => {
    const cabins = seedCabinQc(31, ["a", "b", "c"]);
    expect(cabinRollup(cabins)).toEqual({ cleared: 28, ncr: 1, inprog: 1, pending: 1 });
  });

  it("keeps a cabin cleared when no NCR pins it", () => {
    const cabin: CabinStatus = { cabin: 7, status: "pass", checks: {} };
    expect(cabinEffStatus(cabin, [])).toBe("pass");
  });
});
