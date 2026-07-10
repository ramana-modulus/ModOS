import { describe, expect, it } from "vitest";
import {
  approvalQueueCounts,
  buildBomLineView,
  ensureBoqVersioning,
  getStageSummary,
  groupBomByCategory,
  migrateDrawings,
  variancePct,
} from "@/features/engineering/domain";
import { getEngineering } from "@/features/engineering/server/repository";
import { ENG_DRAWING_LIST } from "@/features/engineering/data/drawings";
import { BOM_RFCS, BOM_RFIS } from "@/features/engineering/data/rfi-rfc";
import { ENG_BOM } from "@/features/procurement/data/eng-bom";

describe("variance maths", () => {
  it("computes signed qty variance vs BOQ", () => {
    // SS-1001: BOQ 36000 → Eng 38400 = +6.67%
    expect(variancePct(36000, 38400)!).toBeCloseTo(6.667, 2);
    // SS-1004: BOQ 350 → Eng 380 = +8.57%
    expect(variancePct(350, 380)!).toBeCloseTo(8.571, 2);
    // on-target line
    expect(variancePct(25, 25)).toBe(0);
    // missing qty guards to null
    expect(variancePct(0, 10)).toBeNull();
  });
});

describe("BOQ version migration (ensureBoqVersioning)", () => {
  it("gives approved lines a v1 with a reviewed/approved history entry", () => {
    const { engVersion, engVersionHistory } = ensureBoqVersioning({ engStatus: "approved" } as never);
    expect(engVersion).toBe("v1");
    expect(engVersionHistory[0]!.decision).toBe("approved");
  });
  it("gives rework lines a rejected history entry", () => {
    const { engVersionHistory } = ensureBoqVersioning({ engStatus: "rework" } as never);
    expect(engVersionHistory[0]!.decision).toBe("rejected");
  });
  it("leaves pending lines without a version", () => {
    expect(ensureBoqVersioning({ engStatus: "pending" } as never).engVersion).toBeNull();
  });
});

describe("BOM category grouping + variance rollups", () => {
  const lines = (ENG_BOM["P1.SP1"] ?? []).map((l) => buildBomLineView(l, "P1.SP1", BOM_RFIS, BOM_RFCS));
  const groups = groupBomByCategory(lines);

  it("preserves first-appearance category order", () => {
    expect(groups[0]!.cat).toBe("Superstructure");
  });
  it("counts approved lines per category", () => {
    const ss = groups.find((g) => g.cat === "Superstructure")!;
    // SS-1001, SS-1004, SS-2001 are all approved
    expect(ss.approvedCount).toBe(3);
    expect(ss.items.length).toBe(3);
  });
  it("surfaces open RFI/RFC counts on the line view", () => {
    const ss1004 = lines.find((l) => l.code === "SS-1004")!;
    expect(ss1004.openRfi).toBe(1); // RFI-002
  });
});

describe("drawing migration + stage summaries", () => {
  const drawings = migrateDrawings(ENG_DRAWING_LIST["P1.SP1"] ?? []);

  it("migrates every drawing to a drwStatus", () => {
    expect(drawings.every((d) => typeof d.drwStatus === "string")).toBe(true);
  });
  it("maps legacy 'approved' → approved and 'in_review' → in_approval", () => {
    expect(drawings.find((d) => d.id === "D001")!.drwStatus).toBe("approved");
    expect(drawings.find((d) => d.id === "D007")!.drwStatus).toBe("in_approval");
  });
  it("derives a mixed-state summary for Architecture · Detailed", () => {
    const sum = getStageSummary(drawings, "architecture", "detailed");
    // D200 approved, D201/D202 submitted, D203 in_approval, D204 rework
    expect(sum.total).toBe(5);
    expect(sum.approved).toBe(1);
    expect(sum.byStatus.submitted).toBe(2);
    expect(sum.derivedStatus).toBe("in_progress");
  });
});

describe("approval-queue counts", () => {
  it("counts in-approval BOQ lines and drawings for P1.SP1", () => {
    const lines = ENG_BOM["P1.SP1"] ?? [];
    const drawings = migrateDrawings(ENG_DRAWING_LIST["P1.SP1"] ?? []);
    const counts = approvalQueueCounts(lines, drawings);
    expect(counts.boq).toBe(1); // WC-1001
    expect(counts.drawing).toBe(3); // D007, D010, D203
  });
});

describe("repository payload", () => {
  it("assembles a full scoped payload with derived KPIs + queues", () => {
    const payload = getEngineering("P1", "SP1");
    expect(payload.scope.key).toBe("P1.SP1");
    expect(payload.tenderPack?.sections.length).toBeGreaterThan(0);
    expect(payload.kpis.bomTotal).toBe(payload.bomLines.length);
    expect(payload.queueCounts.boq).toBe(1);
    expect(payload.boqQueue[0]?.boqCode).toBe("WC-1001");
    expect(payload.workflow?.checker).toBe("Rohith R");
  });
  it("falls back to a default sub-project for projects without eng data", () => {
    const payload = getEngineering("P2", "SP1");
    expect(payload.bomLines.length).toBe(0);
    expect(payload.tenderPack).toBeNull();
  });
});
