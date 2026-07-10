import { describe, expect, it } from "vitest";
import { getSubcontracts } from "@/features/subcontracts/server/repository";
import {
  scApprover,
  scBillCalc,
  scLifecycleStage,
  scNextRaWeek,
  scPackagesFor,
} from "@/features/subcontracts/domain";

describe("getSubcontracts (P1.SP1) — signed scope", () => {
  const view = getSubcontracts("P1", "SP1");

  it("is a signed kickoff with 12 packages (8 labour · 4 composite)", () => {
    expect(view.signed).toBe(true);
    expect(view.packages.total).toBe(12);
    expect(view.packages.counts).toEqual({ all: 12, manpower: 8, lineitem: 4, machinery: 0 });
  });

  it("splits enquiries into open / closed / need-action", () => {
    expect(view.enquiries.open).toHaveLength(6); // no WO yet
    expect(view.enquiries.closed).toHaveLength(4); // WO raised → closed
    expect(view.enquiries.needAction).toHaveLength(2); // FN-4001, EL-2001 un-sourced
  });

  it("rolls up the work-order register + KPIs", () => {
    expect(view.workOrders.rows).toHaveLength(4);
    expect(view.workOrders.kpis.raised).toBe(4);
    expect(view.workOrders.kpis.released).toBe(4);
    expect(view.workOrders.kpis.pendingApproval).toBe(0);
    expect(view.workOrders.kpis.raStarted).toBe(4);
    expect(view.workOrders.kpis.variations).toBe(1); // EL-1001 has a variation order
    expect(view.workOrders.kpis.totalValue).toBe(1316725);
  });

  it("derives the weekly measurement cycle", () => {
    expect(view.measurement.cards).toHaveLength(4);
    expect(view.measurement.raisedWeeks).toEqual([6, 7]);
    expect(view.measurement.nextWeek).toBe(8);
  });

  it("groups RA bills + surfaces the awaiting-claim queue", () => {
    expect(view.bills.kpis.raBills).toBe(4);
    expect(view.bills.kpis.forwarded).toBe(2);
    expect(view.bills.kpis.held).toBe(0);
    expect(view.bills.kpis.totalGross).toBe(360840);
    // WC-1001 (MSC-003) is certified in RA-07 but has no recorded bill yet.
    expect(view.bills.kpis.awaitingClaim).toBe(1);
    expect(view.bills.awaiting[0]?.sub).toBe("MSC-003");
    expect(view.bills.awaiting[0]?.week).toBe(7);
    // HQ bill-status view groups the 4 scoped bills under 2 subbies.
    expect(view.billStatus).toHaveLength(2);
  });

  it("builds the subcontractor coverage + compliance rollup", () => {
    expect(view.subbies.orphanTrades).toEqual([]);
    expect(view.subbies.newly).toHaveLength(2); // MSC-005, MSC-023 onboarding
    expect(view.subbies.multiTrade).toBe(7);
    // 3 active subbies carry a compliance flag (ESI lapsed).
    const compliance = view.kpis.find((c) => c.label === "Compliance");
    expect(compliance?.value).toBe("3");
  });

  it("threads the approval-workflow tracker", () => {
    const [enq, l1, wo, approved, mobilised] = view.workflow.nodes;
    expect(enq?.done).toBe(10);
    expect(l1?.done).toBe(9);
    expect(wo?.done).toBe(4);
    expect(approved?.done).toBe(4);
    expect(mobilised?.done).toBe(4);
    expect(view.workflow.prompts).toHaveLength(0); // nothing pending approval
  });

  it("exposes the metric-strip headline (12 packages · 4 WOs)", () => {
    expect(view.kpis[0]?.value).toBe("12");
    expect(view.kpis[2]?.value).toBe("4/12");
  });
});

describe("unsigned scopes carry no packages", () => {
  it("P1.SP2 kickoff is not signed off", () => {
    const view = getSubcontracts("P1", "SP2");
    expect(view.signed).toBe(false);
    expect(view.packages.total).toBe(0);
    expect(scPackagesFor("P1", "SP2")).toHaveLength(0);
  });

  it("non-cabinized projects are unsigned", () => {
    expect(getSubcontracts("P2", "SP1").signed).toBe(false);
  });
});

describe("pure domain helpers", () => {
  it("scBillCalc applies retention → +GST −TDS → net", () => {
    const c = scBillCalc({ gross: 113600, retentionPct: 5, gstPct: 18, tdsPct: 1 });
    expect(c.retention).toBe(5680);
    expect(c.taxable).toBe(107920);
    expect(c.net).toBe(126267);
  });

  it("scApprover routes by value band", () => {
    expect(scApprover(400000).who).toBe("Aarumugam");
    expect(scApprover(600000).who).toBe("Gobinath");
    expect(scApprover(3000000).who).toBe("Shreeram R");
  });

  it("scLifecycleStage derives per-package stage", () => {
    expect(scLifecycleStage("P1.SP1.SS-1001")).toBe("bill"); // billed
    expect(scLifecycleStage("P1.SP1.WC-1001")).toBe("measuring"); // WO + RA, no bill
    expect(scLifecycleStage("P1.SP1.FN-4002")).toBe("l1"); // L1 picked, no WO
    expect(scLifecycleStage("P1.SP1.PL-5001")).toBe("compare"); // quotes, no L1
    expect(scLifecycleStage("P1.SP1.FN-4001")).toBe("none"); // un-sourced
  });

  it("scNextRaWeek advances past the latest certified RA", () => {
    expect(scNextRaWeek("P1.SP1")).toBe(8);
  });
});
