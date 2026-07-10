import { apiGet } from "@/lib/http";
import type {
  SetApproval,
  SetDept,
  SetIntegration,
  SetPermLevel,
  SetRole,
  SetUser,
} from "./types";

export interface SettingsKpis {
  activeUsers: number;
  invitedUsers: number;
  totalRoles: number;
  customRoles: number;
  activeApprovals: number;
  approvalModules: number;
  connectedIntegrations: number;
  totalIntegrations: number;
  pilotIntegrations: number;
  disconnectedIntegrations: number;
}

export interface SettingsPayload {
  depts: SetDept[];
  permLevels: SetPermLevel[];
  users: SetUser[];
  roles: SetRole[];
  approvals: SetApproval[];
  integrations: SetIntegration[];
  kpis: SettingsKpis;
}

export const settingsApi = {
  getSettings: () => apiGet<SettingsPayload>("/settings"),
};
