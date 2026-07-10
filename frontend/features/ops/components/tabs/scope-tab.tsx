"use client";

import type { OpsPayload, ScopeLineView } from "@/features/ops/api";
import { fmtQ } from "@/lib/format";
import { roundQ } from "@/features/ops/domain";

function ProgressBar({ line }: { line: ScopeLineView }) {
  const fill = line.pct >= 100 ? "ahead" : "";
  return (
    <div className="mt-1.5 flex flex-col">
      <div className="flex items-center gap-2">
        <div className="ops-prog-bar">
          <div className={`ops-prog-fill ${fill}`} style={{ width: `${line.pct}%` }} />
        </div>
        <span className="whitespace-nowrap text-t10 text-muted">
          {fmtQ(roundQ(line.done))} / {fmtQ(roundQ(line.plannedTotal))} {line.uom}
        </span>
        <span
          className="w-10 self-start text-right text-t11 font-bold"
          style={{ color: line.pct >= 100 ? "#3B6D11" : "#185FA5" }}
        >
          {line.pct}%
        </span>
      </div>
      {/* Dated DPR checkpoint markers */}
      {line.ticks.length > 0 && line.plannedTotal > 0 && (
        <div className="relative mt-0.5 h-[18px] w-full">
          {line.ticks.map((c, i) => {
            const left = Math.max(0, Math.min(100, (c.cum / line.plannedTotal) * 100));
            return (
              <div
                key={i}
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${left}%` }}
                title={`${fmtQ(c.cum)} ${line.uom} as of ${c.date} (${c.dpr})`}
              >
                <div className="h-[5px] w-px" style={{ background: "#C8A24B" }} />
                <div className="mt-px whitespace-nowrap text-[7.5px] leading-tight" style={{ color: "#854F0B" }}>
                  {c.date.replace(" 2026", "")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LineRow({ line, units }: { line: ScopeLineView; units: number }) {
  const varCol = Math.abs(line.variance.varPct) < 0.5 ? "#3B6D11" : line.variance.varAbs > 0 ? "#A32D2D" : "#854F0B";
  return (
    <div className="mb-2 rounded-lg border-[0.5px] border-line bg-surface px-3.5 py-2.5">
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <b className="text-t11">{line.code}</b>
          <span className="rounded-[3px] px-1.5 py-px text-[8.5px]" style={{ background: "#EEF4FB", color: "#185FA5" }}>
            Site Work
          </span>
          {line.execMode && (
            <span
              className="rounded-[3px] px-1.5 py-px text-[8.5px] font-semibold"
              style={{ background: line.execMode.bg, color: line.execMode.fg }}
              title={line.execMode.sub}
            >
              {line.execMode.label}
            </span>
          )}
          {line.matNature === "freeissue" && (
            <span className="rounded-[3px] px-1.5 py-px text-[8px]" style={{ background: "#EAF3DE", color: "#3B6D11" }}>
              free-issue
            </span>
          )}
          <span className="text-t10 text-ink-soft">{line.name.slice(0, 42)}</span>
        </div>
        <span className="text-t9 text-faint">
          {line.checkpointCount
            ? `${line.checkpointCount} DPR checkpoint(s)`
            : line.ticks.length
              ? `${line.ticks.length} dated update(s)`
              : "0 DPR checkpoint(s)"}
        </span>
      </div>

      <ProgressBar line={line} />

      {/* All-cabins rollup */}
      {units > 1 && line.cabin && (
        <div className="mt-1.5 text-t9">
          <span className="font-semibold" style={{ color: "#3B6D11" }}>
            {line.cabin.done} done
          </span>{" "}
          <span className="text-faint">·</span>{" "}
          <span className="font-semibold" style={{ color: "#185FA5" }}>
            {line.cabin.inprog} in progress
          </span>{" "}
          <span className="text-faint">·</span>{" "}
          <span className="font-semibold text-faint">{line.cabin.pend} pending</span>{" "}
          <span className="text-faint">of {units} cabins</span>
        </div>
      )}

      {/* Variance strip (executed vs calculated BOM) */}
      <div className="mt-1.5 flex flex-wrap gap-x-3 border-t border-dashed border-line pt-1 text-t9 text-muted">
        <span>
          Calc. BOM <b className="text-ink">{fmtQ(roundQ(line.variance.bom))} {line.uom}</b>
        </span>
        <span>
          Executed <b className="text-ink">{fmtQ(roundQ(line.variance.exec))} {line.uom}</b>
        </span>
        <span>
          Var vs BOM{" "}
          <b style={{ color: varCol }}>
            {line.variance.varAbs > 0 ? "+" : ""}
            {fmtQ(roundQ(line.variance.varAbs))} {line.uom} ({line.variance.varPct > 0 ? "+" : ""}
            {line.variance.varPct.toFixed(1)}%)
          </b>
        </span>
      </div>
    </div>
  );
}

export function ScopeTab({ data }: { data: OpsPayload }) {
  const { scopeLines, scopeCats, units, scopeHeaderPct } = data;
  if (!scopeLines.length) {
    return <div className="text-t11 text-faint">No BOQ lines in execution for this sub-project yet.</div>;
  }

  return (
    <div>
      <div className="mb-2.5 rounded-lg border-[0.5px] border-line bg-[#FBF9F6] px-3 py-2 text-t11 text-muted">
        <b className="text-ink">Scope Progress: {scopeHeaderPct}%</b> — cumulative installed qty across site-work lines.
        Progress is captured per cabin; the read-only rollup shows done / in-progress / pending across the {units}{" "}
        identical cabins. DPR checkpoints lock the position on each report.
      </div>

      {scopeCats.map((cat) => {
        const lines = scopeLines.filter((l) => l.cat === cat.cat);
        return (
          <div key={cat.cat} className="mb-1.5">
            <div className="mb-1.5 flex items-center gap-2 rounded-md bg-[#F0EFED] px-2.5 py-1.5">
              <span className="text-t10 font-bold uppercase tracking-[0.4px] text-ink">{cat.cat}</span>
              <span className="text-t9 text-faint">{cat.lines} line(s)</span>
              <div className="flex-1" />
              <div className="h-[5px] w-[90px] rounded-[3px]" style={{ background: "#E0DFDB" }}>
                <div
                  className="h-[5px] rounded-[3px]"
                  style={{ width: `${cat.pct}%`, background: cat.pct >= 100 ? "#3B6D11" : "#185FA5" }}
                />
              </div>
              <span className="w-[34px] text-right text-t10 font-semibold" style={{ color: "#185FA5" }}>
                {cat.pct}%
              </span>
            </div>
            {lines.map((line) => (
              <LineRow key={line.code} line={line} units={units} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
