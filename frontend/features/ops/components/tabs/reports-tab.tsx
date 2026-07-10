"use client";

import type { OpsPayload } from "@/features/ops/api";
import type { Dpr } from "@/features/ops/types";
import { fmtQ } from "@/lib/format";

function deltaText(d: Dpr["deltas"][number]): string {
  if (d.type === "milestone") return `${d.code} → ${d.toMs ?? ""}`;
  return `${d.code} +${fmtQ(d.qty ?? 0)} ${d.uom ?? ""}`;
}

function DprCard({ r }: { r: Dpr }) {
  const workers = (r.manpower || []).reduce((t, m) => t + (m.count || 0), 0);
  return (
    <div className="mb-2 rounded-lg border-[0.5px] border-line bg-surface px-3.5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-t11 font-bold">
          {r.id} · {r.date}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-[3px] px-1.5 py-px text-t9" style={{ background: "#EAF3DE", color: "#3B6D11" }}>
            {r.status}
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 text-t10 text-muted">
        <span>
          <b>{(r.deltas || []).length}</b> lines progressed
        </span>
        <span>
          <b>{workers}</b> workers
        </span>
        <span>
          reported <b>{r.reportedPct}%</b>
        </span>
        {r.expectedEnd && <span>est. end {r.expectedEnd}</span>}
        {(r.blockers || []).length > 0 && (
          <span className="text-danger">
            <b>{r.blockers.length}</b> blocker(s)
          </span>
        )}
      </div>
      {(r.deltas || []).length > 0 && (
        <div className="mt-1.5 text-t10 text-ink-soft">{r.deltas.map(deltaText).join(" · ")}</div>
      )}
      {(r.log || []).length > 0 && (
        <div className="mt-1.5 text-t10 text-muted">{r.log.map((l, i) => <div key={i}>• {l}</div>)}</div>
      )}
      {(r.blockers || []).length > 0 && (
        <div className="mt-1.5 rounded border-l-2 border-danger bg-danger-soft px-2 py-1 text-t10 text-danger">
          {r.blockers.map((b, i) => (
            <div key={i}>⛔ {b}</div>
          ))}
        </div>
      )}
      {(r.viewpoints || []).length > 0 && (
        <div className="mt-1.5 text-t9" style={{ color: "#185FA5" }}>
          📷 {r.viewpoints.map((v) => v.name).join(", ")}
        </div>
      )}
    </div>
  );
}

export function ReportsTab({ data }: { data: OpsPayload }) {
  const { reports, dlr } = data;

  return (
    <div>
      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#FBF9F6] px-3 py-2 text-t11 text-muted">
        <b className="text-ink">Progress Reports</b> — daywise DPRs logged from Scope Tracking (view &amp; print).
        Manpower (DLR) is folded into each DPR. <b>{reports.length}</b> report(s).
      </div>

      {reports.length === 0 ? (
        <div className="text-t11 text-faint">No reports yet for this scope.</div>
      ) : (
        reports.map((r) => <DprCard key={r.id} r={r} />)
      )}

      {/* Daily Labour Report — retired register kept read-only for reference */}
      {dlr.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-t10 font-semibold uppercase tracking-[0.5px] text-faint">
            Daily Labour Report (reference)
          </div>
          {dlr.map((d) => {
            const total = d.entries.reduce((t, e) => t + (e.count || 0), 0);
            return (
              <div key={d.id} className="entry-card">
                <div className="flex items-center justify-between">
                  <div className="text-t11 font-semibold">
                    {d.id} · {d.date}
                    <span className="ml-2 rounded-[3px] px-1.5 py-px text-t9 text-muted" style={{ background: "#F0EFED" }}>
                      {d.mode}
                    </span>
                  </div>
                  <div className="text-t10 text-muted">
                    <b className="text-ink">{total}</b> workers · {d.by}
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-t10 text-muted">
                  {d.entries.map((e, i) => (
                    <span key={i}>
                      {e.skill} ×{e.count}
                      {e.forCode ? ` (${e.forCode})` : ""}
                      {e.hours ? ` · ${e.hours}h` : ""}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
