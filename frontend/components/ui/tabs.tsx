"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem<K extends string = string> {
  key: K;
  label: ReactNode;
  count?: number;
}

interface ViewTabsProps<K extends string> {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  className?: string;
}

/** Underline tab bar (`.vtabs` / `.vt`). Controlled. */
export function ViewTabs<K extends string>({ items, value, onChange, className }: ViewTabsProps<K>) {
  return (
    <div
      role="tablist"
      className={cn(
        "mb-3 flex flex-shrink-0 overflow-x-auto border-b-[0.5px] border-line bg-surface",
        className
      )}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2 text-t11 transition-colors",
              active
                ? "border-accent font-medium text-accent"
                : "border-transparent text-muted hover:bg-canvas"
            )}
          >
            {item.label}
            {item.count != null && (
              <span
                className={cn(
                  "rounded-lg px-1.5 text-t9 font-semibold",
                  active ? "bg-accent-soft text-accent" : "bg-neutral-soft text-faint"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
