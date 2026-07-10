import { describe, expect, it } from "vitest";
import { getActiveRC, getRCsForVendor } from "./rate-contracts";
import { getLeadTimeBucket } from "./lead-time";
import { approverFor, approverRoleFor } from "./approvals";
import { getVendorPerformance } from "./vendors";
import { PROC_RATE_CONTRACTS } from "@/features/procurement/data/rate-contracts";
import { PROC_TEAM } from "@/features/procurement/data/workflow";
import { PROC_POS } from "@/features/procurement/data/purchase-orders";
import { PROC_GRN } from "@/features/procurement/data/grn";

describe("getActiveRC", () => {
  it("finds an active contract for a material", () => {
    expect(getActiveRC(PROC_RATE_CONTRACTS, "SS-M-101")?.id).toBe("RC-2026-001");
  });
  it("ignores expired contracts", () => {
    // SS-M-102's only RC (RC-2025-007) is expired
    expect(getActiveRC(PROC_RATE_CONTRACTS, "SS-M-102")).toBeNull();
  });
  it("optionally scopes to a vendor", () => {
    expect(getActiveRC(PROC_RATE_CONTRACTS, "SS-M-101", "MVDR056")).toBeNull();
    expect(getActiveRC(PROC_RATE_CONTRACTS, "SS-M-101", "MVDR052")?.id).toBe("RC-2026-001");
  });
  it("lists all contracts for a vendor", () => {
    expect(getRCsForVendor(PROC_RATE_CONTRACTS, "MVDR052").map((r) => r.id)).toEqual(["RC-2026-001"]);
  });
});

describe("getLeadTimeBucket", () => {
  it("buckets by day thresholds", () => {
    expect(getLeadTimeBucket(3)).toBe("fast");
    expect(getLeadTimeBucket(5)).toBe("fast");
    expect(getLeadTimeBucket(8)).toBe("medium");
    expect(getLeadTimeBucket(14)).toBe("slow");
    expect(getLeadTimeBucket(null)).toBe("unknown");
  });
});

describe("approverRoleFor", () => {
  it("routes by value threshold", () => {
    expect(approverRoleFor(400000)).toBe("manager");
    expect(approverRoleFor(500000)).toBe("manager");
    expect(approverRoleFor(1500000)).toBe("coo");
    expect(approverRoleFor(9000000)).toBe("ceo");
  });
  it("resolves the approver record", () => {
    expect(approverFor(PROC_TEAM, 3000000).name).toBe("Shreeram");
    expect(approverFor(PROC_TEAM, 100000).name).toBe("Aarumugam");
  });
});

describe("getVendorPerformance", () => {
  it("summarises POs + delivery for an active vendor", () => {
    const perf = getVendorPerformance("MVDR052", PROC_POS, PROC_GRN);
    // Aahir: 4 POs in the SP1 seed (SS-M-101, 106, 107 + none else)
    expect(perf.poCount).toBeGreaterThan(0);
    expect(perf.totalSpend).toBeGreaterThan(0);
    expect(perf.onTimePct).not.toBeNull();
  });
  it("returns an empty scorecard for a vendor with no POs", () => {
    const perf = getVendorPerformance("MVDR999", PROC_POS, PROC_GRN);
    expect(perf.poCount).toBe(0);
    expect(perf.onTimePct).toBeNull();
  });
});
