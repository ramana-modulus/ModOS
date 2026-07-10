import { apiGet } from "@/lib/http";
import type { Project } from "@/types/procurement";
import type { PlanningStatusView, PortfolioKpis, ProjectOverview } from "./types";

export interface ProjectsPayload {
  today: string;
  projects: Project[];
  portfolio: PortfolioKpis;
  planning: Record<string, PlanningStatusView>;
  overviews: Record<string, ProjectOverview | null>;
}

export const projectsApi = {
  getProjects: () => apiGet<ProjectsPayload>("/projects"),
};
