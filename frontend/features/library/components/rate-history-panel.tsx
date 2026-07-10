"use client";

import { IconArrowDownRight, IconArrowUpRight, IconRobot, IconUser } from "@tabler/icons-react";
import type { LibHistoryEntry } from "@/features/library/types";

/** Rate change trail for a library code (`openLibRateHistory`). */
export function RateHistoryPanel({ entries }: { entries: LibHistoryEntry[] }) {
  if (entries.length === 0) return <p className="py-2 text-t10 text-faint">No rate history recorded.</p>;
  return (
    <div className="space-y-2">
      {entries.map((e, i) => {
        const up = e.delta > 0;
        return (
          <div key={i} className="rounded-md border-[0.5px] border-line bg-surface px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-t11">
                <span className="text-muted">₹{e.oldRate}</span>
                <span className={up ? "text-danger" : "text-success"}>
                  {up ? <IconArrowUpRight size={12} className="inline" /> : <IconArrowDownRight size={12} className="inline" />}
                </span>
                <span className="font-semibold text-ink">₹{e.newRate}</span>
                <span className={`text-t9 ${up ? "text-danger" : "text-success"}`}>({up ? "+" : ""}{e.delta})</span>
              </div>
              <span className="text-t9 text-faint">{e.date}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-t9 text-muted">
              {e.source === "procurement_po" ? <IconRobot size={11} className="text-info" /> : <IconUser size={11} />}
              <span>{e.by}</span>
              <span className="rounded bg-neutral-soft px-1.5 py-px text-t8 text-muted">{e.source === "procurement_po" ? "PO sync" : "manual"}</span>
            </div>
            {e.note && <div className="mt-1 text-t9 italic text-muted">{e.note}</div>}
          </div>
        );
      })}
    </div>
  );
}
