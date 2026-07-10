import "server-only";
import { PROJECTS } from "@/features/procurement/data/projects";
import {
  ACTIVITY_LOG,
  PLANNING_STATE,
  PORTFOLIO_VALUE,
  PROJECTS_TODAY,
  PROJ_CASHFLOW,
  PROJ_EXT,
} from "@/features/projects/data";
import {
  buildCashflow,
  computeHealth,
  computeMetrics,
  getProjectActivity,
  isProjectExt,
} from "@/features/projects/domain";
import type { ProjectsPayload } from "@/features/projects/api";
import type { PlanningStatusView, ProjectOverview } from "@/features/projects/types";

/**
 * Projects (landing dashboard) view payload: the base project list, portfolio
 * KPI roll-ups, per-project planning status, and the full ERP overview for every
 * project that has extended data (P1). P2–P5 map to `null` (fallback overview).
 */
export function getProjects(): ProjectsPayload {
  const overviews: Record<string, ProjectOverview | null> = {};
  const planning: Record<string, PlanningStatusView> = {};

  for (const p of PROJECTS) {
    planning[p.id] = { status: PLANNING_STATE[p.id]?.status ?? "draft" };

    const ext = PROJ_EXT[p.id];
    if (isProjectExt(ext)) {
      const cf = PROJ_CASHFLOW[p.id];
      overviews[p.id] = {
        ext,
        health: computeHealth(ext),
        metrics: computeMetrics(ext),
        activity: getProjectActivity(ACTIVITY_LOG, p.id, 10),
        cashflow: cf ? buildCashflow(cf) : null,
      };
    } else {
      overviews[p.id] = null;
    }
  }

  const awarded = PROJECTS.filter((p) => p.awarded);
  const inExecution = awarded.filter((p) => p.stage === "Execution");
  const plansApproved = Object.values(PLANNING_STATE).filter((s) => s.status === "approved").length;

  return {
    today: PROJECTS_TODAY,
    projects: PROJECTS,
    portfolio: {
      total: PROJECTS.length,
      inExecution: inExecution.length,
      portfolioValue: PORTFOLIO_VALUE,
      plansApproved,
      awardedCount: awarded.length,
    },
    planning,
    overviews,
  };
}
