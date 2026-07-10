/** Settings domain models — faithful to the `SET_*` stores. */

export interface SetDept {
  id: string;
  name: string;
}

export interface SetPermLevel {
  id: string;
  label: string;
  color: string;
  bg: string;
}

export type UserStatus = "active" | "invited" | "disabled";

export interface SetUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  status: UserStatus;
  joinedOn: string;
  lastActive?: string | null;
  inviteSentOn?: string | null;
}

export interface SetRole {
  id: string;
  name: string;
  type: "system" | "custom";
  description: string;
  userCount: number;
  perms: Record<string, string>;
}

export interface SetApproval {
  id: string;
  module: string;
  trigger: string;
  approvers: string[];
  slaHrs: number;
  escalation: string | null;
  active: boolean;
  note?: string;
}

export type IntegrationStatus = "connected" | "pilot" | "disconnected";

export interface SetIntegration {
  id: string;
  name: string;
  icon: string;
  category: string;
  status: IntegrationStatus;
  lastSync?: string | null;
  syncFreq: string;
  scope: string;
  authType: string;
  authUser?: string;
  note?: string;
}
