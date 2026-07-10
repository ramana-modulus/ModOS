import "server-only";
import { LEADS } from "@/features/bizdev/data/leads";
import { BD_STAGES, DEMO_TODAY, STAGE_THRESHOLDS } from "@/features/bizdev/data/stages";
import { getDaysInStage, getDaysSinceCreated, isCostingReceived } from "@/features/bizdev/domain";
import type { BizDevPayload } from "@/features/bizdev/api";
import type { Lead, LeadView, StageId } from "@/features/bizdev/types";

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
