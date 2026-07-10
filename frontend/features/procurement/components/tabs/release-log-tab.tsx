"use client";

import { IconInfoCircle, IconSend } from "@tabler/icons-react";
import type { ScopeParams } from "@/features/procurement/api/types";
import { procurementApi } from "@/features/procurement/api/client";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { fmtC, fmtQ } from "@/lib/format";

const STATE_COLOR: Record<string, string> = { po_raised: "#3B6D11", l1_selected: "#185FA5", quotes_in: "#854F0B", rfq_floated: "#854F0B", pending: "#9B9894" };
const STATE_BG: Record<string, string> = { po_raised: "#EAF3DE", l1_selected: "#E6F1FB", quotes_in: "#FAEEDA", rfq_floated: "#FAEEDA", pending: "#F5F4F2" };

export function ReleaseLogTab({ scope }: { scope: ScopeParams }) {
  const { data, loading, error } = useQuery(() => procurementApi.getReleaseLog(scope), [scope.project, scope.subProject]);
  if (loading || !data) return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading release log…"}</div>;

  if (data.length === 0) {
    return (
      <div className="rounded-lg bg-canvas p-8 text-center text-t11 text-faint">
        No BOM releases received from Engineering yet for this sub-project. Procurement actions begin once Engineering releases a BOQ line.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2.5 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-2.5 py-2 text-t11 text-faint">
        <IconInfoCircle size={12} className="mr-1 inline align-[-2px] text-accent" /> <strong className="text-ink">BOM Release Log</strong> — chronological feed of every BOQ line released by Engineering to Procurement, with per-component procurement status. ⚠ flags appear when a newer Eng version is released after a PO is already out (PO amendment may be required).
      </div>

      {data.map((ev, i) => (
        <div
          key={i}
          className="mb-2.5 rounded-lg border-[0.5px] px-4 py-3.5"
          style={{ borderColor: ev.isSuperseded ? "#F0C9BC" : "#E5E4E0", borderLeft: `3px solid ${ev.isSuperseded ? "#854F0B" : "#3B6D11"}`, background: ev.isSuperseded ? "#FBF5F3" : "#fff" }}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconSend size={14} style={{ color: ev.isSuperseded ? "#854F0B" : "#3B6D11" }} />
              <div>
                <div className="text-t12 font-semibold text-ink">Engineering released <span className="font-mono">{ev.boqCode} {ev.ver}</span></div>
                <div className="text-t10 text-faint">{ev.boqName} · {ev.boqCat}</div>
              </div>
            </div>
            <div className="text-right text-t10 text-faint">{ev.date}<br /><span className="text-muted">by {ev.by}</span></div>
          </div>
          <div className="mb-2 rounded bg-[#FAFAF9] px-2.5 py-1.5 text-t11 italic text-muted">&ldquo;{ev.changes}&rdquo;</div>
          {ev.isSuperseded && (
            <div className="mb-2 rounded bg-warn-soft px-2.5 py-1.5 text-t105 font-medium text-warn">⚠ Superseded by <strong>{ev.newerVer}</strong>. Any POs raised against this version may need amendment.</div>
          )}
          <div className="mb-1.5 text-t85 font-medium uppercase tracking-[0.5px] text-faint">Procurement status per BOM component ({ev.components.length})</div>
          <div className="flex flex-col gap-1">
            {ev.components.map((c) => (
              <div key={c.code} className="flex items-center justify-between rounded px-2.5 py-1.5 text-t10" style={{ background: STATE_BG[c.state.status] }}>
                <span className="flex items-center gap-2">
                  <span className="min-w-[80px] font-mono font-medium text-warn">{c.code}</span>
                  <span className="text-ink">{c.name}</span>
                  <span className="text-faint">{fmtQ(c.engQty)} {c.uom}</span>
                </span>
                <span className="flex items-center gap-2">
                  {c.state.vendor && <span className="text-t9 text-muted">{c.state.vendor}</span>}
                  {c.state.value != null && <span className="text-t9 font-medium text-ink">₹{fmtC(Math.round(c.state.value / 1000))}K</span>}
                  <span className="font-medium" style={{ color: STATE_COLOR[c.state.status] }}>{c.state.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
