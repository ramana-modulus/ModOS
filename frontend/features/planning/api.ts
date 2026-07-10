import { apiGet } from "@/lib/http";
import type { PlanningPayload } from "@/features/planning/server/repository";

export type { PlanningPayload };

/** Typed client SDK for the Planning mock API. */
export const planningApi = {
  getPlanning: (project = "P1", subProject = "SP1") =>
    apiGet<PlanningPayload>("/planning", { project, subProject }),
};
