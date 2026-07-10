"use client";

import { useState } from "react";
import { opsApi } from "@/features/ops/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { fmtQ } from "@/lib/format";
import type { OpsTabKey } from "@/features/ops/tabs";
import { ProjectBar } from "./project-bar";
import { GroupedTabs } from "./grouped-tabs";
import { ScopeTab } from "./tabs/scope-tab";
import { ReportsTab } from "./tabs/reports-tab";
import { SiteLogTab } from "./tabs/sitelog-tab";
import { GrnTab } from "./tabs/grn-tab";
import { StoreTab } from "./tabs/store-tab";
import { BillsTab } from "./tabs/bills-tab";
import { IncomingTab } from "./tabs/incoming-tab";
import { IndentsTab } from "./tabs/indents-tab";
import { QcReqTab } from "./tabs/qcreq-tab";
import { HandoverTab } from "./tabs/handover-tab";

function Kpi({ label, value, sub, tone }: { label: string; value: string | number; sub: React.ReactNode; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

export function OpsPage() {
  const [scope, setScope] = useState({ project: "P1", subProject: "SP1" });
  const [tab, setTab] = useState<OpsTabKey>("scope");

  const { data, loading, error } = useQuery(
    () => opsApi.getOps(scope),
    [scope.project, scope.subProject]
  );

  if (loading || !data) {
    return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading site operations…"}</div>;
  }

  const { kpis, badges } = data;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProjectBar projects={data.projects} project={data.project} scope={scope} onChange={setScope} />

      {/* KPI bar */}
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi
          label="Execution Progress"
          value={`${kpis.progressPct}%`}
          sub={`${fmtQ(kpis.done)} of ${fmtQ(kpis.plan)} (rolled up from DPR)`}
          tone={kpis.progressPct >= 50 ? "cg" : kpis.progressPct >= 25 ? "cac" : "ca"}
        />
        <Kpi label="Lines In Execution" value={kpis.linesActive} sub={`${kpis.totalLines} lines in scope`} />
        <Kpi
          label="Open Hindrances"
          value={kpis.hindOpen}
          sub={kpis.hindOpen > 0 ? "awaiting resolution" : "site clear"}
          tone={kpis.hindOpen > 0 ? "ca" : "cg"}
        />
        <Kpi
          label="Indents Pending"
          value={kpis.indentsPending}
          sub={kpis.indentsBreached > 0 ? <span className="text-danger">{kpis.indentsBreached} SLA breached</span> : "all within SLA"}
          tone={kpis.indentsPending > 0 ? "ca" : "cg"}
        />
        <Kpi label="QC Requests Open" value={kpis.qcOpen} sub="unblocks RA billing" tone={kpis.qcOpen > 0 ? "cac" : "cg"} />
      </div>

      <GroupedTabs
        value={tab}
        onChange={setTab}
        badges={{
          indents: { count: badges.indents, color: "var(--ac)" },
          sitelog: { count: badges.sitelog, color: "#A32D2D" },
          qcreq: { count: badges.qcreq, color: "#854F0B" },
        }}
      />

      <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
        {tab === "scope" && <ScopeTab data={data} />}
        {tab === "reports" && <ReportsTab data={data} />}
        {tab === "sitelog" && <SiteLogTab data={data} />}
        {tab === "grn" && <GrnTab data={data} />}
        {tab === "store" && <StoreTab data={data} />}
        {tab === "bills" && <BillsTab data={data} />}
        {tab === "incoming" && <IncomingTab data={data} />}
        {tab === "indents" && <IndentsTab data={data} />}
        {tab === "qcreq" && <QcReqTab data={data} />}
        {tab === "handover" && <HandoverTab data={data} />}
      </div>
    </div>
  );
}
