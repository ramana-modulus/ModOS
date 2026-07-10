import { apiGet } from "@/lib/http";
import type { Project, SubProject } from "@/types/procurement";
import type {
  ApprovalQueueCounts,
  ApprovalQueueItem,
  BomCategoryGroup,
  BomHistoryEntry,
  BomRfcMap,
  BomRfiMap,
  DrawingsStateTrack,
  EngBomLineView,
  EngDoc,
  EngDrawingView,
  EngKpis,
  EngTeam,
  EngVersion,
  EngWorkflow,
  TenderPack,
} from "@/features/engineering/types";

export interface EngineeringPayload {
  scope: { projId: string; spId: string; key: string };
  projects: Project[];
  project: Project;
  subProject: SubProject | null;
  kpis: EngKpis;
  tenderPack: TenderPack | null;
  team: EngTeam;
  drawingsState: DrawingsStateTrack | null;
  drawings: EngDrawingView[];
  bomLines: EngBomLineView[];
  bomGroups: BomCategoryGroup[];
  rfis: BomRfiMap;
  rfcs: BomRfcMap;
  bomHistory: Record<string, BomHistoryEntry[]>;
  versions: EngVersion[];
  docs: EngDoc[];
  workflow: EngWorkflow | null;
  boqQueue: ApprovalQueueItem[];
  drawingQueue: ApprovalQueueItem[];
  queueCounts: ApprovalQueueCounts;
}

export const engineeringApi = {
  getEngineering: (project: string, subProject: string) =>
    apiGet<EngineeringPayload>("/engineering", { project, subProject }),
};
