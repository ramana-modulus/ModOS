"use client";

import type { Project } from "@/types/procurement";
import type { ScopeParams } from "@/features/procurement/api/types";

interface ProjectBarProps {
  projects: Project[];
  scope: ScopeParams;
  onChange: (scope: ScopeParams) => void;
}

/** Project pill row + meta + sub-project pill row (faithful to renderProcurement). */
export function ProjectBar({ projects, scope, onChange }: ProjectBarProps) {
  const project = projects.find((p) => p.id === scope.project);
  const subProjects = project?.subProjects ?? [];
  const sp = subProjects.find((s) => s.id === scope.subProject);

  return (
    <>
      {/* Project + meta */}
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
                  className={
                    "cursor-pointer rounded-[20px] border-[0.5px] px-2.5 py-1 text-t11 " +
                    (active
                      ? "border-accent bg-accent-soft font-medium text-accent"
                      : "border-input bg-surface text-muted")
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

      {/* Sub-project pills */}
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
    </>
  );
}
