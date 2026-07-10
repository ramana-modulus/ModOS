"use client";

import { useState } from "react";
import { planningApi } from "@/features/planning/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { MetricStrip, type MetricCell } from "@/features/procurement/components/metric-strip";
import { Pill } from "@/components/ui/badge";
import { WbsGantt } from "./wbs-gantt";
import { KickoffMatrix } from "./kickoff-matrix";
import { ApprovalTab } from "./approval-tab";
import { SignoffTab } from "./signoff-tab";

type SubTab = "decisions" | "wbs" | "approval" | "kickoff";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "decisions", label: "Kickoff" },
  { key: "wbs", label: "Work Breakdown (WBS)" },
  { key: "approval", label: "Approval" },
  { key: "kickoff", label: "Signoff" },
];

export function PlanningPage() {
  const { data, loading, error } = useQuery(() => planningApi.getPlanning(), []);
  const [sub, setSub] = useState<SubTab>("wbs");

  if (loading || !data) {
    return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading plan…"}</div>;
  }

  const { project, subProjects, plan, planPill, signoffStatus, kpis } = data;
  const curSp = subProjects[0];

  const cells: MetricCell[] = [
    {
      label: "Plan Status",
      value: (
        <Pill cls={planPill.cls} className="align-[2px] text-t12">
          {planPill.label}
        </Pill>
      ),
    },
    ...kpis.map<MetricCell>((k) => ({ label: k.label, value: k.value, color: k.color, sub: k.sub })),
    {
      label: "Signoff",
      value: <span className="text-t13">{signoffStatus}</span>,
      color: plan.status === "approved" ? "#C84B2F" : "#6B6A68",
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <MetricStrip cells={cells} />

      {/* Project pill selector (single awarded demo project) */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-t11 text-faint">Project:</span>
          <div className="rounded-[20px] border-[0.5px] border-accent bg-accent-soft px-2.5 py-1 text-t11 font-medium text-accent">
            {project.name}
          </div>
        </div>
        <div className="text-t10 text-faint">
          {project.code} · {project.client} · {project.value}
        </div>
      </div>

      {/* Sub-project strip */}
      {subProjects.length > 1 && curSp && (
        <div className="mb-2 flex items-center gap-2 rounded-md border-[0.5px] border-dashed border-line bg-canvas px-2.5 py-[5px]">
          <span className="text-t10 uppercase tracking-[0.5px] text-faint">Sub-project:</span>
          <div className="flex flex-wrap gap-1">
            {subProjects.map((s, i) => (
              <div
                key={s.id}
                className={
                  "rounded-[14px] px-3 py-1 text-t11 " +
                  (i === 0 ? "bg-ink font-medium text-white" : "border-[0.5px] border-line bg-surface text-muted")
                }
              >
                {s.name} <span className="text-t10 opacity-60">×{s.units}</span>
              </div>
            ))}
          </div>
          <div className="ml-auto text-t10 text-faint">{curSp.spec}</div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="vtabs mb-2">
        {SUB_TABS.map((t) => (
          <div key={t.key} className={`vt${sub === t.key ? " active" : ""}`} onClick={() => setSub(t.key)}>
            {t.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div
        className={
          sub === "wbs" ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "flex-1 overflow-y-auto py-1"
        }
      >
        {sub === "decisions" && <KickoffMatrix matrix={data.kickoffMatrix} />}
        {sub === "wbs" && <WbsGantt wbs={data.wbs} deptMeta={data.deptMeta} plan={plan} approval={data.approval} />}
        {sub === "approval" && <ApprovalTab approval={data.approval} />}
        {sub === "kickoff" && <SignoffTab signoff={data.signoff} client={project.client} />}
      </div>
    </div>
  );
}
