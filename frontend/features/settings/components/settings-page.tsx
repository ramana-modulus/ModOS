"use client";

import { useState } from "react";
import { ViewTabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/features/settings/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { UsersTab } from "./tabs/users-tab";
import { RolesTab } from "./tabs/roles-tab";
import { ApprovalsTab } from "./tabs/approvals-tab";
import { IntegrationsTab } from "./tabs/integrations-tab";

type SetSub = "users" | "roles" | "approvals" | "integrations";

const TABS: { key: SetSub; label: string }[] = [
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles & Permissions" },
  { key: "approvals", label: "Approval Hierarchies" },
  { key: "integrations", label: "Integrations" },
];

export function SettingsPage() {
  const { data, loading, error } = useQuery(() => settingsApi.getSettings(), []);
  const [sub, setSub] = useState<SetSub>("users");

  if (loading || !data) return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading settings…"}</div>;
  const k = data.kpis;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Org header */}
      <div className="mb-3 flex items-center justify-between rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface px-3.5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-accent text-t16 font-bold text-white">M</div>
          <div>
            <div className="text-t13 font-semibold text-ink">Modulus Housing Pvt Ltd</div>
            <div className="text-t10 text-faint">GSTIN: 33AAFCM1234A1Z5 · CIN: U45200TN2020PTC123456 · Chennai, TN</div>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="text-right">
            <div className="text-t9 font-medium uppercase tracking-[0.5px] text-faint">Plan</div>
            <div className="text-t11 font-medium text-ink">MOD OS · Annual Subscription</div>
          </div>
          <Button variant="default" size="sm">Edit Org Profile</Button>
        </div>
      </div>

      {/* KPI bar */}
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-4">
        <div className="kp"><div className="kl">Users</div><div className="kv">{k.activeUsers}</div><div className="ks">{k.activeUsers} active · {k.invitedUsers} invited (pending)</div></div>
        <div className="kp"><div className="kl">Roles</div><div className="kv">{k.totalRoles}</div><div className="ks">{k.totalRoles - k.customRoles} system · {k.customRoles} custom</div></div>
        <div className="kp"><div className="kl">Approval Rules</div><div className="kv">{k.activeApprovals}</div><div className="ks">across {k.approvalModules} modules</div></div>
        <div className="kp"><div className="kl">Integrations</div><div className="kv cg">{k.connectedIntegrations}/{k.totalIntegrations}</div><div className="ks">{k.pilotIntegrations} in pilot · {k.disconnectedIntegrations} pending</div></div>
      </div>

      <ViewTabs items={TABS} value={sub} onChange={setSub} />

      <div className="-mx-3.5 min-h-0 flex-1 overflow-y-auto px-3.5 pb-3">
        {sub === "users" && <UsersTab users={data.users} roles={data.roles} />}
        {sub === "roles" && <RolesTab roles={data.roles} depts={data.depts} permLevels={data.permLevels} />}
        {sub === "approvals" && <ApprovalsTab approvals={data.approvals} roles={data.roles} />}
        {sub === "integrations" && <IntegrationsTab integrations={data.integrations} />}
      </div>
    </div>
  );
}
