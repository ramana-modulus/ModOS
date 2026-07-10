/**
 * Engineering pure domain helpers — faithful ports of the prototype's derived
 * logic: per-drawing state migration (`_ensureDrawingsState`), stage summaries
 * (`getStageSummary`), BOQ version migration (`_ensureBOQVersioning`), and the
 * qty-variance maths used across the BOM tab, KPI strip, and approval queues.
 */
import type { EngBomLine } from "@/types/procurement";
import type {
  ApprovalQueueItem,
  ApprovalQueueCounts,
  BomCategoryGroup,
  BomRfcMap,
  BomRfiMap,
  BoqVersionEntry,
  Discipline,
  DrwStatus,
  EngBomLineView,
  EngDrawing,
  EngDrawingsState,
  EngDrawingView,
  EngKpis,
  StageKey,
  StageSummary,
} from "@/features/engineering/types";

const EMPTY_BY_STATUS = (): Record<DrwStatus, number> => ({
  pending: 0,
  in_progress: 0,
  submitted: 0,
  in_approval: 0,
  rework: 0,
  site_query: 0,
  approved: 0,
});

/** Legacy `status` → new `drwStatus` migration map (mirrors `_ensureDrawingsState`). */
export function migrateDrawing(d: EngDrawing): EngDrawingView {
  if (d.drwStatus !== undefined) {
    return {
      ...d,
      drwStatus: d.drwStatus,
      drwVersion: d.drwVersion ?? null,
      drwVersionHistory: d.drwVersionHistory ?? [],
    };
  }
  const who = (d.by || "Maker").split(" (")[0]!;
  const legacy = d.status;
  if (legacy === "approved") {
    return {
      ...d,
      drwStatus: "approved",
      drwVersion: "v1",
      drwVersionHistory: [
        { v: "v1", submittedAt: d.date, submittedBy: who, sentForApprovalAt: d.date, sentForApprovalBy: who, reviewedAt: d.date, reviewedBy: "Rohith R", decision: "approved", comments: "Approved" },
      ],
    };
  }
  if (legacy === "in_review" || legacy === "submitted") {
    return {
      ...d,
      drwStatus: "in_approval",
      drwVersion: "v1",
      drwVersionHistory: [
        { v: "v1", submittedAt: d.date, submittedBy: who, sentForApprovalAt: d.date, sentForApprovalBy: who, batchId: "BATCH-LEGACY-" + d.id },
      ],
    };
  }
  if (legacy === "rejected") {
    return {
      ...d,
      drwStatus: "rework",
      drwVersion: "v1",
      drwVersionHistory: [
        { v: "v1", submittedAt: d.date, submittedBy: who, sentForApprovalAt: d.date, sentForApprovalBy: who, reviewedAt: d.date, reviewedBy: "Rohith R", decision: "rejected", comments: "Rejected — see pins on drawing" },
      ],
    };
  }
  return { ...d, drwStatus: "pending", drwVersion: null, drwVersionHistory: [] };
}

export function migrateDrawings(list: EngDrawing[]): EngDrawingView[] {
  return list.map(migrateDrawing);
}

/** Aggregate a discipline+stage bucket into a derived summary (`getStageSummary`). */
export function getStageSummary(drawings: EngDrawingView[], disc: Discipline, stage: StageKey): StageSummary {
  const bucket = drawings.filter((d) => d.disc === disc && d.stage === stage);
  const byStatus = EMPTY_BY_STATUS();
  bucket.forEach((d) => {
    byStatus[d.drwStatus] = (byStatus[d.drwStatus] ?? 0) + 1;
  });
  const total = bucket.length;
  const approved = byStatus.approved;
  const pctApproved = total > 0 ? Math.round((approved / total) * 100) : 0;
  const derivedStatus: StageSummary["derivedStatus"] = total === 0 ? "empty" : approved === total ? "approved" : "in_progress";
  return { disc, stage, total, byStatus, approved, pctApproved, derivedStatus, drawings: bucket };
}

/* ─────────────────────────── BOQ version migration ─────────────────────── */

/** Derive `engVersion` + `engVersionHistory` from `engStatus` (`_ensureBOQVersioning`). */
export function ensureBoqVersioning(item: EngBomLine): { engVersion: string | null; engVersionHistory: BoqVersionEntry[] } {
  switch (item.engStatus) {
    case "approved":
      return {
        engVersion: "v1",
        engVersionHistory: [
          { v: "v1", submittedAt: "19 Apr 2026 · 10:00", submittedBy: "Dushyanth K", sentForApprovalAt: "19 Apr 2026 · 11:30", sentForApprovalBy: "Dushyanth K", reviewedAt: "20 Apr 2026 · 14:45", reviewedBy: "Rohith R", decision: "approved", comments: "BOM breakdown thorough; qty verified against frame layout." },
        ],
      };
    case "submitted":
      return {
        engVersion: "v1",
        engVersionHistory: [{ v: "v1", submittedAt: "22 May 2026 · 09:00", submittedBy: "Dushyanth K" }],
      };
    case "in_approval":
      return {
        engVersion: "v1",
        engVersionHistory: [
          { v: "v1", submittedAt: "21 May 2026 · 09:00", submittedBy: "Dushyanth K", sentForApprovalAt: "21 May 2026 · 14:00", sentForApprovalBy: "Dushyanth K", batchId: "BATCH-SEED-001" },
        ],
      };
    case "rework":
      return {
        engVersion: "v1",
        engVersionHistory: [
          { v: "v1", submittedAt: "18 Apr 2026 · 09:00", submittedBy: "Dushyanth K", sentForApprovalAt: "18 Apr 2026 · 11:00", sentForApprovalBy: "Dushyanth K", reviewedAt: "19 Apr 2026 · 15:00", reviewedBy: "Rohith R", decision: "rejected", comments: "Sent back for rework — reconcile qty against the latest GA and add the missing fasteners." },
        ],
      };
    default:
      return { engVersion: null, engVersionHistory: [] };
  }
}

/* ─────────────────────────── Variance maths ─────────────────────────── */

/** Signed qty variance % (eng vs BOQ). Null when either qty is missing. */
export function variancePct(boqQty: number, engQty: number): number | null {
  if (!boqQty || !engQty) return null;
  return ((engQty - boqQty) / boqQty) * 100;
}

/** Absolute qty delta (eng − BOQ). Null when either qty is missing. */
export function qtyDelta(boqQty: number, engQty: number): number | null {
  if (!boqQty || !engQty) return null;
  return engQty - boqQty;
}

/** Enrich a raw BOM line with version + variance + open-query counts. */
export function buildBomLineView(line: EngBomLine, key: string, rfis: BomRfiMap, rfcs: BomRfcMap): EngBomLineView {
  const { engVersion, engVersionHistory } = ensureBoqVersioning(line);
  const openRfi = (rfis[`${key}.${line.code}`] ?? []).filter((r) => r.status === "open").length;
  const openRfc = (rfcs[`${key}.${line.code}`] ?? []).filter((r) => r.status === "pending" || r.status === "raised").length;
  return {
    ...line,
    engVersion,
    engVersionHistory,
    variancePct: variancePct(line.boqQty, line.engQty),
    delta: qtyDelta(line.boqQty, line.engQty),
    openRfi,
    openRfc,
  };
}

/** Group BOM lines by category preserving first-appearance order, with per-category variance rollups. */
export function groupBomByCategory(lines: EngBomLineView[]): BomCategoryGroup[] {
  const order: string[] = [];
  const map = new Map<string, EngBomLineView[]>();
  for (const line of lines) {
    if (!map.has(line.cat)) {
      map.set(line.cat, []);
      order.push(line.cat);
    }
    map.get(line.cat)!.push(line);
  }
  return order.map((cat) => {
    const items = map.get(cat)!;
    const uoms = new Set(items.map((i) => i.uom));
    const sumBoq = items.reduce((s, i) => s + (i.boqQty || 0), 0);
    const sumEng = items.reduce((s, i) => s + (i.engQty || 0), 0);
    const delta = sumEng - sumBoq;
    return {
      cat,
      items,
      approvedCount: items.filter((i) => i.engStatus === "approved").length,
      bomCount: items.filter((i) => (i.components || []).length > 0).length,
      sumBoq,
      sumEng,
      delta,
      pct: sumBoq > 0 ? (delta / sumBoq) * 100 : 0,
      uom: uoms.size === 1 ? [...uoms][0]! : null,
    };
  });
}

/* ─────────────────────────── Approval queue ─────────────────────────── */

/**
 * Derive the approver's live queue counts. BOQ lines in `in_approval` and
 * drawings in `in_approval` are the units awaiting a decision.
 */
export function approvalQueueCounts(bomLines: EngBomLine[], drawings: EngDrawingView[]): ApprovalQueueCounts {
  return {
    boq: bomLines.filter((l) => l.engStatus === "in_approval").length,
    drawing: drawings.filter((d) => d.drwStatus === "in_approval").length,
  };
}

/** BOQ approval-queue entries for a scope: in-approval lines + their batch metadata. */
export function boqQueueItems(bomLines: EngBomLineView[], projId: string, spId: string, seeded: ApprovalQueueItem[]): ApprovalQueueItem[] {
  return bomLines
    .filter((l) => l.engStatus === "in_approval")
    .map((l) => {
      const seed = seeded.find((q) => q.projId === projId && q.spId === spId && q.boqCode === l.code && q.kind === "boq");
      const hist = l.engVersionHistory[l.engVersionHistory.length - 1];
      return (
        seed ?? {
          projId,
          spId,
          boqCode: l.code,
          kind: "boq" as const,
          sentAt: hist?.sentForApprovalAt ?? "—",
          sentBy: hist?.sentForApprovalBy ?? "Dushyanth K",
          batchId: hist?.batchId ?? "BATCH-SEED-001",
          version: l.engVersion ?? "v1",
        }
      );
    });
}

/** Drawing approval-queue entries for a scope: in-approval drawings + batch metadata. */
export function drawingQueueItems(drawings: EngDrawingView[], projId: string, spId: string): ApprovalQueueItem[] {
  return drawings
    .filter((d) => d.drwStatus === "in_approval")
    .map((d) => {
      const hist = d.drwVersionHistory[d.drwVersionHistory.length - 1];
      return {
        projId,
        spId,
        drawingId: d.id,
        kind: "drawing" as const,
        sentAt: hist?.sentForApprovalAt ?? d.date,
        sentBy: hist?.sentForApprovalBy ?? d.by,
        batchId: hist?.batchId ?? "BATCH-LEGACY-" + d.id,
        version: d.drwVersion ?? "v1",
        stage: d.stage,
        disc: d.disc,
      };
    });
}

/* ─────────────────────────── KPI strip ─────────────────────────── */

export function computeKpis(
  drawings: EngDrawingView[],
  bomLines: EngBomLineView[],
  drawState: EngDrawingsState[string] | undefined,
  totalRfi: number,
  totalRfc: number,
): EngKpis {
  const stagesDone = Object.values(drawState ?? {}).reduce(
    (s, disc) => s + Object.values(disc ?? {}).filter((st) => st && st.status === "approved").length,
    0,
  );
  const stagesTotal = Object.values(drawState ?? {}).reduce((s, disc) => s + Object.keys(disc ?? {}).length, 0) || 1;

  const bomApproved = bomLines.filter((i) => i.engStatus === "approved").length;
  const reworkedItems = bomLines.filter((i) => i.variancePct !== null && Math.abs(i.variancePct) >= 0.5).length;
  const maxVar = bomLines.reduce((m, i) => {
    if (i.variancePct === null) return m;
    return Math.abs(i.variancePct) > Math.abs(m) ? i.variancePct : m;
  }, 0);

  const vetting = drawState?.structure?.vetting;
  const vettingLabel = vetting
    ? vetting.status === "vetted"
      ? `✓ Vetted by ${vetting.vetter}`
      : vetting.status === "submitted"
        ? `⏳ Submitted to ${vetting.vetter}`
        : vetting.status === "rejected"
          ? "⚠ Rejected — re-submit"
          : "Not yet submitted"
    : "—";
  const vettingTone: EngKpis["vettingTone"] =
    vetting?.status === "vetted" ? "cg" : vetting?.status === "submitted" ? "ca" : vetting?.status === "rejected" ? "cr" : "";

  return {
    drawings: drawings.length,
    stagesDone,
    stagesTotal,
    bomApproved,
    bomTotal: bomLines.length,
    reworkedItems,
    maxVar,
    totalRfi,
    totalRfc,
    vettingLabel,
    vettingTone,
  };
}
