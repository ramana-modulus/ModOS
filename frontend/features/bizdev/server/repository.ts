import "server-only";
import { LEADS } from "@/features/bizdev/data/leads";
import { BD_STAGES, DEMO_TODAY, STAGE_THRESHOLDS } from "@/features/bizdev/data/stages";
import { getDaysInStage, getDaysSinceCreated, isCostingReceived } from "@/features/bizdev/domain";
import { PROJECTS } from "@/features/procurement/data/projects";
import { EST_SUBPROJECTS } from "@/features/estimation/data";
import { MY_TASKS, NOTIFICATIONS } from "@/features/inbox/data";
import type { BizDevPayload } from "@/features/bizdev/api";
import type { Lead, LeadView, StageId } from "@/features/bizdev/types";
import type { Project } from "@/types/procurement";
import type { AppNotification, MyTask } from "@/features/inbox/types";

const TERMINAL = new Set(["lost", "not_participated"]);
const VALID_STAGES: StageId[] = ["enquiry", "costing", "proposal", "negotiation", "won", "lost", "not_participated"];
const HEAT_CHANCE: Record<string, number> = { Hot: 55, Warm: 30, Cold: 15, Tender: 20 };

/** Mutable in-memory store (deep-cloned from the seed) so lifecycle moves persist. */
let leads: Lead[] = structuredClone(LEADS);

/** Reset to the seed snapshot — used by tests. */
export function resetBizDevStore(): void {
  leads = structuredClone(LEADS);
}

function toView(l: Lead): LeadView {
  return {
    ...l,
    daysInStage: getDaysInStage(l, DEMO_TODAY),
    daysSinceCreated: getDaysSinceCreated(l, DEMO_TODAY),
    costingReceived: isCostingReceived(l),
  };
}

export function getBizDev(): BizDevPayload {
  const views = leads.map(toView);
  const pipeline = views.filter((l) => !TERMINAL.has(l.status));
  const won = views.filter((l) => l.status === "won");
  const deals = views.filter((l) => l.status !== "enquiry");

  return {
    stages: BD_STAGES,
    leads: views,
    thresholds: STAGE_THRESHOLDS,
    today: DEMO_TODAY,
    stats: {
      pipelineValue: pipeline.reduce((s, l) => s + (l.ev || 0), 0),
      pipelineCount: pipeline.length,
      won: won.reduce((s, l) => s + (l.ev || 0), 0),
      wonCount: won.length,
      costingNeeded: views.filter((l) => l.status === "costing").length,
      activeDeals: deals.filter((l) => !TERMINAL.has(l.status)).length,
    },
  };
}

/**
 * Move a lead to a new stage — the core lifecycle mutation (`moveStage` /
 * `convertToDeal` / `generateQuote` / `markWon` / `markLost`). Appends to
 * `stageHistory` (idempotent) so the stage-age clock resets to DEMO_TODAY.
 */
export function moveStage(id: string, toStage: string): LeadView {
  if (!VALID_STAGES.includes(toStage as StageId)) throw new Error(`Invalid stage: ${toStage}`);
  const lead = leads.find((l) => l.id === id);
  if (!lead) throw new Error(`Lead ${id} not found`);

  lead.status = toStage as StageId;
  const last = lead.stageHistory[lead.stageHistory.length - 1];
  if (!last || last.stage !== toStage) {
    lead.stageHistory.push({ stage: toStage, enteredAt: DEMO_TODAY });
  }
  if (toStage === "costing" && !lead.dl) lead.dl = "TBD";
  return toView(lead);
}

export interface CreateLeadInput {
  client: string;
  co?: string;
  desc: string;
  type?: string;
  lt?: string;
  src?: string;
  owner?: string;
  tech?: string;
  ev?: number | null;
  area?: number;
  dl?: string | null;
  tr?: string;
}

const WON_DEPTS = ["BD", "Estimation", "Engineering", "Procurement", "Ops", "Finance", "Admin"];
const STEEL_TECH = new Set(["PEB", "CISP", "LGSF", "Portacabin", "Prefab Shelter"]);
const wonProjects = new Map<string, { code: string; name: string }>();

/**
 * Deal-won side effects (prototype `markWon`): create a Project record, notify
 * every department, and queue the PM's WBS task. Idempotent per lead — the stage
 * move itself is done by moveStage; this creates the downstream records. Returns
 * the new project's code + name for the company-wide "Project Won" banner.
 */
export function createWonProject(leadId: string): { code: string; name: string } {
  const existing = wonProjects.get(leadId);
  if (existing) return existing;

  const lead = leads.find((l) => l.id === leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);

  const tech = lead.tech[0] || "PEB";
  const name = lead.co || lead.client;
  const code = `MH-${String(Date.now()).slice(-5)}`;
  const value = lead.ev ? `₹${(lead.ev / 100000).toFixed(1)}L` : "—";

  const subProjects = (EST_SUBPROJECTS[leadId] ?? []).map((sp, i) => ({
    id: `SP${i + 1}`,
    name: sp.name,
    units: sp.units,
    spec: sp.spec,
  }));

  const project: Project = {
    id: `P${PROJECTS.length + 1}`,
    code,
    name,
    client: lead.client,
    type: tech,
    stage: "Project Created",
    value,
    steelApplicable: STEEL_TECH.has(tech),
    startDate: null,
    duration: 90,
    awarded: true,
    ...(subProjects.length ? { subProjects } : {}),
  };
  PROJECTS.push(project);

  // Company-wide notifications — one per department.
  const notifs: AppNotification[] = WON_DEPTS.map((dept, i) => ({
    id: `WON_${leadId}_${i}`,
    dept,
    project: name,
    ref: code,
    type: "info",
    priority: dept === "Admin" || dept === "BD" ? "high" : "med",
    msg: `🎉 New project won — ${name} (${tech}) · ${value}. Project created and ready for WBS.`,
    ...(dept === "Admin" || dept === "Ops" || dept === "Engineering" ? { action: "Open Project" } : {}),
    actionTarget: "projects",
    date: `${DEMO_TODAY} · Now`,
    unread: true,
    from: "BD Team",
    to: [dept],
  }));
  for (const n of notifs) NOTIFICATIONS.unshift(n);

  // PM's WBS task.
  const task: MyTask = {
    id: `T_WBS_${leadId}`,
    dept: "Projects",
    project: name,
    msg: `Build WBS for ${name} — new project created post deal win`,
    priority: "high",
    due: "ASAP",
    done: false,
    target: "projects",
  };
  MY_TASKS.unshift(task);

  const result = { code, name };
  wonProjects.set(leadId, result);
  return result;
}

/** Mark a lead's costing as received from Estimation (Estimation → Consolidate
 * & Send to BD). Flips `costingSubmitted`, which drives `costingReceived` in the
 * deal panel (enabling "Generate Quote"). */
export function markCostingReceived(id: string): LeadView {
  const lead = leads.find((l) => l.id === id);
  if (!lead) throw new Error(`Lead ${id} not found`);
  lead.costingSubmitted = true;
  return toView(lead);
}

/** Edit an existing lead's editable fields in place (`openEditLeadModal` → save). */
export function updateLead(id: string, patch: Partial<CreateLeadInput>): LeadView {
  const lead = leads.find((l) => l.id === id);
  if (!lead) throw new Error(`Lead ${id} not found`);
  if (patch.client !== undefined) lead.client = patch.client;
  if (patch.co !== undefined) lead.co = patch.co || lead.client;
  if (patch.desc !== undefined) lead.desc = patch.desc;
  if (patch.type !== undefined) lead.type = (patch.type === "B2G" ? "B2G" : "B2B") as Lead["type"];
  if (patch.lt !== undefined) lead.lt = patch.lt as Lead["lt"];
  if (patch.src !== undefined) lead.src = patch.src;
  if (patch.owner !== undefined) lead.owner = patch.owner;
  if (patch.tech !== undefined) lead.tech = [patch.tech];
  if (patch.ev !== undefined) lead.ev = patch.ev;
  if (patch.area !== undefined) lead.area = patch.area;
  if (patch.dl !== undefined) lead.dl = patch.dl;
  // Tender ref only applies to B2G; clear it otherwise.
  lead.tr = lead.type === "B2G" && patch.tr ? patch.tr : undefined;
  return toView(lead);
}

function nextLeadId(): string {
  const max = leads.reduce((m, l) => {
    const n = Number(l.id.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `L${max + 1}`;
}

/** Create a new lead in the enquiry stage (`createLead`). */
export function createLead(input: CreateLeadInput): LeadView {
  const id = nextLeadId();
  const heat = (input.lt || "Warm") as Lead["lt"];
  const type = (input.type === "B2G" ? "B2G" : "B2B") as Lead["type"];
  const lead: Lead = {
    id,
    ref: `DCL/${id.replace("L", "0")}`,
    type,
    lt: heat,
    client: input.client,
    co: input.co || input.client,
    owner: input.owner || "BD Team",
    tech: [input.tech || "PEB"],
    desc: input.desc,
    area: input.area || 0,
    ev: input.ev ?? null,
    ch: HEAT_CHANCE[heat] ?? 20,
    src: input.src || "Inbound",
    status: "enquiry",
    date: DEMO_TODAY,
    dl: input.dl ?? null,
    docs: [],
    stageHistory: [{ stage: "enquiry", enteredAt: DEMO_TODAY }],
    ...(type === "B2G" && input.tr ? { tr: input.tr } : {}),
  };
  leads.unshift(lead);
  return toView(lead);
}
