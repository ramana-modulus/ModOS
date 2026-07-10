import "server-only";
import {
  SET_APPROVALS,
  SET_DEPTS,
  SET_INTEGRATIONS,
  SET_PERM_LEVELS,
  SET_ROLES,
  SET_USERS,
} from "@/features/settings/data";
import type { SettingsPayload } from "@/features/settings/api";

export function getSettings(): SettingsPayload {
  return {
    depts: SET_DEPTS,
    permLevels: SET_PERM_LEVELS,
    users: SET_USERS,
    roles: SET_ROLES,
    approvals: SET_APPROVALS,
    integrations: SET_INTEGRATIONS,
    kpis: {
      activeUsers: SET_USERS.filter((u) => u.status === "active").length,
      invitedUsers: SET_USERS.filter((u) => u.status === "invited").length,
      totalRoles: SET_ROLES.length,
      customRoles: SET_ROLES.filter((r) => r.type === "custom").length,
      activeApprovals: SET_APPROVALS.filter((a) => a.active).length,
      approvalModules: new Set(SET_APPROVALS.map((a) => a.module)).size,
      connectedIntegrations: SET_INTEGRATIONS.filter((i) => i.status === "connected").length,
      totalIntegrations: SET_INTEGRATIONS.length,
      pilotIntegrations: SET_INTEGRATIONS.filter((i) => i.status === "pilot").length,
      disconnectedIntegrations: SET_INTEGRATIONS.filter((i) => i.status === "disconnected").length,
    },
  };
}
