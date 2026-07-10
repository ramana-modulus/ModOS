"use client";

import { useState, type ReactNode } from "react";
import { procurementApi } from "@/features/procurement/api/client";
import type { ScopeParams } from "@/features/procurement/api/types";
import { useQuery } from "@/features/procurement/hooks/use-query";
import type { ProcurementSummary } from "@/types/procurement";
import { fmtC } from "@/lib/format";
import type { ProcurementTabKey } from "@/features/procurement/tabs";
import { ProjectBar } from "./project-bar";
import { GroupedTabs } from "./grouped-tabs";
import { MetricStrip, type MetricCell } from "./metric-strip";
import { BomTab } from "./tabs/bom-tab";
import { RfqTab } from "./tabs/rfq-tab";
import { QuotesTab } from "./tabs/quotes-tab";
import { PosTab } from "./tabs/pos-tab";
import { GrnTab } from "./tabs/grn-tab";
import { BillsTab } from "./tabs/bills-tab";
import { VendorsTab } from "./tabs/vendors-tab";
import { ResupplyTab } from "./tabs/resupply-tab";
import { ReleaseLogTab } from "./tabs/release-log-tab";
import { DocsTab } from "./tabs/docs-tab";
import { WorkflowTab } from "./tabs/workflow-tab";

const GREEN = "#3B6D11";
const ACCENT = "#C84B2F";
const RED = "#A32D2D";
const AMBER = "#854F0B";
const FAINT = "#9B9894";

function leadCell(buckets: ProcurementSummary["leadBuckets"]): ReactNode {
  const dot = <span style={{ color: "#D8D7D4", fontSize: 13 }}> · </span>;
  return (
    <>
      <span style={{ color: GREEN }} title="0–5 days">
        {buckets.fast}
      </span>
      {dot}
      <span style={{ color: AMBER }} title="5–10 days">
        {buckets.medium}
      </span>
      {dot}
      <span style={{ color: RED }} title="10+ days">
        {buckets.slow}
      </span>
      {buckets.unknown > 0 && (
        <>
          <span style={{ color: FAINT, fontSize: 13 }}> · {buckets.unknown}</span>
        </>
      )}
    </>
  );
}

function buildMetricCells(s: ProcurementSummary): MetricCell[] {
  const rv = Math.abs(s.maxRateVar);
  return [
    { label: "BOM Items", value: `${s.totalItems}`, sub: `${s.rateConfirmed} confirmed` },
    {
      label: "Rate Var vs Budget",
      value: `${s.maxRateVar >= 0 ? "+" : ""}${s.maxRateVar.toFixed(1)}%`,
      color: rv < 5 ? GREEN : rv <= 12 ? ACCENT : RED,
      sub: `net ${s.totalRateImpact >= 0 ? "+" : "-"}₹${fmtC(Math.round(Math.abs(s.totalRateImpact) / 1000))}K`,
    },
    { label: "Lead Time (0–5·5–10·10+)", value: leadCell(s.leadBuckets) },
    { label: "RC Coverage", value: `${s.rcCovered}/${s.totalItems}`, color: s.rcCovered > 0 ? GREEN : ACCENT, sub: "rate contract" },
    { label: "POs Raised", value: `${s.posRaised}/${s.totalItems}`, sub: `₹${fmtC(Math.round(s.committedValue / 100000))}L` },
    {
      label: "GRN Coverage",
      value: `${s.posFullGRN}/${s.posRaised}`,
      color: s.posRaised > 0 && s.posFullGRN === s.posRaised ? GREEN : ACCENT,
      sub: `${s.posPartialGRN} part`,
    },
    { label: "AP → Finance", value: `${s.apPending}`, color: s.apPending > 0 ? RED : GREEN, sub: `₹${fmtC(Math.round(s.apForwardedValue / 1000))}K fwd` },
  ];
}

export function ProcurementPage() {
  const [scope, setScope] = useState<ScopeParams>({ project: "P1", subProject: "SP1" });
  const [tab, setTab] = useState<ProcurementTabKey>("bom");

  const projectsQuery = useQuery(() => procurementApi.getProjects(), []);
  const bomQuery = useQuery(() => procurementApi.getBom(scope), [scope.project, scope.subProject]);

  const projects = projectsQuery.data?.projects ?? [];
  const subProjectName =
    projects.find((p) => p.id === scope.project)?.subProjects?.find((s) => s.id === scope.subProject)?.name ??
    "this sub-project";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProjectBar projects={projects} scope={scope} onChange={setScope} />

      {bomQuery.data && <MetricStrip cells={buildMetricCells(bomQuery.data.summary)} />}

      <GroupedTabs value={tab} onChange={setTab} />

      <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
        {tab === "bom" && (
          <BomTab data={bomQuery.data} subProjectName={subProjectName} loading={bomQuery.loading} error={bomQuery.error} />
        )}
        {tab === "rfq" && <RfqTab scope={scope} onGoToQuotes={() => setTab("quotes")} />}
        {tab === "quotes" && <QuotesTab scope={scope} />}
        {tab === "pos" && <PosTab scope={scope} />}
        {tab === "grn" && <GrnTab scope={scope} />}
        {tab === "bills" && <BillsTab scope={scope} />}
        {tab === "resupply" && <ResupplyTab />}
        {tab === "vendors" && <VendorsTab />}
        {tab === "releaselog" && <ReleaseLogTab scope={scope} />}
        {tab === "docs" && <DocsTab scope={scope} />}
        {tab === "workflow" && <WorkflowTab scope={scope} />}
      </div>
    </div>
  );
}
