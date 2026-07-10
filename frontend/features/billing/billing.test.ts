import { describe, expect, it } from "vitest";
import { getBilling, listProjects } from "@/features/billing/server/repository";

describe("billing repository", () => {
  it("lists projects", () => {
    expect(listProjects().length).toBeGreaterThan(0);
  });

  it("builds the billing view for P1.SP1", () => {
    const v = getBilling("P1", "SP1");
    expect(v.scope).toBe("P1.SP1");
    expect(v.units).toBeGreaterThan(0);
    expect(v.measurement.length).toBeGreaterThan(0);
    // KPIs are internally consistent
    expect(v.kpis).toBeTruthy();
    expect(v.measurementPending).toBeGreaterThanOrEqual(0);
    expect(v.measurementFlagged).toBeGreaterThanOrEqual(0);
  });

  it("exposes the client RA + register views", () => {
    const v = getBilling("P1", "SP1");
    expect(Array.isArray(v.raClient)).toBe(true);
    expect(Array.isArray(v.vendorBills)).toBe(true);
    expect(v.register).toBeTruthy();
  });
});
