import { describe, expect, it } from "vitest";
import { getOps } from "@/features/ops/server/repository";

describe("ops repository", () => {
  const ops = getOps("P1", "SP1");

  it("builds the ops payload for P1.SP1", () => {
    expect(ops.scope).toBe("P1.SP1");
    expect(ops.units).toBeGreaterThan(0);
    expect(ops.scopeLines.length).toBeGreaterThan(0);
  });

  it("derives progress KPIs within bounds", () => {
    expect(ops.kpis.progressPct).toBeGreaterThanOrEqual(0);
    expect(ops.kpis.progressPct).toBeLessThanOrEqual(100);
    expect(ops.kpis.done).toBeLessThanOrEqual(ops.kpis.plan + 1e-6);
    expect(ops.kpis.totalLines).toBe(ops.scopeLines.length);
  });

  it("each scope line's percentage is bounded", () => {
    for (const line of ops.scopeLines) {
      expect(line.pct).toBeGreaterThanOrEqual(0);
      expect(line.pct).toBeLessThanOrEqual(100);
    }
  });
});
