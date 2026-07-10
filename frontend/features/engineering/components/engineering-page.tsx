"use client";

import { useState } from "react";
import { engineeringApi } from "@/features/engineering/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { MetricStrip, type MetricCell } from "@/features/procurement/components/metric-strip";
import { ViewTabs, type TabItem } from "@/components/ui/tabs";
import type { EngKpis } from "@/features/engineering/types";
import { IncomingTab } from "./incoming-tab";
import { DrawingsTab } from "./drawings-tab";
import { BomTab } from "./bom-tab";
import { ApprovalTab } from "./approval-tab";
import { VersionsTab } from "./versions-tab";
import { DocsTab } from "./docs-tab";

type EngTab = "incoming" | "drawings" | "bom" | "workflow" | "versions" | "docs";

const GREEN = "#3B6D11";
const AMBER = "#854F0B";
const RED = "#A32D2D";
const ACCENT = "#C84B2F";

function kpiCells(k: EngKpis): MetricCell[] {
  const vettingColor = k.vettingTone === "cg" ? GREEN : k.vettingTone === "ca" ? AMBER : k.vettingTone === "cr" ? RED : "#6B6A68";
  return [
    { label: "Drawings", value: `${k.drawings}`, sub: `${k.stagesDone}/${k.stagesTotal} stages` },
    {
      label: "BOM Items",
      value: `${k.bomApproved}/${k.bomTotal}`,
      color: k.bomApproved === k.bomTotal && k.bomTotal > 0 ? GREEN : ACCENT,
      sub: "approved",
    },
    {
      label: "Qty Variance",
      value: `${k.reworkedItems}/${k.bomTotal}`,
      color: Math.abs(k.maxVar) >= 5 ? AMBER : GREEN,
      sub: `reworked · max ${k.maxVar >= 0 ? "+" : ""}${k.maxVar.toFixed(1)}%`,
    },
    {
      label: "Open RFI / RFC",
      value: `${k.totalRfi} · ${k.totalRfc}`,
      color: k.totalRfi + k.totalRfc > 0 ? RED : GREEN,
      sub: "clarif · changes",
    },
    { label: "External Vetting", value: k.vettingLabel, color: vettingColor },
  ];
}

export function EngineeringPage() {
  const [scope, setScope] = useState({ project: "P1", subProject: "SP1" });
  const [tab, setTab] = useState<EngTab>("incoming");

  const { data, loading, error } = useQuery(
    () => engineeringApi.getEngineering(scope.project, scope.subProject),
    [scope.project, scope.subProject],
  );

  if (loading || !data) {
    return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading engineering…"}</div>;
  }

  const { projects, project, subProject, kpis, queueCounts } = data;
  const subProjects = project.subProjects ?? [];

  const setProject = (projId: string) => {
    const p = projects.find((x) => x.id === projId);
    const firstSp = p?.subProjects?.[0]?.id ?? "SP1";
    setScope({ project: projId, subProject: firstSp });
  };

  const tabs: TabItem<EngTab>[] = [
    { key: "incoming", label: "📥 Incoming Docs" },
    { key: "drawings", label: "Drawings" },
    { key: "bom", label: "BOQ & BOM" },
    { key: "workflow", label: "Approval Workflow", count: queueCounts.boq + queueCounts.drawing || undefined },
    { key: "versions", label: "Versions" },
    { key: "docs", label: "Engg. Docs" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Project context bar */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-t10 text-faint">Project:</span>
          <div className="flex flex-wrap gap-1">
            {projects.map((p) => {
              const active = p.id === scope.project;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProject(p.id)}
                  className="cursor-pointer rounded-[20px] border-[0.5px] px-2.5 py-1 text-t10"
                  style={{
                    borderColor: active ? "var(--ac)" : "#D8D7D4",
                    background: active ? "var(--ac-lt)" : "#fff",
                    color: active ? "var(--ac)" : "#6B6A68",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-t9 text-faint">
          {project.code} · {project.client} · {project.type}
        </div>
      </div>

      {/* Sub-project pills */}
      {subProjects.length > 1 && (
        <div className="mb-2 flex items-center gap-2 rounded-md border-[0.5px] border-dashed border-line bg-canvas px-2.5 py-1.5">
          <span className="text-t9 font-medium uppercase tracking-[0.5px] text-faint">Sub-project:</span>
          <div className="flex flex-wrap gap-1">
            {subProjects.map((s) => {
              const active = s.id === scope.subProject;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScope((sc) => ({ ...sc, subProject: s.id }))}
                  className="cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t10"
                  style={{
                    borderColor: active ? "#1A1917" : "#D8D7D4",
                    background: active ? "#1A1917" : "#fff",
                    color: active ? "#fff" : "#4A4945",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {s.name} <span className="text-t9 opacity-60">×{s.units}</span>
                </button>
              );
            })}
          </div>
          <div className="ml-auto text-t9 text-faint">{subProject?.spec ?? ""}</div>
        </div>
      )}

      <MetricStrip cells={kpiCells(kpis)} />

      <ViewTabs items={tabs} value={tab} onChange={setTab} />

      <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
        {tab === "incoming" && <IncomingTab data={data} />}
        {tab === "drawings" && <DrawingsTab data={data} />}
        {tab === "bom" && <BomTab data={data} />}
        {tab === "workflow" && <ApprovalTab data={data} />}
        {tab === "versions" && <VersionsTab data={data} />}
        {tab === "docs" && <DocsTab data={data} />}
      </div>
    </div>
  );
}
