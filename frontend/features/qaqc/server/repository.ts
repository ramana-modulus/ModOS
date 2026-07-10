import "server-only";
import {
  QC_CABIN_CHECKLIST,
  QC_INSPECTIONS,
  QC_ITP,
  QC_NCR,
  QC_PROJECTS,
  QC_TODAY,
  QC_TPT,
} from "@/features/qaqc/data";
import {
  cabinEffStatus,
  cabinRollup,
  hpReleaseState,
  inspCabinLabel,
  inspIsHoldPoint,
  ncrBlocks,
  ncrBucket,
  seedCabinQc,
} from "@/features/qaqc/domain";
import type { QaqcPayload } from "@/features/qaqc/api";
import type { Inspection, InspectionView, NcrView, Project, SubProject } from "@/features/qaqc/types";

/** Inspections that carry a historical (already-released) hold-point clearance in the demo timeline. */
const HP_BACKFILL = new Set(["IMIR-006", "IMIR-007", "IMIR-008", "IMIR-009", "IMIR-010", "WIR-004"]);

function findProject(projId: string): Project {
  return QC_PROJECTS.find((p) => p.id === projId) ?? QC_PROJECTS[0]!;
}

function findSubProject(project: Project, spId: string): SubProject {
  return project.subProjects.find((s) => s.id === spId) ?? project.subProjects[0]!;
}

/** Apply the seed back-fill: passed/partial hold points already cleared in the timeline get an explicit release. */
function withHpBackfill(insp: Inspection): Inspection {
  if (HP_BACKFILL.has(insp.id) && (insp.status === "passed" || insp.status === "partial_pass") && !insp.hpRelease) {
    return { ...insp, hpRelease: { status: "released", by: "Karthik (QA Engg.)", at: insp.date, conditions: null, decision: "released" } };
  }
  return insp;
}

export function getQAQC(projId = "P1", spId = "SP1"): QaqcPayload {
  const project = findProject(projId);
  const sp = findSubProject(project, spId);
  const key = `${project.id}.${sp.id}`;
  const units = sp.units;

  const itps = QC_ITP;

  // Inspections — apply hold-point back-fill, then derive display fields.
  const rawInsps = (QC_INSPECTIONS[key] ?? []).map(withHpBackfill);
  const inspections: InspectionView[] = rawInsps.map((i) => {
    const isHP = inspIsHoldPoint(itps, i);
    return {
      ...i,
      isHoldPoint: isHP,
      hpState: isHP ? hpReleaseState(i) : null,
      cabinLabel: inspCabinLabel(i),
      itpName: itps.find((t) => t.id === i.itpRef)?.name ?? null,
    };
  });

  // NCRs — derive workflow bucket + billing-block flag.
  const rawNcrs = QC_NCR[key] ?? [];
  const ncrs: NcrView[] = rawNcrs.map((n) => ({ ...n, bucket: ncrBucket(n), blocks: n.status !== "closed" && ncrBlocks(n) }));

  const tpts = QC_TPT[key] ?? [];

  // Cabin sign-off — seed statuses, then compute effective status against open NCRs.
  const cabinsRaw = units > 1 ? seedCabinQc(units, QC_CABIN_CHECKLIST) : [];
  const cabins = cabinsRaw.map((c) => ({ ...c, eff: cabinEffStatus(c, rawNcrs) }));
  const rollup = cabinRollup(cabinsRaw);

  // KPIs (scoped to this sub-project).
  const passed = inspections.filter((i) => i.status === "passed").length;
  const partial = inspections.filter((i) => i.status === "partial_pass").length;
  const failed = inspections.filter((i) => i.status === "failed").length;
  const pending = inspections.filter((i) => i.status === "pending").length;
  const openNCR = ncrs.filter((n) => n.status !== "closed").length;
  const majorCritical = ncrs.filter((n) => n.severity === "major" || n.severity === "critical").length;
  const tptPassed = tpts.filter((t) => t.status === "passed").length;
  const tptPending = tpts.filter((t) =>
    ["scheduled", "sample_collected", "at_lab", "report_received"].includes(t.status)
  ).length;
  const tptFailed = tpts.filter((t) => t.status === "rejected").length;
  const holdPoints = itps.filter((t) => t.holdPoint).length;
  const hpAwaiting = inspections.filter((i) => i.isHoldPoint && i.hpState === "awaiting_release").length;

  return {
    project: project.id,
    subProject: sp.id,
    projects: QC_PROJECTS,
    meta: {
      code: project.code,
      client: project.client,
      name: project.name,
      qaEngineer: project.qaEngineer,
      spName: sp.name,
      spSpec: sp.spec,
      units,
    },
    today: QC_TODAY,
    itps,
    inspections,
    ncrs,
    tpts,
    cabin: { checklist: QC_CABIN_CHECKLIST, units, cabins, rollup },
    kpis: {
      inspections: inspections.length,
      passed,
      partial,
      failed,
      pending,
      openNCR,
      majorCritical,
      inspQueue: pending,
      tptTotal: tpts.length,
      tptPassed,
      tptPending,
      tptFailed,
      itpsInScope: itps.length,
      holdPoints,
      hpAwaiting,
    },
  };
}
