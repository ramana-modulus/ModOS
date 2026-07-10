import type { ReactNode } from "react";

export interface MetricCell {
  label: string;
  value: ReactNode;
  /** Value colour (hex from the wireframe palette). */
  color?: string;
  sub?: ReactNode;
}

/**
 * The 7-cell bordered metric strip (`metricStrip`) — a single rounded card with
 * hairline-divided cells. Faithful to the prototype's inline markup.
 */
export function MetricStrip({ cells }: { cells: MetricCell[] }) {
  return (
    <div className="mb-2 flex flex-shrink-0 overflow-hidden rounded-lg border-[0.5px] border-line bg-surface">
      {cells.map((c, i) => (
        <div
          key={i}
          className={
            "flex-1 bg-surface px-3 py-2 " + (i === cells.length - 1 ? "" : "border-r-[0.5px] border-line")
          }
        >
          <div className="mb-0.5 truncate whitespace-nowrap text-t9 uppercase tracking-[0.5px] text-faint">
            {c.label}
          </div>
          <div className="text-t20 font-bold leading-[1.1]" style={{ color: c.color ?? "#1A1917" }}>
            {c.value}
            {c.sub != null && <span className="ml-1 text-t9 font-normal text-faint">{c.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
