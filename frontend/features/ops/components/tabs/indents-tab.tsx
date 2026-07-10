"use client";

import { useState } from "react";
import type { OpsPayload } from "@/features/ops/api";

const STATUS_COLOR: Record<string, string> = {
  pending_approval: "#854F0B",
  approved: "#3B6D11",
  rejected: "#A32D2D",
  escalated: "#A32D2D",
  completed: "#6B6A68",
  draft: "#9B9894",
};

export function IndentsTab({ data }: { data: OpsPayload }) {
  const { indents, indentTypes, indentCats } = data;
  const [cat, setCat] = useState<string>("all");

  const cats = ["all", ...Object.keys(indentCats)];
  const rows = indents.filter((i) => cat === "all" || i.cat === cat);

  return (
    <div>
      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#FBF9F6] px-3 py-2 text-t11 text-muted">
        <b className="text-ink">Site indents</b> — {indentTypes.length} site-relevant types. POs and WOs are owned by
        Procurement / Subcontracts via the kickoff routing; site raises demand here.
      </div>

      {/* Category filter */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {cats.map((c) => {
          const active = cat === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={"tbb text-t10 " + (active ? "p" : "")}
            >
              {c === "all" ? "All" : indentCats[c]?.label ?? c}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="text-t11 text-faint">No indents in this category.</div>
      ) : (
        rows.map((i) => {
          const t = indentTypes.find((x) => x.id === i.typeId);
          const route = t?.routesTo ? (t.routesTo === "proc" ? "Procurement" : "Subcontracts") : null;
          return (
            <div key={i.id} className="mb-1.5 rounded-lg border-[0.5px] border-line bg-surface px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-t10">
                  <b>{i.id}</b> · {t?.name ?? `(type ${i.typeId})`}{" "}
                  {route && (
                    <span className="rounded-[3px] px-1.5 py-px text-t9" style={{ background: "#EEF4FB", color: "#185FA5" }}>
                      → {route}
                    </span>
                  )}{" "}
                  {i.forCode && <span style={{ color: "#185FA5" }}>{i.forCode}</span>}
                </div>
                <div className="flex items-center gap-2 text-t10">
                  <span className="font-bold" style={{ color: STATUS_COLOR[i.status] ?? "#6B6A68" }}>
                    {i.status}
                  </span>
                  {i.slaState === "breached" && <span className="font-bold text-danger">SLA breached</span>}
                  {i.slaState === "warn" && <span style={{ color: "#854F0B" }}>SLA warning</span>}
                </div>
              </div>
              <div className="mt-1 text-t10">{i.subject}</div>
              <div className="mt-1 text-t9 text-faint">
                {i.raisedAt} · {i.raisedBy} · approver: {i.approver || t?.approver || "—"}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
