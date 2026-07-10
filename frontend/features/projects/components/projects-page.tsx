"use client";

import { useState } from "react";
import type { Project } from "@/types/procurement";
import type { PlanningStatus } from "@/features/projects/types";
import { Pill } from "@/components/ui/badge";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { projectsApi } from "@/features/projects/api";
import { stagePillClass } from "@/features/projects/domain";
import { ProjectOverview } from "./project-overview";
import { CashflowSchedule } from "./cashflow-schedule";

type ProjTab = "overview" | "cashflow";

const PLAN_PILL: Record<PlanningStatus, { cls: "pg" | "pa" | "pr" | "pgr"; label: string }> = {
  draft: { cls: "pgr", label: "Draft" },
  submitted: { cls: "pa", label: "Submitted to Client" },
  approved: { cls: "pg", label: "Client Approved" },
  rejected: { cls: "pr", label: "Rejected" },
};

/** Minimal overview for projects without extended ERP data (P2–P5). */
function FallbackOverview({
  proj,
  planStatus,
  onSelectP1,
}: {
  proj: Project;
  planStatus: PlanningStatus;
  onSelectP1: () => void;
}) {
  const plan = PLAN_PILL[planStatus];
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="kp"><div className="kl">Project Name</div><div className="kv" style={{ fontSize: 14 }}>{proj.name}</div><div className="ks">{proj.code}</div></div>
        <div className="kp"><div className="kl">Client</div><div className="kv" style={{ fontSize: 14 }}>{proj.client}</div><div className="ks">{proj.type}</div></div>
        <div className="kp"><div className="kl">Value</div><div className="kv cac">{proj.value}</div><div className="ks">estimated</div></div>
        <div className="kp"><div className="kl">Stage</div><div className="kv" style={{ fontSize: 13 }}>{proj.stage}</div><div className="ks">{proj.startDate ? `Started: ${proj.startDate}` : "Not yet started"}</div></div>
        <div className="kp"><div className="kl">Duration</div><div className="kv">{proj.duration} days</div><div className="ks">planned</div></div>
        <div className="kp"><div className="kl">Planning Status</div><div className="kv" style={{ fontSize: 13 }}><Pill cls={plan.cls}>{plan.label}</Pill></div><div className="ks">Awaiting setup</div></div>
      </div>
      <div style={{ marginTop: 12, padding: "10px 12px", background: "#FAEEDA", borderRadius: 6, fontSize: 11, color: "#854F0B" }}>
        ⚠ Detailed project data not yet populated. Use this project to test BD → Estimation flow. Full ERP overview available for{" "}
        <span onClick={onSelectP1} style={{ color: "var(--ac)", cursor: "pointer", fontWeight: 600 }}>Oragadam Warehouse →</span>
      </div>
    </>
  );
}

export function ProjectsPage() {
  const { data, loading, error } = useQuery(() => projectsApi.getProjects(), []);
  const [curProjId, setCurProjId] = useState("P1");
  const [curProjTab, setCurProjTab] = useState<ProjTab>("overview");

  if (loading || !data) {
    return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading projects…"}</div>;
  }

  const { projects, portfolio, planning, overviews } = data;
  const proj = projects.find((p) => p.id === curProjId) ?? projects[0]!;
  const overview = overviews[proj.id] ?? null;
  const planStatus = planning[proj.id]?.status ?? "draft";

  const selectProject = (id: string) => {
    setCurProjId(id);
    setCurProjTab("overview");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Portfolio KPI strip */}
      <div className="kr" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 10 }}>
        <div className="kp" style={{ padding: "6px 9px" }}><div className="kl">Total Projects</div><div className="kv" style={{ fontSize: 14 }}>{portfolio.total}</div><div className="ks">all stages</div></div>
        <div className="kp" style={{ padding: "6px 9px" }}><div className="kl">In Execution</div><div className="kv cg" style={{ fontSize: 14 }}>{portfolio.inExecution}</div><div className="ks">on-site / active</div></div>
        <div className="kp" style={{ padding: "6px 9px" }}><div className="kl">Portfolio Value</div><div className="kv" style={{ fontSize: 14 }}>{portfolio.portfolioValue}</div><div className="ks">awarded</div></div>
        <div className="kp" style={{ padding: "6px 9px" }}><div className="kl">Plans Approved</div><div className="kv cac" style={{ fontSize: 14 }}>{portfolio.plansApproved}</div><div className="ks">of {portfolio.awardedCount} awarded</div></div>
      </div>

      {/* List + detail */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 12, alignItems: "start", overflow: "hidden", flex: 1, minHeight: 0 }}>
        {/* Left: project list */}
        <div style={{ overflowY: "auto", height: "100%" }}>
          {projects.map((p) => (
            <div key={p.id} className={`proj-list-card${curProjId === p.id ? " active" : ""}`} onClick={() => selectProject(p.id)}>
              <div className="proj-avatar" style={{ background: p.awarded ? "#1A1917" : "#9B9894" }}>{p.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1917" }}>{p.name}</div>
                <div style={{ fontSize: 9, color: "#9B9894", fontFamily: "monospace" }}>{p.code}</div>
                <div style={{ fontSize: 10, color: "#6B6A68" }}>{p.client}</div>
                <div style={{ marginTop: 3 }}>
                  <Pill cls={stagePillClass(p.stage)}>{p.stage}</Pill> <span style={{ fontSize: 9, color: "#9B9894" }}>{p.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: project detail */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, flex: 1, height: "100%" }}>
          <div className="vtabs" style={{ marginBottom: 10 }}>
            <div className={`vt${curProjTab === "overview" ? " active" : ""}`} onClick={() => setCurProjTab("overview")}>Overview</div>
            <div className={`vt${curProjTab === "cashflow" ? " active" : ""}`} onClick={() => setCurProjTab("cashflow")}>Cashflow Schedule</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
            {curProjTab === "overview" ? (
              overview ? (
                <ProjectOverview proj={proj} overview={overview} onOpenCashflow={() => setCurProjTab("cashflow")} />
              ) : (
                <FallbackOverview proj={proj} planStatus={planStatus} onSelectP1={() => selectProject("P1")} />
              )
            ) : (
              <CashflowSchedule cf={overview?.cashflow ?? null} awarded={proj.awarded} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
