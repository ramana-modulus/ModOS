"use client";

import type { Project } from "@/types/procurement";
import type { ScopeParams } from "@/features/procurement/api/types";
import { FilterChip } from "@/components/ui/filter-chip";

interface ProjectSwitcherProps {
  projects: Project[];
  scope: ScopeParams;
  onChange: (scope: ScopeParams) => void;
}

/** Project dropdown + sub-project chips. Aggregation never spans sub-projects. */
export function ProjectSwitcher({ projects, scope, onChange }: ProjectSwitcherProps) {
  const project = projects.find((p) => p.id === scope.project) ?? projects[0];
  const subProjects = project?.subProjects ?? [];

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="proc-project">
        Project
      </label>
      <select
        id="proc-project"
        value={scope.project}
        onChange={(e) => {
          const next = projects.find((p) => p.id === e.target.value);
          const firstSub = next?.subProjects?.[0]?.id ?? "SP1";
          onChange({ project: e.target.value, subProject: firstSub });
        }}
        className="rounded-md border-[0.5px] border-input bg-surface px-2 py-[5px] text-t11 text-ink"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.code} · {p.name}
          </option>
        ))}
      </select>

      {subProjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {subProjects.map((sp) => (
            <FilterChip
              key={sp.id}
              active={sp.id === scope.subProject}
              onClick={() => onChange({ project: scope.project, subProject: sp.id })}
            >
              {sp.name}
              <span className="text-t9 opacity-70">· {sp.units}u</span>
            </FilterChip>
          ))}
        </div>
      )}
    </div>
  );
}
