import "server-only";
import { PROJECTS } from "@/features/procurement/data/projects";
import { ENG_BOM } from "@/features/procurement/data/eng-bom";
import type { Project, SubProject } from "@/types/procurement";
import {
  BOM_RFCS,
  BOM_RFIS,
  ENG_APPROVAL_QUEUES,
  ENG_BOM_HISTORY,
  ENG_DOCS,
  ENG_DRAWINGS_STATE,
  ENG_DRAWING_LIST,
  ENG_TEAM,
  ENG_VERSIONS,
  ENG_WORKFLOW,
  TENDER_PACKS,
} from "@/features/engineering/data";
import {
  approvalQueueCounts,
  boqQueueItems,
  buildBomLineView,
  computeKpis,
  drawingQueueItems,
  groupBomByCategory,
  migrateDrawings,
} from "@/features/engineering/domain";
import type { EngineeringPayload } from "@/features/engineering/api";
import type { BomRfcMap, BomRfiMap } from "@/features/engineering/types";

function findProject(projId: string): Project {
  return PROJECTS.find((p) => p.id === projId) ?? PROJECTS[0]!;
}

function subProjectsFor(project: Project): SubProject[] {
  return project.subProjects && project.subProjects.length > 0
    ? project.subProjects
    : [{ id: "SP1", name: project.name, units: 1, spec: "" }];
}

/** Filter a `"{proj}.{sub}.{code}"`-keyed map down to a single scope key. */
function scopeMap<T>(map: Record<string, T>, key: string): Record<string, T> {
  const prefix = `${key}.`;
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(map)) {
    if (k.startsWith(prefix)) out[k] = v;
  }
  return out;
}

/**
 * Build the Engineering view payload for a project / sub-project scope. All
 * derivations (drawing migration, BOQ versioning, variance, KPIs, approval
 * queues) run here so the client renders pure view models.
 */
export function getEngineering(projId: string, spId: string): EngineeringPayload {
  const project = findProject(projId);
  const subProjects = subProjectsFor(project);
  const subProject = subProjects.find((s) => s.id === spId) ?? subProjects[0]!;
  const resolvedSp = subProject.id;
  const key = `${projId}.${resolvedSp}`;

  const drawings = migrateDrawings(ENG_DRAWING_LIST[key] ?? []);
  const drawingsState = ENG_DRAWINGS_STATE[key] ?? null;

  const rfis: BomRfiMap = scopeMap(BOM_RFIS, key);
  const rfcs: BomRfcMap = scopeMap(BOM_RFCS, key);

  const bomLines = (ENG_BOM[key] ?? []).map((line) => buildBomLineView(line, key, BOM_RFIS, BOM_RFCS));
  const bomGroups = groupBomByCategory(bomLines);

  const totalRfi = bomLines.reduce((s, l) => s + l.openRfi, 0);
  const totalRfc = bomLines.reduce((s, l) => s + l.openRfc, 0);
  const kpis = computeKpis(drawings, bomLines, drawingsState ?? undefined, totalRfi, totalRfc);

  const seededQueue = ENG_APPROVAL_QUEUES.rohith ?? [];
  const boqQueue = boqQueueItems(bomLines, projId, resolvedSp, seededQueue);
  const drawingQueue = drawingQueueItems(drawings, projId, resolvedSp);
  const queueCounts = approvalQueueCounts(bomLines, drawings);

  return {
    scope: { projId, spId: resolvedSp, key },
    projects: PROJECTS,
    project,
    subProject,
    kpis,
    tenderPack: TENDER_PACKS[projId] ?? null,
    team: ENG_TEAM,
    drawingsState,
    drawings,
    bomLines,
    bomGroups,
    rfis,
    rfcs,
    bomHistory: scopeMap(ENG_BOM_HISTORY, key),
    versions: ENG_VERSIONS[key] ?? [],
    docs: ENG_DOCS[key] ?? [],
    workflow: ENG_WORKFLOW[key] ?? null,
    boqQueue,
    drawingQueue,
    queueCounts,
  };
}
