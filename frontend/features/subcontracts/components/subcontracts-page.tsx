"use client";

import { useState } from "react";
import { MetricStrip } from "@/features/procurement/components/metric-strip";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { subcontractsApi, type ScScopeParams } from "@/features/subcontracts/api";
import { PackagesTab } from "./tabs/packages-tab";
import { EnquiriesTab } from "./tabs/enquiries-tab";
import { ComparativeTab } from "./tabs/comparative-tab";
import { WorkOrdersTab } from "./tabs/work-orders-tab";
import { MeasurementTab } from "./tabs/measurement-tab";
import { BillsTab } from "./tabs/bills-tab";
import { BillStatusTab } from "./tabs/bill-status-tab";
import { SubbiesTab } from "./tabs/subbies-tab";
import { DocsTab } from "./tabs/docs-tab";
import { WorkflowTab } from "./tabs/workflow-tab";

export type ScTabKey =
  | "packages"
  | "enquiries"
  | "comparative"
  | "workorders"
  | "measurement"
  | "bills"
  | "billstatus"
  | "subbies"
  | "docs"
  | "workflow";

const TAB_GROUPS: { label: string; tabs: [ScTabKey, string][] }[] = [
  { label: "Pre-WO", tabs: [["packages", "Work Packages"], ["enquiries", "Enquiries"], ["comparative", "Comparative / L1"]] },
  { label: "WO Lifecycle", tabs: [["workorders", "Work Orders"], ["measurement", "Measurement (RA)"], ["bills", "SC Bills"], ["billstatus", "Bill Status"]] },
  { label: "Reference", tabs: [["subbies", "Subcontractors"], ["docs", "Docs"], ["workflow", "Approval Workflow"]] },
];

export function SubcontractsPage() {
  const [scope, setScope] = useState<ScScopeParams>({ project: "P1", subProject: "SP1" });
  const [tab, setTab] = useState<ScTabKey>("packages");

  const query = useQuery(() => subcontractsApi.getSubcontracts(scope), [scope.project, scope.subProject]);
  const data = query.data;
  const projects = data?.projects ?? [];
  const project = projects.find((p) => p.id === scope.project);
  const subProjects = project?.subProjects ?? [];
  const sp = subProjects.find((s) => s.id === scope.subProject);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Project bar */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-t11 text-faint">Project:</span>
          <div className="flex flex-wrap gap-1">
            {projects.map((p) => {
              const active = p.id === scope.project;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setScope({ project: p.id, subProject: p.subProjects[0]?.id ?? "SP1" })}
                  className={
                    "cursor-pointer rounded-[20px] border-[0.5px] px-2.5 py-1 text-t11 " +
                    (active ? "border-accent bg-accent-soft font-medium text-accent" : "border-input bg-surface text-muted")
                  }
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
        {project && (
          <div className="text-t10 text-faint">
            {project.code} · {project.client} · {project.type}
          </div>
        )}
      </div>

      {/* Sub-project bar */}
      {subProjects.length > 1 && (
        <div className="mb-2 flex items-center gap-2 rounded-md border-[0.5px] border-dashed border-input bg-[#FBF9F6] px-2.5 py-[5px]">
          <span className="text-t10 font-medium uppercase tracking-[0.5px] text-faint">Sub-project:</span>
          <div className="flex flex-wrap gap-1">
            {subProjects.map((s) => {
              const active = s.id === scope.subProject;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScope({ project: scope.project, subProject: s.id })}
                  className={
                    "cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11 " +
                    (active ? "border-ink bg-ink font-medium text-white" : "border-input bg-surface text-ink-soft")
                  }
                >
                  {s.name} <span className="text-t10 opacity-60">×{s.units}</span>
                </button>
              );
            })}
          </div>
          <div className="ml-auto text-t10 text-faint">{sp?.spec ?? ""}</div>
        </div>
      )}

      {data && <MetricStrip cells={data.kpis} />}

      {/* Grouped tab bar */}
      <div className="mb-2 flex flex-wrap items-end gap-3.5 border-b border-[#E8E7E4] pb-0">
        {TAB_GROUPS.map((g) => (
          <div key={g.label} className="flex flex-col gap-0.5">
            <span className="pl-0.5 text-t9 font-medium uppercase tracking-[0.5px] text-faint">{g.label}</span>
            <div className="vtabs m-0 border-b-0">
              {g.tabs.map(([key, label]) => (
                <div key={key} className={"vt" + (tab === key ? " active" : "")} onClick={() => setTab(key)}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
        {query.loading && <div className="p-6 text-t11 text-faint">Loading subcontracts…</div>}
        {query.error && <div className="p-6 text-t11 text-danger">{query.error}</div>}
        {/* Subcontractors + Docs are department-wide — available even before kickoff sign-off. */}
        {data && !data.signed && tab !== "subbies" && tab !== "docs" && (
          <div className="rounded-lg border-[0.5px] border-dashed border-input bg-[#FBF9F6] p-8 text-center text-t12 text-muted">
            Subcontract packages are defined by the <strong>Planning kickoff</strong> make-vs-buy gate. This sub-project&rsquo;s kickoff is
            not yet signed off. Only <strong>Oragadam · Porta Cabin A</strong> has a signed kickoff in this demo.
          </div>
        )}
        {data && (data.signed || tab === "subbies" || tab === "docs") && (
          <>
            {data.signed && tab === "packages" && <PackagesTab data={data.packages} />}
            {data.signed && tab === "enquiries" && <EnquiriesTab data={data.enquiries} />}
            {data.signed && tab === "comparative" && <ComparativeTab data={data.comparative} />}
            {data.signed && tab === "workorders" && <WorkOrdersTab data={data.workOrders} />}
            {data.signed && tab === "measurement" && <MeasurementTab data={data.measurement} />}
            {data.signed && tab === "bills" && <BillsTab data={data.bills} />}
            {data.signed && tab === "billstatus" && <BillStatusTab data={data.billStatus} />}
            {tab === "subbies" && <SubbiesTab data={data.subbies} />}
            {tab === "docs" && <DocsTab data={data.docs} />}
            {data.signed && tab === "workflow" && <WorkflowTab data={data.workflow} />}
          </>
        )}
      </div>
    </div>
  );
}
