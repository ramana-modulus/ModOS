"use client";

import { useEffect, useState } from "react";
import { estimationApi } from "@/features/estimation/api";
import type { EstSubProjectView } from "@/features/estimation/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { grandTotals } from "@/features/estimation/domain";
import { CostingSheet } from "./costing-sheet";
import { SubProjectOverview } from "./subproject-overview";
import { SummaryTab } from "./summary-tab";
import { VersionsTab } from "./versions-tab";

type Sub = "sheet" | "summary" | "versions";
type EstType = "EPC" | "BOQ" | "B2G";

const TYPES: { key: EstType; label: string }[] = [
  { key: "EPC", label: "EPC" },
  { key: "BOQ", label: "BOQ-based" },
  { key: "B2G", label: "B2G Tender" },
];

const lakh1 = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

function subDotColor(status: EstSubProjectView["status"]): string {
  if (status === "approved") return "#3B6D11";
  if (status === "submitted") return "#E8A020";
  return "#9B9894";
}

/**
 * The Estimation module — BOQ costing for a BD lead in the costing stage.
 * Renders the costing queue + sub-project selectors, and either the sub-project
 * Overview or a drilled-in costing surface (Costing Sheet / Summary / Versions).
 */
export function EstimationPage() {
  const [project, setProject] = useState<string | null>(null);
  const [subProjectId, setSubProjectId] = useState<string | null>(null);
  const [sub, setSub] = useState<Sub>("sheet");
  const [estType, setEstType] = useState<EstType>("EPC");
  const [version, setVersion] = useState("V3");
  const [units, setUnits] = useState(1);

  const { data, loading, error } = useQuery(() => estimationApi.getEstimation(project ?? undefined), [project]);

  // When the resolved project changes, drop back to the Overview.
  const projectId = data?.project.id;
  useEffect(() => {
    setSubProjectId(null);
    setSub("sheet");
  }, [projectId]);

  if (loading || !data) {
    return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading estimation…"}</div>;
  }

  const { leads, project: lead, subProjects, versions, categories, config, overviewTotalIncl } = data;
  const activeSub = subProjects.find((s) => s.id === subProjectId) ?? null;
  const isOverview = subProjectId === null && subProjects.length > 0;
  const activeItems = activeSub?.items ?? [];
  const { grandTotalExcl, grandTotalIncl, primeCostTotal } = grandTotals(activeItems, config);
  const allApproved = subProjects.length > 0 && subProjects.every((s) => s.status === "approved");
  const activeVersion = versions.find((v) => v.v === version) ?? versions[0];

  const selectProject = (id: string) => {
    setProject(id);
    setSubProjectId(null);
    setSub("sheet");
    setVersion("V3");
  };
  const selectSubProject = (sp: EstSubProjectView) => {
    setSubProjectId(sp.id);
    setUnits(sp.units);
    setSub("sheet");
  };

  const statusChip = (() => {
    const st = activeSub?.status ?? "costing";
    const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
      approved: { bg: "#E3EEF7", border: "#A9CCE8", color: "#185FA5", label: "Costing sent to BD / Contracts" },
      submitted: { bg: "#EAF3DE", border: "#C0DD97", color: "#3B6D11", label: "Submitted · Awaiting Review" },
      costing: { bg: "#F5F4F2", border: "#E5E4E0", color: "#6B6A68", label: "In Progress · Draft" },
    };
    const s = map[st] ?? map.costing!;
    return (
      <span style={{ padding: "5px 12px", background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: "5px", fontSize: "11px", fontWeight: 600, color: s.color, whiteSpace: "nowrap" }}>
        {s.label}
      </span>
    );
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Costing queue selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#9B9894", whiteSpace: "nowrap" }}>Costing queue:</span>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {leads.map((l) => {
              const active = lead.id === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => selectProject(l.id)}
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", cursor: "pointer", border: `0.5px solid ${active ? "var(--ac)" : "#D8D7D4"}`, background: active ? "var(--ac-lt)" : "#fff", color: active ? "var(--ac)" : "#6B6A68", fontWeight: active ? 500 : 400 }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8A020", flexShrink: 0 }} />
                  {l.co}
                  <span style={{ fontSize: "9px", opacity: 0.7 }}>{l.ref}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ fontSize: "10px", color: "#9B9894" }}>
          {lead.ref} · {lead.tech.join("/")} · {lead.client}{lead.dl ? ` · Due: ${lead.dl}` : ""}
        </div>
      </div>

      {/* Sub-project selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", padding: "6px 10px", background: "#F5F4F2", borderRadius: "8px", border: "0.5px solid #E8E7E4", flexWrap: "wrap" }}>
        <span style={{ fontSize: "10px", color: "#9B9894", whiteSpace: "nowrap", fontWeight: 500 }}>Sub-projects:</span>
        <div
          onClick={() => setSubProjectId(null)}
          style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "10px", cursor: "pointer", border: `0.5px solid ${!subProjectId ? "var(--ac)" : "#D8D7D4"}`, background: !subProjectId ? "var(--ac-lt)" : "#fff", color: !subProjectId ? "var(--ac)" : "#6B6A68", fontWeight: !subProjectId ? 600 : 400 }}
        >
          Overview
        </div>
        {subProjects.map((sp) => {
          const active = subProjectId === sp.id;
          return (
            <div
              key={sp.id}
              onClick={() => selectSubProject(sp)}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "10px", cursor: "pointer", border: `0.5px solid ${active ? "var(--ac)" : "#D8D7D4"}`, background: active ? "var(--ac-lt)" : "#fff", color: active ? "var(--ac)" : "#6B6A68", fontWeight: active ? 600 : 400 }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: subDotColor(sp.status), flexShrink: 0 }} />
              {sp.name}
              <span style={{ fontSize: "8px", opacity: 0.7 }}>×{sp.units}</span>
            </div>
          );
        })}
        <div style={{ marginLeft: "auto" }}>
          <button
            disabled={!allApproved}
            title={allApproved ? "Consolidate and send to BD" : "All sub-projects must be Submitted first"}
            style={{ padding: "4px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: 600, cursor: allApproved ? "pointer" : "not-allowed", border: `0.5px solid ${allApproved ? "#3B6D11" : "#D8D7D4"}`, background: allApproved ? "#EAF3DE" : "#F5F4F2", color: allApproved ? "#3B6D11" : "#9B9894", opacity: allApproved ? 1 : 0.6 }}
          >
            ⬡ Consolidate{allApproved ? " & Send to BD" : ""}
          </button>
        </div>
      </div>

      {isOverview ? (
        <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
          <SubProjectOverview subProjects={subProjects} overviewTotalIncl={overviewTotalIncl} onSelect={(id) => { const sp = subProjects.find((s) => s.id === id); if (sp) selectSubProject(sp); }} />
        </div>
      ) : (
        <>
          {/* Toolbar: sub-tabs + type pills + version selector */}
          <div className="est-toolbar" style={{ marginBottom: "6px" }}>
            <div className="vtabs" style={{ marginBottom: 0, flex: 1 }}>
              {(["sheet", "summary", "versions"] as const).map((k) => (
                <div key={k} className={`vt${sub === k ? " active" : ""}`} onClick={() => setSub(k)}>
                  {k === "sheet" ? "Costing Sheet" : k === "summary" ? "Summary" : "Versions"}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
              {TYPES.map((t) => (
                <div key={t.key} className={`proj-type-pill${estType === t.key ? " active" : ""}`} onClick={() => setEstType(t.key)}>
                  {t.label}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <select className="fi" style={{ fontSize: "10px" }} value={version} onChange={(e) => setVersion(e.target.value)}>
                {versions.map((v) => (
                  <option key={v.v} value={v.v}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Read-only version/status strip (sheet only) */}
          {sub === "sheet" && activeVersion && (
            <div style={{ marginBottom: "8px", border: "0.5px solid #E5E4E0", borderRadius: "6px", overflow: "hidden", fontSize: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 10px", background: "#FBF9F6" }}>
                <span style={{ color: "#3B6D11", whiteSpace: "nowrap" }}>✓ No pending actions</span>
                <span style={{ color: "#9B9894" }}>·</span>
                <span style={{ color: "#185FA5", whiteSpace: "nowrap" }}><strong>{activeVersion.v}</strong> {activeVersion.active ? "Active" : "Locked"}</span>
                <span style={{ color: "#9B9894", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{activeVersion.date} · {activeVersion.by} — {activeVersion.note}</span>
              </div>
            </div>
          )}

          {/* KPI strip (sheet) */}
          {sub === "sheet" && (
            <div style={{ display: "flex", gap: 0, border: "0.5px solid #E8E7E4", borderRadius: "8px", overflow: "hidden", marginBottom: "8px", flexShrink: 0, background: "#fff" }}>
              {(
                [
                  { l: "Prime Cost / unit", v: lakh1(primeCostTotal), c: "#1A1917" },
                  { l: "Quoted (excl GST)", v: lakh1(grandTotalExcl * units), c: "#C84B2F" },
                  { l: "Quoted (incl GST)", v: lakh1(grandTotalIncl * units), c: "#1A1917" },
                  { l: "Type", v: estType, c: "#3B6D11" },
                ] as const
              ).map((k) => (
                <div key={k.l} style={{ flex: 1, padding: "8px 12px", background: "#fff", borderRight: "0.5px solid #E8E7E4" }}>
                  <div style={{ fontSize: "9px", color: "#9B9894", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.l}</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: k.c, lineHeight: 1.1 }}>{k.v}</div>
                </div>
              ))}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#FBF9F6" }}>
                <div style={{ fontSize: "9px", color: "#9B9894", textTransform: "uppercase", letterSpacing: ".5px", lineHeight: 1.2 }}>No. of<br />Units</div>
                <input
                  type="number"
                  min={1}
                  value={units}
                  onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{ width: 56, fontSize: "20px", fontWeight: 700, color: "#1A1917", border: "1px solid #D8D7D4", borderRadius: "5px", padding: "1px 5px", textAlign: "center", outline: "none" }}
                />
              </div>
            </div>
          )}

          {/* Active tab content */}
          {sub === "sheet" && (
            <CostingSheet items={activeItems} categories={categories} config={config} area={lead.area} statusBanner={statusChip} />
          )}
          {sub === "summary" && (
            <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
              <SummaryTab items={activeItems} categories={categories} config={config} area={lead.area} units={units} estType={estType} costingSubmitted={lead.costingSubmitted} />
            </div>
          )}
          {sub === "versions" && (
            <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
              <VersionsTab versions={versions} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
