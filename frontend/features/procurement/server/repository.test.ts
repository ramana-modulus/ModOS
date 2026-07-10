import { beforeEach, describe, expect, it } from "vitest";
import {
  generatePO,
  getBom,
  getPos,
  recordGrn,
  resetProcurementStore,
  selectL1,
} from "./repository";

beforeEach(() => resetProcurementStore());

describe("getBom (P1.SP1)", () => {
  it("aggregates the sub-project BOM and its KPI summary", () => {
    const { rows, summary } = getBom("P1", "SP1");
    expect(rows).toHaveLength(14);
    expect(summary.totalItems).toBe(14);
    expect(summary.posRaised).toBe(7);
    expect(summary.withQuotes).toBe(8);
    expect(summary.l1Selected).toBe(7);
    expect(summary.rcCovered).toBe(3);
    expect(summary.apPending).toBe(1);
    expect(summary.apForwardedValue).toBe(2691);
  });

  it("derives per-line lifecycle status", () => {
    const { rows } = getBom("P1", "SP1");
    const byCode = new Map(rows.map((r) => [r.code, r]));
    expect(byCode.get("SS-M-101")?.status).toBe("po_raised"); // 22000/38000 partial
    expect(byCode.get("SS-M-103")?.status).toBe("delivered"); // 120/120
    expect(byCode.get("FN-M-402")?.status).toBe("rfq_needed"); // no quotes
  });
});

describe("getPos", () => {
  it("returns every PO with its approver routing", () => {
    const pos = getPos("P1", "SP1");
    expect(pos).toHaveLength(7);
    const steel = pos.find((p) => p.code === "SS-M-101");
    // 38000 × ₹67 = ₹25.46L → COO band (₹5L–₹25L)... > ₹25L → CEO
    expect(steel?.approverRole).toBe("ceo");
  });
});

describe("selectL1", () => {
  it("moves the L1 flag to the chosen quote", () => {
    const quotes = selectL1("P1.SP1.SS-M-102", "Q005");
    expect(quotes.find((q) => q.id === "Q005")?.selected).toBe(true);
    expect(quotes.find((q) => q.id === "Q004")?.selected).toBe(false);
  });

  it("rejects an unknown quote", () => {
    expect(() => selectL1("P1.SP1.SS-M-102", "NOPE")).toThrow();
  });
});

describe("generatePO", () => {
  it("raises a PO from a selected quote at the rate-contract rate", () => {
    selectL1("P1.SP1.FN-M-401", "Q013");
    const po = generatePO("P1", "SP1", "P1.SP1.FN-M-401");
    expect(po.vendor).toBe("Aakruti Enterprises");
    expect(po.rate).toBe(1450); // RC-2026-002 covers FN-M-401
    expect(po.value).toBeCloseTo(1450 * 2.1);
    expect(getPos("P1", "SP1")).toHaveLength(8);
  });

  it("is idempotent when a PO already exists", () => {
    const existing = generatePO("P1", "SP1", "P1.SP1.SS-M-101");
    expect(existing.poNumber).toBe("MH-PO-26-001");
  });
});

describe("recordGrn", () => {
  it("appends a receipt and completes the PO", () => {
    const grn = recordGrn("P1.SP1.SS-M-105", 100, "Vinod K");
    expect(grn.qtyReceived).toBe(100);
    const { summary, rows } = getBom("P1", "SP1");
    expect(summary.posFullGRN).toBe(3); // SS-M-103, SS-M-107 + newly-completed SS-M-105
    expect(rows.find((r) => r.code === "SS-M-105")?.status).toBe("delivered");
  });
});
