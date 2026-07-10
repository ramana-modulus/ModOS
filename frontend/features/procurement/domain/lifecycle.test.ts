import { describe, expect, it } from "vitest";
import type { Grn, Invoice, PurchaseOrder, Quote } from "@/types/procurement";
import { bomLineStatus, computeSummary, poDerivedStatus, poReceivedQty } from "./lifecycle";
import type { BomRow } from "@/types/procurement";

const po = (over: Partial<PurchaseOrder> = {}): PurchaseOrder => ({
  poNumber: "MH-PO-26-999",
  vCode: "V",
  vendor: "V",
  qty: 100,
  uom: "kg",
  rate: 10,
  value: 1000,
  status: "approved",
  poDate: "01 May 2026",
  expDelivery: "10 May 2026",
  zohoRef: null,
  deliveredQty: 0,
  note: "",
  ...over,
});

const grn = (qty: number): Grn => ({
  grnId: "G",
  poNumber: "P",
  date: "d",
  qtyReceived: qty,
  condition: "good",
  receivedBy: "x",
  batchNos: [],
  rejectedQty: 0,
  note: "",
});

describe("poReceivedQty", () => {
  it("sums GRN receipts", () => {
    expect(poReceivedQty([grn(200), grn(100)])).toBe(300);
    expect(poReceivedQty(undefined)).toBe(0);
  });
});

describe("poDerivedStatus", () => {
  it("is delivered once receipts cover the order", () => {
    expect(poDerivedStatus(po({ qty: 100 }), 100, true)).toBe("delivered");
  });
  it("is partial for a part delivery", () => {
    expect(poDerivedStatus(po({ qty: 100 }), 40, true)).toBe("partial_delivery");
  });
  it("is sent_to_zoho when pushed but undelivered", () => {
    expect(poDerivedStatus(po({ zohoRef: "ZB-1" }), 0, true)).toBe("sent_to_zoho");
  });
  it("is approved when internally approved but not pushed", () => {
    expect(poDerivedStatus(po(), 0, true)).toBe("approved");
    expect(poDerivedStatus(po(), 0, false)).toBe("draft");
  });
});

describe("bomLineStatus", () => {
  const q = (selected: boolean): Quote => ({
    id: "Q",
    vCode: "V",
    vendor: "V",
    rate: 10,
    qty: 100,
    leadTime: 5,
    file: "",
    date: "",
    l: 1,
    selected,
    note: "",
  });

  it("walks the lifecycle from rfq_needed to delivered", () => {
    expect(bomLineStatus({ po: null, receivedQty: 0, quotes: [], rfq: null })).toBe("rfq_needed");
    expect(bomLineStatus({ po: null, receivedQty: 0, quotes: [q(false)], rfq: null })).toBe("quotes_open");
    expect(bomLineStatus({ po: null, receivedQty: 0, quotes: [q(true)], rfq: null })).toBe("l1_selected");
    expect(bomLineStatus({ po: po({ qty: 100 }), receivedQty: 40, quotes: [q(true)], rfq: null })).toBe("po_raised");
    expect(bomLineStatus({ po: po({ qty: 100 }), receivedQty: 100, quotes: [q(true)], rfq: null })).toBe("delivered");
  });
});

describe("computeSummary", () => {
  const baseRow = (over: Partial<BomRow>): BomRow =>
    ({
      code: "X",
      name: "X",
      uom: "kg",
      rate: 10,
      totalQty: 100,
      cat: "C",
      sourceBOQs: [],
      sources: [],
      basis: "lot",
      units: 1,
      key: "P1.SP1.X",
      status: "rfq_needed",
      rfq: null,
      quoteCount: 0,
      l1: null,
      po: null,
      receivedQty: 0,
      activeRC: null,
      leadBucket: "unknown",
      committedValue: 0,
      ...over,
    }) as BomRow;

  it("aggregates counts, committed value, GRN split and AP", () => {
    const rows: BomRow[] = [
      baseRow({ quoteCount: 2, l1: {} as Quote, po: po({ qty: 100, value: 1000 }), receivedQty: 100, committedValue: 1000, activeRC: {} as never }),
      baseRow({ quoteCount: 2, l1: {} as Quote, po: po({ qty: 100, value: 500 }), receivedQty: 40, committedValue: 500 }),
      baseRow({ quoteCount: 1 }),
    ];
    const invoices: Invoice[] = [
      { status: "discrepancy", netPayable: 5, invId: "1" } as Invoice,
      { status: "forwarded_to_finance", netPayable: 2691, invId: "2" } as Invoice,
    ];
    const s = computeSummary(rows, invoices);
    expect(s.totalItems).toBe(3);
    expect(s.withQuotes).toBe(3);
    expect(s.l1Selected).toBe(2);
    expect(s.posRaised).toBe(2);
    expect(s.committedValue).toBe(1500);
    expect(s.posFullGRN).toBe(1);
    expect(s.posPartialGRN).toBe(1);
    expect(s.rcCovered).toBe(1);
    expect(s.apPending).toBe(1);
    expect(s.apForwardedValue).toBe(2691);
  });
});
