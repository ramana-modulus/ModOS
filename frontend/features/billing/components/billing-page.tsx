"use client";

import { useState } from "react";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { billingApi, type BillingScope } from "@/features/billing/api";
import { ProjectBar } from "./project-bar";
import { KpiHeader } from "./kpi-header";
import { MeasurementTab } from "./tabs/measurement-tab";
import { ClientRaTab } from "./tabs/client-ra-tab";
import { VendorBillsTab } from "./tabs/vendor-bills-tab";
import { SubcRaTab } from "./tabs/subc-ra-tab";
import { RegisterTab } from "./tabs/register-tab";

type BillSub = "measure" | "client" | "vendor" | "subc" | "register";

const TABS: { key: BillSub; label: string }[] = [
  { key: "measure", label: "Measurement Book" },
  { key: "client", label: "Client RA Bills (Outgoing)" },
  { key: "vendor", label: "Vendor Bills" },
  { key: "subc", label: "Subcontractor RA (Incoming)" },
  { key: "register", label: "Bill Register & Ageing" },
];

export function BillingPage() {
  const [scope, setScope] = useState<BillingScope>({ project: "P1", subProject: "SP1" });
  const [tab, setTab] = useState<BillSub>("measure");

  const projectsQuery = useQuery(() => billingApi.getProjects(), []);
  const view = useQuery(() => billingApi.getBilling(scope), [scope.project, scope.subProject]);

  const projects = projectsQuery.data?.projects ?? [];
  const data = view.data;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProjectBar projects={projects} scope={scope} onChange={setScope} billingEngineer="Suresh" />

      {data && <KpiHeader kpis={data.kpis} />}

      {/* Sub-tabs */}
      <div className="vtabs mb-3">
        {TABS.map((t) => {
          const active = t.key === tab;
          const flag = t.key === "measure" && data && data.measurementFlagged > 0 ? data.measurementFlagged : null;
          const scMatched =
            t.key === "subc" && data ? data.scBills.filter((b) => b.status === "matched").length : 0;
          return (
            <div
              key={t.key}
              className={active ? "vt active" : "vt"}
              onClick={() => setTab(t.key)}
              role="tab"
              aria-selected={active}
            >
              {t.label}
              {flag != null && (
                <span
                  className="ml-1 rounded-lg px-1.5 py-px text-t9 font-semibold text-white"
                  style={{ background: "#A32D2D" }}
                >
                  {flag} ⚠
                </span>
              )}
              {scMatched > 0 && (
                <span className="ml-1 rounded-lg bg-accent px-1.5 py-px text-t9 font-semibold text-white">
                  {scMatched}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
        {view.loading && !data && (
          <div className="px-3.5 py-8 text-center text-t11 text-faint">{view.error ?? "Loading billing…"}</div>
        )}
        {data && tab === "measure" && <MeasurementTab data={data} />}
        {data && tab === "client" && <ClientRaTab data={data} />}
        {data && tab === "vendor" && <VendorBillsTab data={data} />}
        {data && tab === "subc" && <SubcRaTab data={data} />}
        {data && tab === "register" && <RegisterTab data={data} />}
      </div>
    </div>
  );
}
