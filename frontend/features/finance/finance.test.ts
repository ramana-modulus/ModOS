import { describe, expect, it } from "vitest";
import { financeApUnified, scBillCalc } from "@/features/finance/domain";
import { getFinance, listFinProjects } from "@/features/finance/server/repository";
import {
  SC_BILLS,
  SC_SUBBIES,
  SC_WORKORDERS,
  BILL_VENDOR,
} from "@/features/finance/data";
import { PROC_INVOICES } from "@/features/procurement/data";

const apStores = {
  procInvoices: PROC_INVOICES,
  billVendor: BILL_VENDOR,
  scBills: SC_BILLS,
  scSubbies: SC_SUBBIES,
  scWorkOrders: SC_WORKORDERS,
};

describe("scBillCalc — SC bill money math", () => {
  it("nets gross → −retention → +GST −TDS", () => {
    // MSC-001~RA6: gross 113600, 5% retention, 18% GST, 1% TDS
    const b = SC_BILLS["P1.SP1.MSC-001~RA6"]!;
    const c = scBillCalc(b);
    expect(c.retention).toBe(5680);
    expect(c.taxable).toBe(107920);
    expect(c.gst).toBe(19426);
    expect(c.tds).toBe(1079);
    expect(c.net).toBe(126267);
  });
});

describe("financeApUnified — the one AP queue", () => {
  const feed = financeApUnified("P1.SP1", apStores);

  it("merges material (PROC_INVOICES), vendor (BILL_VENDOR) and subcontractor (SC_BILLS) bills", () => {
    expect(feed.some((b) => b.src === "material")).toBe(true);
    expect(feed.some((b) => b.src === "vendor")).toBe(true);
    expect(feed.some((b) => b.src === "sc")).toBe(true);
  });

  it("bridges material invoices from the procurement spine with the mapped PO ref", () => {
    const mat = feed.find((b) => b.id === "INV-IHR-2026-058")!;
    expect(mat.bridgedFromProc).toBe(true);
    expect(mat.poRef).toBe("MH-PO-26-002");
    expect(mat.status).toBe("sent_to_finance");
  });

  it("normalizes forwarded SC bills to sent_to_finance with the net payable", () => {
    const sc = feed.find((b) => b.id === "SCB/MSC-001/RA06")!;
    expect(sc.status).toBe("sent_to_finance");
    expect(sc.netPayable).toBe(126267);
    expect(sc.poRef).toBe("MH/WO/2026/0041");
  });
});

describe("getFinance — AP view", () => {
  const { ap } = getFinance("P1", "SP1");

  it("inbox holds only forwarded bills not yet in a payment run (the two RA-6 SC bills)", () => {
    const ids = ap.inbox.map((b) => b.id).sort();
    expect(ids).toEqual(["SCB/MSC-001/RA06", "SCB/MSC-002/RA06"]);
    expect(ap.inboxCount).toBe(2);
  });

  it("classifies payment runs and resolves their scoped bill lines", () => {
    expect(ap.scheduledRuns.map((r) => r.id)).toEqual(["PR-2026-21"]);
    expect(ap.executedRuns.map((r) => r.id).sort()).toEqual(["PR-2026-19", "PR-2026-20"]);
    const scheduled = ap.scheduledRuns[0]!;
    expect(scheduled.bankName).toContain("HDFC");
    expect(scheduled.bills.map((b) => b.id)).toContain("INV-IHR-2026-058");
  });
});

describe("getFinance — treasury KPIs", () => {
  const { kpis } = getFinance("P1", "SP1");

  it("sums bank balances and unused working capital", () => {
    expect(kpis.totalBank).toBe(8525400 + 3250000);
    expect(kpis.bankCount).toBe(2);
    expect(kpis.wcAvailable).toBe(15000000);
  });

  it("reads AP inbox / AR outstanding KPIs from the legacy scoped stores (both empty for P1.SP1)", () => {
    // BILL_VENDOR[P1.SP1] = paid + received (none sent_to_finance); BILL_CLIENT = paid + draft
    expect(kpis.apInboxCount).toBe(0);
    expect(kpis.apInboxValue).toBe(0);
    expect(kpis.arOutstandingCount).toBe(0);
  });
});

describe("getFinance — AR view", () => {
  it("reconciles the seeded client receipt for the scope", () => {
    const { ar } = getFinance("P1", "SP1");
    expect(ar.reconciledCount).toBe(1);
    const rct = ar.reconciled[0]!;
    expect(rct.id).toBe("RCT-001");
    expect(rct.amount).toBe(4259800);
    expect(rct.clientBillRef).toBe("RA-1");
    expect(ar.outstanding).toHaveLength(0);
  });
});

describe("getFinance — cashflow forecast", () => {
  const { cashflow } = getFinance("P1", "SP1");

  it("opens at total bank balance and produces 4 weekly buckets", () => {
    expect(cashflow.openingBalance).toBe(11775400);
    expect(cashflow.weeks).toHaveLength(4);
    expect(cashflow.weeks[0]!.isCurrent).toBe(true);
    expect(cashflow.totalLiquidity).toBe(11775400 + 15000000);
  });

  it("carries the recurring site-cost burn into every week (labour + overhead)", () => {
    for (const wk of cashflow.weeks) {
      expect(wk.outLabour).toBe(280000);
      expect(wk.outOverhead).toBe(65000);
    }
  });

  it("threads a running projected balance across weeks", () => {
    const w = cashflow.weeks;
    expect(w[1]!.projectedBalance).toBeCloseTo(w[0]!.projectedBalance + w[1]!.net, 0);
  });
});

describe("getFinance — P&L view", () => {
  it("derives receivable, margin delta and profit sign for P1.SP1", () => {
    const { pnl } = getFinance("P1", "SP1");
    expect(pnl.present).toBe(true);
    expect(pnl.projectedProfit).toBe(4600000);
    expect(pnl.receivable).toBe(0); // invoiced 4259800 − received 4259800
    expect(pnl.timePct).toBe(44); // 53 of 120 days
    expect(pnl.profitDelta).toBeCloseTo(pnl.projectedMarginPct - pnl.budgetedMarginPct, 5);
    expect(pnl.profitPositive).toBe(false); // 13.1% proj < 14.5% budget
  });

  it("reports absent P&L for a sub-project with no snapshot", () => {
    const { pnl } = getFinance("P3", "SP1");
    expect(pnl.present).toBe(false);
  });
});

describe("listFinProjects", () => {
  it("exposes every project with at least one sub-project", () => {
    const projects = listFinProjects();
    expect(projects.find((p) => p.id === "P1")!.subProjects).toHaveLength(2);
    for (const p of projects) expect(p.subProjects.length).toBeGreaterThan(0);
  });
});
