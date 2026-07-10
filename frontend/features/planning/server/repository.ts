import "server-only";
import {
  DEMO_TODAY,
  KICKOFF_DECISIONS,
  KICKOFF_SIGNOFF,
  PLAN_STATE,
  PROJECT,
  SOURCE_ITEMS,
  SUB_PROJECTS,
  WBS_CEO,
  WBS_COO,
  WBS_PLANNER,
} from "@/features/planning/data";
import {
  buildActivityRows,
  buildWbsItems,
  demoTodayDay,
  deptScheduledQty,
  plannedEndDate,
  projectedEndDate,
} from "@/features/planning/domain";
import type {
  ActivityRowLite,
  ApprovalNode,
  ApprovalView,
  Dept,
  DeptGanttRow,
  GanttCatGroup,
  KickoffMatrixCat,
  KickoffMatrixView,
  PlanningKpi,
  PlanStatusPill,
  SignoffView,
  WbsItem,
  WbsStats,
  WbsView,
} from "@/features/planning/types";

const DEPT_ORDER: Dept[] = ["engg", "proc", "subcontracts", "ops", "qa"];

const EXEC_LABEL: Record<string, string> = {
  manpower: "Manpower",
  lineitem: "Line-item",
  self: "Self",
  machinery: "Machinery",
};

/** Category order as they first appear in the source BOQ. */
function catOrder(items: WbsItem[]): { catId: string; cat: string }[] {
  const seen = new Set<string>();
  const out: { catId: string; cat: string }[] = [];
  for (const it of items) {
    if (!seen.has(it.catId)) {
      seen.add(it.catId);
      out.push({ catId: it.catId, cat: it.cat });
    }
  }
  return out;
}

/** Build the Dept-View + Activity-View gantt rows, grouped by category. */
function buildGanttGroups(items: WbsItem[]): GanttCatGroup[] {
  return catOrder(items).map(({ catId, cat }) => {
    const catItems = items.filter((i) => i.catId === catId);

    // Dept view: one row per (item × dept-in-route).
    const deptRows: DeptGanttRow[] = [];
    for (const item of catItems) {
      item.route.forEach((dept, idx) => {
        const blocks = item.blocks.filter((b) => b.dept === dept);
        deptRows.push({
          key: `${item.code}.${dept}`,
          catId,
          cat,
          code: item.code,
          itemName: item.name,
          dept,
          isFirst: idx === 0,
          billing: item.billing,
          decision: item.decision,
          deptFull: item.totalQty - deptScheduledQty(item.blocks, dept) <= 0.001,
          blocks,
        });
      });
    }

    // Activity view: one dept-envelope per dept the category routes through.
    const catRoute = DEPT_ORDER.filter((d) => catItems.some((i) => i.route.includes(d)));
    const activityRows: ActivityRowLite[] = [];
    for (const dept of catRoute) {
      let minD = Infinity;
      let maxE = -Infinity;
      let vSum = 0;
      let vPct = 0;
      for (const item of catItems) {
        const bl = item.blocks.filter((b) => b.dept === dept);
        if (!bl.length) continue;
        for (const b of bl) {
          minD = Math.min(minD, b.day);
          maxE = Math.max(maxE, b.day + b.duration);
        }
        const dp = item.deptProgress.find((p) => p.dept === dept);
        const val = item.unitValue * item.totalQty;
        if (dp) {
          vSum += val;
          vPct += val * dp.pct;
        }
      }
      if (minD === Infinity) continue;
      activityRows.push({
        dept,
        label: DEPT_META[dept].label,
        start: minD,
        end: maxE,
        pct: vSum > 0 ? Math.round(vPct / vSum) : 0,
      });
    }

    return { catId, cat, deptRows, activityRows };
  });
}

/** Dept metadata (labels/colours from renderWBSDeptView DEPT_DEFS). */
const DEPT_META: Record<Dept, { label: string; color: string; bg: string }> = {
  engg: { label: "Engineering", color: "#185FA5", bg: "#E6F1FB" },
  proc: { label: "Procurement", color: "#854F0B", bg: "#FAEEDA" },
  subcontracts: { label: "Subcontracts", color: "#0F766E", bg: "#E6F5F3" },
  ops: { label: "Operations", color: "#C84B2F", bg: "#FAE9E4" },
  qa: { label: "QA & Safety", color: "#3B6D11", bg: "#EAF3DE" },
};

function buildStats(items: WbsItem[], overallPct: number): WbsStats {
  const { rows } = buildActivityRows(items);
  const acts = rows.filter((r) => r.level === 1);
  return {
    totalActivities: acts.length,
    notStarted: acts.filter((r) => r.status === "not_started").length,
    inProgress: acts.filter((r) => r.status === "in_progress").length,
    completed: acts.filter((r) => r.status === "completed").length,
    schedulePct: overallPct,
    scheduleStatus: "On Track",
    plannedEndDate: plannedEndDate(PROJECT.startDate!, PROJECT.duration),
    projectedEndDate: projectedEndDate(PROJECT.startDate!, PROJECT.duration),
  };
}

function buildWbsView(items: WbsItem[]): WbsView {
  const { rows, overallPct } = buildActivityRows(items);
  return {
    items,
    groups: buildGanttGroups(items),
    activityRows: rows,
    stats: buildStats(items, overallPct),
    totalDays: PROJECT.duration,
    startDate: PROJECT.startDate!,
    todayDay: demoTodayDay(PROJECT.startDate!, DEMO_TODAY),
  };
}

function buildKickoffMatrix(): KickoffMatrixView {
  const cats: KickoffMatrixCat[] = catOrder(buildWbsItems(SOURCE_ITEMS)).map(({ catId, cat }) => ({
    catId,
    cat,
    items: SOURCE_ITEMS.filter((s) => s.catId === catId).map((s) => {
      const decision = KICKOFF_DECISIONS[s.code]!;
      return {
        code: s.code,
        name: s.name,
        uom: s.uom,
        qtyPerUnit: s.qtyPerUnit,
        decision,
        execLabel: EXEC_LABEL[decision.scType] ?? "—",
        route: buildWbsItems([s])[0]!.route,
      };
    }),
  }));

  const counts = { manpower: 0, lineitem: 0, machinery: 0, engineered: 0, boughtout: 0 };
  let decided = 0;
  for (const s of SOURCE_ITEMS) {
    const d = KICKOFF_DECISIONS[s.code]!;
    if (d.scType === "lineitem") {
      decided++;
      counts.lineitem++;
    } else if (d.scType === "machinery") {
      decided++;
      counts.machinery++;
    } else if ((d.scType === "manpower" || d.scType === "self") && d.matNature) {
      decided++;
      counts.manpower++;
      if (d.matNature === "engineered") counts.engineered++;
      else if (d.matNature === "boughtout") counts.boughtout++;
    }
  }
  const total = SOURCE_ITEMS.length;
  return {
    signedOff: KICKOFF_SIGNOFF.signedOff,
    signedBy: KICKOFF_SIGNOFF.signedBy,
    signedOn: KICKOFF_SIGNOFF.signedOn,
    cats,
    total,
    decided,
    pct: total > 0 ? Math.round((decided / total) * 100) : 0,
    counts,
  };
}

function buildApproval(items: WbsItem[]): ApprovalView {
  // Default state for P1.SP1: no submission yet (WBS_APPROVAL empty → draft).
  const fullyScheduled = items.length > 0 && items.every((i) => i.fullyScheduled);
  const nodes: ApprovalNode[] = [
    {
      role: "Planner (Maker)",
      person: WBS_PLANNER,
      state: fullyScheduled ? "active" : "pending",
      status: fullyScheduled ? "→ ready to send" : "○ scheduling…",
    },
    { role: "COO", person: WBS_COO, state: "pending", status: "○ waiting" },
    { role: "CEO", person: WBS_CEO, state: "pending", status: "○ waiting" },
    { role: "Client", person: PROJECT.client, state: "pending", status: "○ waiting" },
  ];
  return {
    status: "draft",
    coo: { status: "pending", by: null, on: null, note: null },
    ceo: { status: "pending", by: null, on: null, note: null },
    history: [],
    nodes,
    locked: false,
    fullyScheduled,
    planner: WBS_PLANNER,
    cooName: WBS_COO,
    ceoName: WBS_CEO,
    client: PROJECT.client,
    subProjectName: SUB_PROJECTS[0]!.name,
  };
}

function buildSignoff(): SignoffView {
  const planApproved = PLAN_STATE.status === "approved";
  return {
    planApproved,
    kickedOff: false,
    checklist: [
      { ok: true, label: "BD has marked the project as Won", ref: "BD → " + PROJECT.client },
      { ok: true, label: "Estimation BOQ is approved (V3)", ref: "Estimation → consolidated submittal" },
      { ok: planApproved, label: "WBS approved by client", ref: planApproved ? "Approved" : "Pending client approval" },
      { ok: false, label: "Signoff meeting scheduled", ref: "Not scheduled" },
    ],
    deptNotifications: [
      { key: "engineering", label: "Engineering", role: "Drawings + BOM finalization", notified: false },
      { key: "procurement", label: "Procurement", role: "Vendor outreach + PO release", notified: false },
      { key: "ops", label: "Operations", role: "Site + factory execution", notified: false },
      { key: "qaqc", label: "QA / QC", role: "Inspection checkpoints", notified: false },
      { key: "billing", label: "Billing", role: "Client RA bills against progress", notified: false },
      { key: "finance", label: "Finance", role: "AP + AR cashflow visibility", notified: false },
    ],
    meeting: null,
  };
}

function buildKpis(items: WbsItem[], overallPct: number): PlanningKpi[] {
  const itemCount = items.length;
  const blockCount = items.reduce((s, i) => s + i.blocks.length, 0);
  return [
    { label: "Schedule Progress", value: `${overallPct}%`, sub: "value-weighted" },
    { label: "Line Items in Plan", value: `${itemCount}`, sub: `${blockCount} blocks` },
    { label: "Duration", value: `${PROJECT.duration}d`, sub: `from ${PROJECT.startDate ?? "—"}` },
    { label: "Sub-project", value: SUB_PROJECTS[0]!.name, sub: `×${SUB_PROJECTS[0]!.units} units` },
  ];
}

const PLAN_PILL: PlanStatusPill = { cls: "pgr", label: "Draft" };

export interface PlanningPayload {
  project: typeof PROJECT;
  subProjects: typeof SUB_PROJECTS;
  subProject: string;
  today: string;
  plan: typeof PLAN_STATE;
  planPill: PlanStatusPill;
  signoffStatus: string;
  kpis: PlanningKpi[];
  deptMeta: Record<Dept, { label: string; color: string; bg: string }>;
  wbs: WbsView;
  kickoffMatrix: KickoffMatrixView;
  approval: ApprovalView;
  signoff: SignoffView;
}

/**
 * Build the Planning view payload for a scope. Only P1.SP1 carries a faithful
 * seeded WBS in the prototype; other scopes resolve to the same demo data set
 * (the prototype pins Planning to SP1).
 */
export function getPlanning(_projId: string = "P1", _spId: string = "SP1"): PlanningPayload {
  void _projId;
  void _spId;
  const items = buildWbsItems(SOURCE_ITEMS);
  const { overallPct } = buildActivityRows(items);
  const planApproved = PLAN_STATE.status === "approved";
  return {
    project: PROJECT,
    subProjects: SUB_PROJECTS,
    subProject: SUB_PROJECTS[0]!.id,
    today: DEMO_TODAY,
    plan: PLAN_STATE,
    planPill: PLAN_PILL,
    signoffStatus: planApproved ? "Ready to schedule" : "Awaiting plan approval",
    kpis: buildKpis(items, overallPct),
    deptMeta: DEPT_META,
    wbs: buildWbsView(items),
    kickoffMatrix: buildKickoffMatrix(),
    approval: buildApproval(items),
    signoff: buildSignoff(),
  };
}
