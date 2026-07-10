import { describe, expect, it } from "vitest";
import { getSettings } from "@/features/settings/server/repository";

describe("getSettings", () => {
  const s = getSettings();
  it("returns all settings collections", () => {
    expect(s.users.length).toBeGreaterThan(0);
    expect(s.roles.length).toBeGreaterThan(0);
    expect(s.approvals.length).toBeGreaterThan(0);
    expect(s.integrations.length).toBeGreaterThan(0);
    expect(s.depts.length).toBeGreaterThanOrEqual(9);
    expect(s.permLevels.length).toBe(4);
  });
  it("derives KPI counts", () => {
    expect(s.kpis.activeUsers).toBe(s.users.filter((u) => u.status === "active").length);
    expect(s.kpis.totalRoles).toBe(s.roles.length);
    expect(s.kpis.connectedIntegrations).toBe(s.integrations.filter((i) => i.status === "connected").length);
    expect(s.kpis.approvalModules).toBe(new Set(s.approvals.map((a) => a.module)).size);
  });
});
