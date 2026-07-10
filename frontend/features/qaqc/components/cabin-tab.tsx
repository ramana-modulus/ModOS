"use client";

import { usePanel } from "@/components/layout/panel-provider";
import type { CabinView } from "@/features/qaqc/api";
import type { CabinQcStatus, CabinStatusView } from "@/features/qaqc/types";

const ST: Record<CabinQcStatus, { c: string; b: string; t: string }> = {
  pass: { c: "#3B6D11", b: "#EAF3DE", t: "QC CLEARED" },
  hold: { c: "#854F0B", b: "#FBF3E5", t: "CLEARED · NCR" },
  fail: { c: "#A32D2D", b: "#FBECEC", t: "FAILED — NCR" },
  in_progress: { c: "#185FA5", b: "#EAF1F9", t: "IN PROGRESS" },
  pending: { c: "#9B9894", b: "#F5F4F2", t: "PENDING" },
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function Kpi({ label, value, sub, tone }: { label: string; value: number; sub: string; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

function CabinDetail({ cabin, checklist, units }: { cabin: CabinStatusView; checklist: string[]; units: number }) {
  const m = ST[cabin.eff];
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <div className="text-t14 font-semibold text-ink">
          Cabin {pad2(cabin.cabin)} <span className="text-t11 font-normal text-faint">of {units}</span>
        </div>
        <span className="rounded-md px-2 py-0.5 text-t10 font-bold" style={{ background: m.b, color: m.c }}>
          {m.t}
        </span>
        {(cabin.status === "pass" || cabin.status === "fail") && cabin.by && (
          <span className="text-t9 text-faint">
            {cabin.by} · {cabin.date}
          </span>
        )}
      </div>

      <div className="mb-1 text-t10 font-semibold uppercase tracking-[0.5px] text-muted">Final Inspection Checklist</div>
      <div className="rounded-lg border-[0.5px] border-line bg-surface px-3">
        {checklist.map((c, i) => {
          const res = cabin.checks[i];
          const chip =
            res === "pass"
              ? { t: "Pass", col: "#3B6D11", bg: "#EAF3DE" }
              : res === "fail"
                ? { t: "Fail", col: "#A32D2D", bg: "#FBECEC" }
                : { t: "Pending", col: "#9B9894", bg: "#F5F4F2" };
          return (
            <div key={i} className="flex items-center border-b-[0.5px] border-line-soft py-[7px] last:border-b-0">
              <span className="flex-1 text-t11 text-ink">{c}</span>
              <span className="rounded-md px-2.5 py-0.5 text-t9 font-semibold" style={{ color: chip.col, background: chip.bg }}>
                {chip.t}
              </span>
            </div>
          );
        })}
      </div>

      {cabin.ncr && (
        <div className="mt-2.5 rounded-md border-[0.5px] px-2.5 py-2 text-t10" style={{ color: "#A32D2D", background: "#FBF3F3", borderColor: "#E8C9C9" }}>
          ⚠ <b>NCR</b> — {cabin.ncr.note} <span className="text-faint">({cabin.ncr.by} · {cabin.ncr.date})</span>
        </div>
      )}

      <div className="mt-2.5 text-t9 text-faint">
        Any Fail → cabin held with an NCR (blocks its billing). All Pass → cleared for handover. A cabin bills only after it clears here
        (per-cabin handover gate).
      </div>
    </div>
  );
}

export function CabinTab({ cabin }: { cabin: CabinView }) {
  const { openPanel } = usePanel();
  const { checklist, units, cabins, rollup } = cabin;

  if (units <= 1) {
    return (
      <div className="rounded-lg bg-subtle p-[30px] text-center text-t11 text-faint">
        Single-unit sub-project — use the standard inspection tabs (IMIR / WIR / FIR).
      </div>
    );
  }

  const open = (c: CabinStatusView) =>
    openPanel({ tag: `Cabin ${pad2(c.cabin)}`, title: "Final QC sign-off", subtitle: ST[c.eff].t, width: 420, body: <CabinDetail cabin={c} checklist={checklist} units={units} /> });

  const legend: [CabinQcStatus, string][] = [
    ["pass", "Cleared"],
    ["hold", "Cleared · NCR"],
    ["in_progress", "In progress"],
    ["fail", "Failed"],
    ["pending", "Pending"],
  ];

  return (
    <div>
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-4">
        <Kpi label="QC Cleared" value={rollup.cleared} sub={`of ${units} cabins`} tone="cg" />
        <Kpi label="Open NCR" value={rollup.ncr} sub="failed final QC" tone={rollup.ncr > 0 ? "ca" : "cg"} />
        <Kpi label="In Progress" value={rollup.inprog} sub="inspection started" />
        <Kpi label="Pending" value={rollup.pending} sub="not yet inspected" />
      </div>

      <div className="mb-2 text-t11 text-muted">
        Per-cabin final QC sign-off — tap a cabin to open its checklist.{" "}
        <span className="text-faint">A cabin bills only after it clears here (per-cabin handover gate).</span>
      </div>

      <div className="flex flex-wrap gap-[5px]">
        {cabins.map((c) => {
          const m = ST[c.eff];
          return (
            <div
              key={c.cabin}
              onClick={() => open(c)}
              title={`Cabin ${c.cabin} — ${m.t}`}
              className="flex h-[26px] w-[32px] cursor-pointer items-center justify-center rounded text-t9 font-semibold"
              style={{ background: m.b, border: `0.5px solid ${m.c}`, color: m.c }}
            >
              {pad2(c.cabin)}
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-3.5 text-t9 text-muted">
        {legend.map(([s, l]) => (
          <span key={s} className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: ST[s].b, border: `0.5px solid ${ST[s].c}` }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
