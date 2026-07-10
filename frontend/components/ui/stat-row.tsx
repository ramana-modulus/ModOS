import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Stat {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}

/** Horizontal segmented stat strip (`.stat-row` / `.sc`). */
export function StatRow({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap overflow-hidden rounded-lg border-[0.5px] border-line sm:flex-nowrap",
        className
      )}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 border-line bg-surface px-3 py-2.5 [&:not(:last-child)]:border-r-[0.5px] min-w-[45%] sm:min-w-0",
            s.className
          )}
        >
          <div className="mb-[3px] text-t9 uppercase tracking-[0.5px] text-faint">{s.label}</div>
          <div className="text-t15 font-semibold text-ink">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
