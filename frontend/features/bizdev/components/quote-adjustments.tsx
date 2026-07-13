"use client";

import { useEffect, useState } from "react";
import { estimationApi } from "@/features/estimation/api";
import type { EstConfig, EstItem } from "@/features/estimation/types";
import { useQuery } from "@/features/procurement/hooks/use-query";

const lakh = (n: number) => `₹${(n / 100000).toFixed(2)}L`;

/** Prime cost (across all line items, one unit) — matches the estimation
 * `subProjectUnitRateExcl` prime so BD's numbers tie out with Estimation. */
function primeOf(items: EstItem[], c: EstConfig): number {
  return items.reduce((s, it) => {
    const base = (it.material ?? 0) + (it.machinery ?? 0) + (it.manpower ?? 0);
    return s + (base + base * c.transportPct + base * c.wastagePct) * it.qty;
  }, 0);
}
/** Sub-project total incl. GST for a BD-chosen margin (%) and unit count. */
function subtotalIncl(prime: number, c: EstConfig, marginPct: number, units: number): number {
  return prime * (1 + c.overheadsPct + marginPct / 100) * (1 + c.gstPct / 100) * units;
}

const numInput = "w-full rounded border border-input bg-surface px-1.5 py-1 text-center text-t12 font-semibold text-ink outline-none";
const capLabel = "mb-0.5 block text-t8 uppercase tracking-[0.4px] text-faint";

/**
 * BD "Quote Adjustments" editor shown on a costing-received deal (prototype
 * openLP sub-project-mode). Pulls the lead's sub-projects + config from
 * Estimation, lets BD tweak Units & Margin% per sub-project, and previews the
 * live per-sub subtotal + grand total (incl. GST) before generating the quote.
 */
export function QuoteAdjustments({ leadId }: { leadId: string }) {
  const { data, loading } = useQuery(() => estimationApi.getEstimation(leadId), [leadId]);
  const [adj, setAdj] = useState<Record<string, { units: number; margin: number }>>({});
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!data) return;
    const seed: Record<string, { units: number; margin: number }> = {};
    const defMargin = Math.round(data.config.markupPct * 100);
    data.subProjects.forEach((sp) => {
      seed[sp.id] = { units: sp.units, margin: defMargin };
    });
    setAdj(seed);
  }, [data]);

  if (loading || !data) {
    return <div className="w-full rounded-lg border-[0.5px] border-line bg-subtle p-3 text-center text-t10 text-faint">Loading costing…</div>;
  }
  // Only render when this lead actually resolved sub-projects in Estimation.
  if (data.project.id !== leadId || data.subProjects.length === 0) return null;

  const { subProjects, config } = data;
  const defMargin = Math.round(config.markupPct * 100);
  const get = (id: string, units: number) => adj[id] ?? { units, margin: defMargin };
  const set = (id: string, key: "units" | "margin", value: number) =>
    setAdj((prev) => {
      const cur = prev[id] ?? { units: 0, margin: defMargin };
      return { ...prev, [id]: { ...cur, [key]: value } };
    });

  const grand = subProjects.reduce((s, sp) => {
    const a = get(sp.id, sp.units);
    return s + subtotalIncl(primeOf(sp.items, config), config, a.margin, a.units);
  }, 0);

  return (
    <div className="w-full rounded-lg border-[0.5px] border-line bg-subtle p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-t10 font-semibold text-ink">Quote Adjustments — {subProjects.length} sub-project{subProjects.length > 1 ? "s" : ""}</div>
        <div className="text-t9 text-faint">Edit units &amp; margin per type</div>
      </div>

      {subProjects.map((sp, i) => {
        const a = get(sp.id, sp.units);
        const sub = subtotalIncl(primeOf(sp.items, config), config, a.margin, a.units);
        return (
          <div key={sp.id} className="mb-1.5 rounded-md border-[0.5px] border-line bg-surface p-2.5">
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="text-t10 font-semibold text-ink">{i + 1}. {sp.name}</div>
              {sp.spec && <div className="max-w-[55%] text-right text-t9 text-faint">{sp.spec}</div>}
            </div>
            <div className="grid grid-cols-[1fr_1fr_1.3fr] items-end gap-1.5">
              <div>
                <label className={capLabel}>Units</label>
                <input
                  type="number"
                  min={1}
                  value={a.units}
                  onChange={(e) => set(sp.id, "units", Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className={numInput}
                />
              </div>
              <div>
                <label className={capLabel}>Margin %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={a.margin}
                  onChange={(e) => set(sp.id, "margin", Math.max(0, parseFloat(e.target.value) || 0))}
                  className={numInput}
                />
              </div>
              <div className="rounded bg-canvas px-2 py-1 text-right">
                <div className="text-t8 uppercase tracking-[0.4px] text-faint">Subtotal (incl.GST)</div>
                <div className="font-mono text-t12 font-bold text-accent">{lakh(sub)}</div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="my-2 flex items-baseline justify-between rounded-md bg-ink px-2.5 py-2">
        <span className="text-t9 uppercase tracking-[0.4px] text-faint">Grand Total (incl. GST)</span>
        <span className="font-mono text-t16 font-bold" style={{ color: "#AAFFAA" }}>{lakh(grand)}</span>
      </div>

      <label className={capLabel}>
        BD Comments <span className="text-faint normal-case">(reason for adjustments)</span>
      </label>
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="e.g. Client negotiated Porta Cabin A margin to 18% · Reduced Porta Cabin B units from 8 to 6 after site visit"
        className="w-full resize-y rounded-md border-[0.5px] border-input bg-surface px-2 py-1.5 text-t10 leading-relaxed text-ink outline-none"
      />
    </div>
  );
}
