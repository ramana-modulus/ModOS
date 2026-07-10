"use client";

import { OPS_TAB_GROUPS, type OpsTabKey } from "@/features/ops/tabs";

interface GroupedTabsProps {
  value: OpsTabKey;
  onChange: (key: OpsTabKey) => void;
  badges?: Partial<Record<OpsTabKey, { count: number; color: string }>>;
}

/** Workflow-phase-grouped sub-tab bar (Execution · Materials · Coordination · Closeout). */
export function GroupedTabs({ value, onChange, badges = {} }: GroupedTabsProps) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-x-3.5 gap-y-2 border-b border-line">
      {OPS_TAB_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <span className="pl-0.5 text-t85 font-medium uppercase tracking-[0.5px] text-faint">
            {group.title}
          </span>
          <div className="flex" role="tablist" aria-label={group.title}>
            {group.tabs.map((tab) => {
              const active = tab.key === value;
              const badge = badges[tab.key];
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onChange(tab.key)}
                  className={
                    "flex items-center gap-1 whitespace-nowrap border-b-2 px-3.5 py-2 text-t11 transition-colors " +
                    (active ? "border-accent font-medium text-accent" : "border-transparent text-muted hover:bg-canvas")
                  }
                >
                  {tab.label}
                  {badge && badge.count > 0 && (
                    <span
                      className="rounded-lg px-1.5 text-t9 font-semibold text-white"
                      style={{ background: badge.color }}
                    >
                      {badge.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
