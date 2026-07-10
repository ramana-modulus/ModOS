"use client";

import { useState } from "react";
import { qaqcApi } from "@/features/qaqc/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { ItpTab } from "./itp-tab";
import { InspectionsTab } from "./inspections-tab";
import { NcrTab } from "./ncr-tab";
import { TptTab } from "./tpt-tab";
import { CabinTab } from "./cabin-tab";

type Sub = "itp" | "inspections" | "tpt" | "ncr" | "cabinqc";

/** [key, label, count, badgeColor] */
type TabDef = [Sub, string, number, string];

function Kpi({ label, value, sub, tone }: { label: string; value: number; sub: string; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

export function QaqcPage() {
  const [project, setProject] = useState("P1");
  const [subProject, setSubProject] = useState("SP1");
  const [sub, setSub] = useState<Sub>("inspections");

  const { data, loading, error } = useQuery(() => qaqcApi.getQAQC(project, subProject), [project, subProject]);

  if (loading || !data) return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading QA/QC…"}</div>;

  const { kpis, meta, projects, itps, inspections, ncrs, tpts, cabin } = data;
  const units = meta.units;

  const groups: [string, TabDef[]][] = [
    ["Plan", [["itp", "ITPs & Checklists", 0, ""]]],
    [
      "Inspect & Test",
      [
        ["inspections", "📥 Incoming", kpis.inspQueue + kpis.hpAwaiting, "var(--ac)"],
        ["tpt", "Third-Party Testing", kpis.tptPending, "#185FA5"],
      ],
    ],
    ["Non-Conformance", [["ncr", "NCRs & CARs", kpis.openNCR, "#A32D2D"]]],
  ];
  if (units > 1) {
    groups.push(["Closeout", [["cabinqc", "🏠 Cabin Sign-off", cabin.rollup.inprog + cabin.rollup.ncr, cabin.rollup.ncr > 0 ? "#A32D2D" : "#185FA5"]]]);
  }

  const proj = projects.find((p) => p.id === project) ?? projects[0]!;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Project bar */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-t11 text-faint">Project:</span>
          <div className="flex flex-wrap gap-1">
            {projects.map((p) => {
              const active = project === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProject(p.id);
                    setSubProject(p.subProjects[0]?.id ?? "SP1");
                  }}
                  className="cursor-pointer rounded-[20px] border-[0.5px] px-2.5 py-1 text-t11"
                  style={{ borderColor: active ? "var(--ac)" : "#D8D7D4", background: active ? "var(--ac-lt)" : "#fff", color: active ? "var(--ac)" : "#6B6A68", fontWeight: active ? 500 : 400 }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-t10 text-faint">
          {meta.code} · {meta.client} · QA Engineer: {meta.qaEngineer}
        </div>
      </div>

      {/* Sub-project pills */}
      {proj.subProjects.length > 1 && (
        <div className="mb-2 flex items-center gap-2 rounded-md border-[0.5px] border-dashed border-line bg-canvas px-2.5 py-[5px]">
          <span className="text-t9 font-medium uppercase tracking-[0.5px] text-faint">Sub-project:</span>
          <div className="flex flex-wrap gap-1">
            {proj.subProjects.map((s) => {
              const active = subProject === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubProject(s.id)}
                  className="cursor-pointer rounded-[14px] border-[0.5px] px-3 py-1 text-t11"
                  style={{ borderColor: active ? "#1A1917" : "#D8D7D4", background: active ? "#1A1917" : "#fff", color: active ? "#fff" : "#4A4945", fontWeight: active ? 500 : 400 }}
                >
                  {s.name} <span className="text-t10 opacity-60">×{s.units}</span>
                </button>
              );
            })}
          </div>
          <div className="ml-auto text-t10 text-faint">{meta.spSpec}</div>
        </div>
      )}

      {/* KPI bar */}
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Inspections (this sub-proj)" value={kpis.inspections} sub={`${kpis.passed} passed · ${kpis.partial} partial · ${kpis.failed} failed`} />
        <Kpi label="Open NCRs" value={kpis.openNCR} sub={`${kpis.majorCritical} major/critical`} tone={kpis.openNCR > 0 ? "ca" : "cg"} />
        <Kpi label="Pending Inspection" value={kpis.inspQueue} sub={`${kpis.pending} in progress`} tone={kpis.inspQueue > 0 ? "ca" : "cg"} />
        <Kpi label="Third-Party Tests" value={kpis.tptTotal} sub={`${kpis.tptPassed} passed · ${kpis.tptPending} pending`} />
        <Kpi label="ITPs (in scope)" value={kpis.itpsInScope} sub={`${kpis.holdPoints} hold point${kpis.holdPoints === 1 ? "" : "s"}`} />
      </div>

      {/* Grouped sub-tabs */}
      <div className="mb-3 flex flex-wrap items-end gap-3.5 border-b border-line">
        {groups.map(([label, tabs]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="pl-0.5 text-[8.5px] font-medium uppercase tracking-[0.5px] text-faint">{label}</span>
            <div className="vtabs m-0 border-b-0">
              {tabs.map(([key, tlabel, count, color]) => (
                <div key={key} className={`vt${sub === key ? " active" : ""}`} onClick={() => setSub(key)}>
                  {tlabel}
                  {count > 0 && (
                    <span className="ml-1 rounded-lg px-[5px] py-px text-t9 font-semibold text-white" style={{ background: color || "var(--ac)" }}>
                      {count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="-mx-3.5 min-h-0 flex-1 overflow-y-auto px-3.5 pb-3">
        {sub === "itp" && <ItpTab itps={itps} spName={meta.spName} />}
        {sub === "inspections" && <InspectionsTab inspections={inspections} itps={itps} />}
        {sub === "tpt" && <TptTab tpts={tpts} />}
        {sub === "ncr" && <NcrTab ncrs={ncrs} />}
        {sub === "cabinqc" && <CabinTab cabin={cabin} />}
      </div>
    </div>
  );
}
