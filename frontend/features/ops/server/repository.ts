import "server-only";
import {
  OPS_DLR,
  OPS_DPR,
  OPS_GRN_RECEIPTS,
  OPS_HANDOVER,
  OPS_INDENT_CATS,
  OPS_INDENT_TYPES,
  OPS_INDENTS,
  OPS_MATERIALS,
  OPS_PROJECTS,
  OPS_QC_REQUESTS,
  OPS_SCOPE,
  OPS_SCOPE_ITEMS,
  OPS_SITE_LOG,
  OPS_STORE_ISSUES,
  OPS_TODAY,
  OPS_VENDOR_BILLS,
} from "@/features/ops/data";
import {
  cabinRollup,
  categoryRollups,
  checkpointTicks,
  indentRollup,
  lineTotal,
  openHindrances,
  openQcRequests,
  scopeProgress,
  storeModel,
} from "@/features/ops/domain";
import type { GrnFlatRow, OpsPayload, ScopeLineView } from "@/features/ops/api";
import type { OpsProject } from "@/features/ops/types";

function findProject(projId: string): OpsProject {
  return OPS_PROJECTS.find((p) => p.id === projId) ?? OPS_PROJECTS[0]!;
}

/** Execution-mode badge (locked at kickoff) — turnkey line-item vs manpower SC. */
function execMode(scType: ScopeLineView["scType"]): ScopeLineView["execMode"] {
  if (scType === "lineitem") {
    return { label: "Line-item SC", sub: "turnkey · subbie supplies material + labour + equipment", bg: "#EFE9F7", fg: "#6B4FA0" };
  }
  if (scType) {
    return { label: "Manpower SC", sub: "subbie provides labour + equipment · MH supplies material", bg: "#E3F0E6", fg: "#2F7D4E" };
  }
  return null;
}

export function getOps(projId: string, spId: string): OpsPayload {
  const project = findProject(projId);
  const subProjects = project.subProjects ?? [];
  const subProject = subProjects.find((s) => s.id === spId) ?? subProjects[0] ?? null;
  const spKey = subProject?.id ?? spId;
  const key = `${project.id}.${spKey}`;
  const units = subProject?.units ?? 1;

  const items = OPS_SCOPE_ITEMS[key] ?? [];
  const scope = OPS_SCOPE[key] ?? {};
  const indents = OPS_INDENTS[key] ?? [];
  const siteLog = OPS_SITE_LOG[key] ?? [];
  const qcRequests = OPS_QC_REQUESTS[key] ?? [];

  // ── KPIs ──
  const prog = scopeProgress(items, scope);
  const ind = indentRollup(indents);
  const hindOpen = openHindrances(siteLog);
  const qcOpen = openQcRequests(qcRequests);

  // ── Scope line views (derived execution figures) ──
  const scopeLines: ScopeLineView[] = items.map((it) => {
    const rec = scope[it.code];
    const cumQty = rec?.cumQty ?? 0;
    const plan = lineTotal(it, rec);
    const done = Math.min(plan, cumQty);
    const pct = plan > 0 ? Math.min(100, Math.round((done / plan) * 100)) : 0;
    const varAbs = cumQty - it.bomTotal;
    const varPct = it.bomTotal > 0 ? (varAbs / it.bomTotal) * 100 : 0;
    return {
      ...it,
      cumQty,
      done,
      pct,
      ticks: rec ? checkpointTicks(rec) : [],
      checkpointCount: (rec?.checkpoints ?? []).filter((c) => c.cum != null).length,
      cabin: units > 1 ? cabinRollup(plan, units, cumQty) : null,
      variance: { bom: it.bomTotal, exec: cumQty, varAbs, varPct },
      execMode: execMode(it.scType),
    };
  });

  // ── Store, GRN register, bills ──
  const receipts = OPS_GRN_RECEIPTS[key] ?? {};
  const issues = OPS_STORE_ISSUES[key] ?? [];
  const store = storeModel(receipts, issues, OPS_MATERIALS);
  const grn: GrnFlatRow[] = Object.entries(receipts)
    .flatMap(([code, list]) => list.map((g) => ({ ...g, code, materialName: OPS_MATERIALS[code]?.name ?? "" })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const bills = (OPS_VENDOR_BILLS[key] ?? []).map((b) => ({ ...b }));

  return {
    scope: key,
    today: OPS_TODAY,
    projects: OPS_PROJECTS,
    project,
    subProjects,
    subProject,
    units,
    kpis: {
      progressPct: prog.pct,
      plan: prog.plan,
      done: prog.done,
      linesActive: prog.linesActive,
      totalLines: prog.totalLines,
      hindOpen,
      indentsPending: ind.pending,
      indentsBreached: ind.breached,
      qcOpen,
    },
    badges: { indents: ind.pending, sitelog: hindOpen, qcreq: qcOpen },

    scopeLines,
    scopeCats: categoryRollups(items, scope),
    scopeHeaderPct: prog.pct,

    reports: OPS_DPR[key] ?? [],
    dlr: OPS_DLR[key] ?? [],
    siteLog,

    indents,
    indentTypes: OPS_INDENT_TYPES,
    indentCats: OPS_INDENT_CATS,

    store,
    storeIssues: [...issues].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    grn,
    bills,

    qcRequests,
    handover: OPS_HANDOVER[key] ?? null,
  };
}
