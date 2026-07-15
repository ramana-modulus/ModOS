import { apiGet, apiPost } from "@/lib/http";
import type { BdStage, BizDevStats, LeadView, StageId, StageThreshold } from "./types";

export interface BizDevPayload {
  stages: BdStage[];
  leads: LeadView[];
  thresholds: Partial<Record<StageId, StageThreshold>>;
  stats: BizDevStats;
  today: string;
}

export interface NewLeadInput {
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

export const bizdevApi = {
  getBizDev: () => apiGet<BizDevPayload>("/bizdev"),
  moveStage: (id: string, toStage: string) =>
    apiPost<{ lead: LeadView }>("/bizdev/move-stage", { id, toStage }),
  createLead: (input: NewLeadInput) => apiPost<{ lead: LeadView }>("/bizdev/lead", input),
  updateLead: (id: string, input: NewLeadInput) =>
    apiPost<{ lead: LeadView }>("/bizdev/lead/update", { id, ...input }),
  markCostingReceived: (id: string) =>
    apiPost<{ lead: LeadView }>("/bizdev/costing-received", { id }),
  /** Deal-won side effects: create the project + fire company-wide notifications. */
  winProject: (id: string) =>
    apiPost<{ project: { code: string; name: string } }>("/bizdev/won", { id }),
};
