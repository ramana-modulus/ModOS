import { apiGet } from "@/lib/http";
import type {
  CabinRollup,
  CabinStatusView,
  InspectionView,
  Itp,
  NcrView,
  Project,
  QaqcKpis,
  Tpt,
} from "./types";

export interface CabinView {
  checklist: string[];
  units: number;
  cabins: CabinStatusView[];
  rollup: CabinRollup;
}

export interface ProjectMeta {
  code: string;
  client: string;
  name: string;
  qaEngineer: string;
  spName: string;
  spSpec: string;
  units: number;
}

export interface QaqcPayload {
  project: string;
  subProject: string;
  projects: Project[];
  meta: ProjectMeta;
  today: string;
  itps: Itp[];
  inspections: InspectionView[];
  ncrs: NcrView[];
  tpts: Tpt[];
  cabin: CabinView;
  kpis: QaqcKpis;
}

export const qaqcApi = {
  getQAQC: (project: string, subProject: string) =>
    apiGet<QaqcPayload>("/qaqc", { project, subProject }),
};
