import "server-only";
import { EST_CATEGORIES, EST_CONFIG, EST_LEADS, EST_SUBPROJECTS, EST_VERSIONS } from "@/features/estimation/data";
import { subProjectTotalIncl, subProjectUnitRateExcl } from "@/features/estimation/domain";
import type { EstLead } from "@/features/estimation/types";
import type {
  EstimationPayload,
  EstLeadSummary,
  EstProjectHeader,
  EstSubProjectView,
} from "@/features/estimation/api";

/** Workflow statuses that mean the costing has been submitted for review. */
const SUBMITTED_STATES = new Set(["submitted_review", "checker_approved", "approved", "quote_generated"]);

function resolveLead(project?: string): EstLead {
  if (project) {
    const found = EST_LEADS.find((l) => l.id === project);
    if (found) return found;
  }
  return EST_LEADS[0]!;
}

function toSummary(l: EstLead): EstLeadSummary {
  return { id: l.id, ref: l.ref, co: l.co, client: l.client, tech: l.tech, dl: l.dl };
}

function toHeader(l: EstLead): EstProjectHeader {
  return {
    id: l.id,
    ref: l.ref,
    co: l.co,
    client: l.client,
    tech: l.tech,
    desc: l.desc,
    area: l.area,
    dl: l.dl,
    docs: l.docs,
    costingSubmitted: SUBMITTED_STATES.has(l.wfStatus),
  };
}

/**
 * The estimation view for one project (BD lead in the costing queue). Returns
 * the costing queue, the resolved active lead, its sub-projects enriched with
 * computed totals, versions, categories, and the config rates. Defaults to the
 * first queued lead when `project` is missing or unknown.
 */
export function getEstimation(project?: string): EstimationPayload {
  const lead = resolveLead(project);
  const rawSubs = EST_SUBPROJECTS[lead.id] ?? [];

  const subProjects: EstSubProjectView[] = rawSubs.map((sp) => ({
    id: sp.id,
    name: sp.name,
    spec: sp.spec,
    units: sp.units,
    consignee: sp.consignee,
    deliveryDays: sp.deliveryDays,
    status: sp.status,
    items: sp.items,
    unitRateExcl: subProjectUnitRateExcl(sp.items, EST_CONFIG),
    totalIncl: subProjectTotalIncl(sp.items, sp.units, EST_CONFIG),
    wf: sp.wf,
  }));

  const overviewTotalIncl = subProjects.reduce((s, sp) => s + sp.totalIncl, 0);

  return {
    config: EST_CONFIG,
    categories: EST_CATEGORIES,
    versions: EST_VERSIONS,
    leads: EST_LEADS.map(toSummary),
    project: toHeader(lead),
    subProjects,
    overviewTotalIncl,
  };
}
