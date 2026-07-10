"use client";

import type { BillProject } from "@/features/billing/types";
import type { BillingScope } from "@/features/billing/api";

interface ProjectBarProps {
  projects: BillProject[];
  scope: BillingScope;
  onChange: (scope: BillingScope) => void;
  billingEngineer: string;
}

/** Project pill row + sub-project pills (faithful to renderBilling's header). */
export function ProjectBar({ projects, scope, onChange, billingEngineer }: ProjectBarProps) {
  const project = projects.find((p) => p.id === scope.project);
  const subProjects = project?.subProjects ?? [];

  return (
    <>
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
                  onClick={() => onChange({ project: p.id, subProject: p.subProjects?.[0]?.id ?? "SP1" })}
                  className="cursor-pointer rounded-[20px] border-[0.5px] px-2.5 py-1 text-t11"
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
        {project && (
          <div className="text-t10 text-faint">
            {project.code} · {project.client} · Billing Engg: {billingEngineer}
          </div>
        )}
      </div>

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
                  onClick={() => onChange({ project: scope.project, subProject: s.id })}
                  className="cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11"
                  style={{
                    borderColor: active ? "#1A1917" : "#D8D7D4",
                    background: active ? "#1A1917" : "#fff",
                    color: active ? "#fff" : "#4A4945",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {s.name} <span className="text-t10 opacity-60">×{s.units}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
