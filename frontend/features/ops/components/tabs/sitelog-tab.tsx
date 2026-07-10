"use client";

import type { OpsPayload } from "@/features/ops/api";
import type { SiteLogEntry } from "@/features/ops/types";

const CAT_COLOR: Record<string, string> = {
  drawing: "#185FA5",
  material: "#854F0B",
  weather: "#0E7490",
  front: "#7B1FA2",
  utility: "#7B1FA2",
  client: "#7B1FA2",
  safety: "#A32D2D",
  milestone: "#3B6D11",
  visitor: "#6B6A68",
  qc: "#3B6D11",
  other: "#6B6A68",
};

function statusColor(status: string): string {
  if (status === "resolved") return "#3B6D11";
  if (status === "routed") return "#854F0B";
  return "#A32D2D";
}

function routedLabel(routedTo?: string): string {
  if (routedTo === "engg") return "Engineering";
  if (routedTo === "proc") return "Procurement";
  return "internal";
}

function LogRow({ e }: { e: SiteLogEntry }) {
  return (
    <div className="mb-1.5 rounded-lg border-[0.5px] border-line bg-surface px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-t10">
          {e.kind === "hindrance" ? (
            <span className="rounded-[3px] px-1.5 py-px text-t9 font-bold" style={{ background: "#FBF3F3", color: "#A32D2D" }}>
              HINDRANCE
            </span>
          ) : (
            <span className="rounded-[3px] px-1.5 py-px text-t9 text-muted" style={{ background: "#F5F4F2" }}>
              event
            </span>
          )}
          <span className="rounded-[3px] px-1.5 py-px text-t9 font-bold text-white" style={{ background: CAT_COLOR[e.cat] ?? "#6B6A68" }}>
            {e.cat}
          </span>
          <b>{e.date}</b>
          {e.forCode && <span style={{ color: "#185FA5" }}>{e.forCode}</span>}
        </div>
        {e.kind === "hindrance" && (
          <span className="text-t10 font-semibold" style={{ color: statusColor(e.status) }}>
            {e.status}
            {e.routedTo && e.status !== "resolved" ? ` → ${routedLabel(e.routedTo)}` : ""}
            {e.refId ? ` · ${e.refId}` : ""}
          </span>
        )}
      </div>
      <div className="mt-1 text-t10 text-ink">{e.text}</div>
      {(e.chain || []).map((c, i) => (
        <div key={i} className="mt-0.5 text-t9 text-muted">
          ↳ {c.at} — {c.note} ({c.by})
        </div>
      ))}
      <div className="mt-0.5 text-t9 text-faint">{e.by}</div>
    </div>
  );
}

export function SiteLogTab({ data }: { data: OpsPayload }) {
  const { siteLog } = data;
  return (
    <div>
      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#FBF9F6] px-3 py-2 text-t9 text-muted">
        Hindrances route on creation: <b>drawing</b> → Engineering RFI · <b>material</b> → Procurement (vendor →
        replacement PO) · others → internal escalation. Events are a passive site diary.
      </div>
      {siteLog.length === 0 ? (
        <div className="text-t11 text-faint">No site log entries yet.</div>
      ) : (
        siteLog.map((e) => <LogRow key={e.id} e={e} />)
      )}
    </div>
  );
}
