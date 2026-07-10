import { describe, it, expect } from "vitest";
import { getContracts } from "@/features/contracts/server/repository";
import {
  CONTRACT_EMD,
  CONTRACT_FIN_INSTRUMENTS,
  CONTRACT_OBLIGATIONS,
  CONTRACT_PROJECT_DOCS,
  CONTRACT_SUBMITTALS,
  RFIS,
} from "@/features/contracts/data";
import {
  activeInstrumentCount,
  bidGates,
  docsUploadedCount,
  financeDocsReceived,
  isCostingReceived,
  isHighValue,
  obligationsAtRisk,
  openRfiCount,
  stageLabel,
  submittalReadyCount,
  tenderMetrics,
} from "@/features/contracts/domain";
import type { ContractTender } from "@/features/contracts/types";

describe("contracts repository", () => {
  const payload = getContracts();

  it("derives top-level KPI counts from the seed stores", () => {
    expect(payload.kpis.tenders).toBe(4);
    expect(payload.kpis.openRfis).toBe(2); // RFI-003 (L9) + RFI-004 (L8)
    expect(payload.kpis.awardedProjects).toBe(4);
    expect(payload.kpis.openDisputes).toBe(1); // ARB-001 on P1
  });

  it("maps B2G lead costing status from the shared LEADS store", () => {
    expect(payload.leadCosting.L9).toBe(true); // costingSubmitted:true
    expect(payload.leadCosting.L8).toBe(false);
  });
});

describe("contracts domain helpers", () => {
  it("counts ready submittals for a tender", () => {
    expect(submittalReadyCount(CONTRACT_SUBMITTALS.L9!)).toBe(7);
    expect(submittalReadyCount(CONTRACT_SUBMITTALS.L10!)).toBe(7);
  });

  it("counts open RFIs scoped to a tender", () => {
    expect(openRfiCount(RFIS, "L9")).toBe(1);
    expect(openRfiCount(RFIS, "L8")).toBe(1);
    expect(openRfiCount(RFIS, "L10")).toBe(0);
  });

  it("derives post-sales counts for P1", () => {
    expect(docsUploadedCount(CONTRACT_PROJECT_DOCS.P1!)).toBe(4);
    expect(activeInstrumentCount(CONTRACT_FIN_INSTRUMENTS.P1!)).toBe(3);
    expect(obligationsAtRisk(CONTRACT_OBLIGATIONS.P1!)).toBe(1);
  });

  it("flags CEO sign-off only for high-value contracts", () => {
    expect(isHighValue(32_000_000)).toBe(true);
    expect(isHighValue(4_000_000)).toBe(false);
  });

  it("requires both EMD and tender fee paid for finance-docs gate", () => {
    expect(financeDocsReceived(CONTRACT_EMD.L9)).toBe(false); // emd requested, fee paid
    expect(financeDocsReceived(CONTRACT_EMD.L10)).toBe(true); // both paid
    expect(financeDocsReceived(undefined)).toBe(false);
  });

  it("evaluates bid submission gates", () => {
    const gates = bidGates(CONTRACT_SUBMITTALS.L9!, CONTRACT_EMD.L9, false);
    expect(gates.subsTotal).toBe(12);
    expect(gates.subsCount).toBe(7);
    expect(gates.subsReady).toBe(false);
    expect(gates.finOk).toBe(false);
    expect(gates.canSubmit).toBe(false);
  });

  it("reports costing-received from the lead-costing map", () => {
    const map = { L9: true, L8: false };
    expect(isCostingReceived("L9", map)).toBe(true);
    expect(isCostingReceived("L8", map)).toBe(false);
    expect(isCostingReceived("LX", map)).toBe(false);
  });

  it("builds the pre-sales metric strip cells", () => {
    const t: ContractTender = {
      dealId: "L9",
      portal: "Palladium",
      portalRef: "NLC/2026/CABIN/040",
      client: "Neyveli Lignite Corporation",
      title: "4 Nos Portable Steel Cabins",
      issued: "25 Feb 2026",
      preBid: "10 Mar 2026",
      dueDate: "20 May 2026",
      emdAmt: 250000,
      tenderFee: 11800,
      estValue: 32000000,
      financialOk: true,
      technicalOk: true,
      stage: "bid_prep",
      owner: "visvaprasad",
    };
    const cells = tenderMetrics(t, CONTRACT_SUBMITTALS.L9!, RFIS, CONTRACT_EMD.L9);
    expect(cells).toHaveLength(6);
    expect(cells[0]!.v).toBe(stageLabel("bid_prep")); // "Bid Prep"
    expect(cells[2]!.v).toBe("7/12"); // submittals ready/total
    expect(cells[3]!.v).toBe("1"); // open RFIs
  });
});
