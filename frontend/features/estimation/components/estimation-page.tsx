"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { estimationApi } from "@/features/estimation/api";
import type { EstSubProjectView } from "@/features/estimation/api";
import { bizdevApi } from "@/features/bizdev/api";
import type { EstSubProjectWf } from "@/features/estimation/types";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { grandTotals } from "@/features/estimation/domain";
import { EST_RFIS_SEED } from "@/features/estimation/data/rfis";
import { CostingSheet } from "./costing-sheet";
import { SubProjectOverview } from "./subproject-overview";
import { SummaryTab } from "./summary-tab";
import { VersionsTab } from "./versions-tab";
import { RfiTab } from "./rfi-tab";
import { TenderDocsTab } from "./tender-docs-tab";
import { EstWorkflowTab } from "./est-workflow-tab";

type Sub = "sheet" | "summary" | "versions" | "rfi" | "docs" | "workflow";
type EstType = "EPC" | "BOQ" | "B2G";

const TABS: { key: Sub; label: string }[] = [
  { key: "sheet", label: "Costing Sheet" },
  { key: "summary", label: "Summary" },
  { key: "versions", label: "Versions" },
  { key: "rfi", label: "RFI to Contracts" },
  { key: "docs", label: "Tender Docs (BD)" },
  { key: "workflow", label: "Approval Workflow" },
];

const TYPES: { key: EstType; label: string }[] = [
  { key: "EPC", label: "EPC" },
  { key: "BOQ", label: "BOQ-based" },
  { key: "B2G", label: "B2G Tender" },
];

const lakh1 = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
const DEMO_TODAY = "23 May 2026";

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
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitComment, setSubmitComment] = useState("");
  const [submitErr, setSubmitErr] = useState(false);
  // Per-sub-project approval state, lifted so the Costing Sheet's Submit button,
  // the Approval Workflow tab and the Overview consolidation all share it.
  const [wfBySub, setWfBySub] = useState<Record<string, EstSubProjectWf>>({});
  const [subStatus, setSubStatus] = useState<Record<string, "costing" | "submitted" | "approved">>({});
  const [consolidated, setConsolidated] = useState(false);

  const { data, loading, error } = useQuery(() => estimationApi.getEstimation(project ?? undefined), [project]);

  // When the resolved project changes, drop back to the Overview and re-seed the
  // per-sub-project workflow / status from the payload.
  const projectId = data?.project.id;
  useEffect(() => {
    setSubProjectId(null);
    setSub("sheet");
    if (!data) return;
    const wfMap: Record<string, EstSubProjectWf> = {};
    const stMap: Record<string, "costing" | "submitted" | "approved"> = {};
    data.subProjects.forEach((sp) => {
      wfMap[sp.id] = structuredClone(sp.wf);
      stMap[sp.id] = sp.status;
    });
    setWfBySub(wfMap);
    setSubStatus(stMap);
    setConsolidated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const updateWf = (subId: string, fn: (wf: EstSubProjectWf) => EstSubProjectWf) =>
    setWfBySub((prev) => {
      const wf = prev[subId];
      return wf ? { ...prev, [subId]: fn(wf) } : prev;
    });
  const submitAllTrades = (subId: string) =>
    updateWf(subId, (wf) => ({ ...wf, status: "in_progress", trades: wf.trades.map((t) => ({ ...t, status: "submitted", submittedOn: DEMO_TODAY })) }));
  const submitTrade = (subId: string, tradeId: string) =>
    updateWf(subId, (wf) => ({ ...wf, status: "in_progress", trades: wf.trades.map((t) => (t.id === tradeId ? { ...t, status: "submitted", submittedOn: DEMO_TODAY } : t)) }));
  const checkerApprove = (subId: string) => {
    updateWf(subId, (wf) => ({ ...wf, checkerStatus: "approved", status: "checker_approved" }));
    setSubStatus((prev) => ({ ...prev, [subId]: "submitted" }));
  };
  const approverApprove = (subId: string) => {
    updateWf(subId, (wf) => ({ ...wf, approverStatus: "approved", status: "approved" }));
    setSubStatus((prev) => ({ ...prev, [subId]: "approved" }));
  };
  const doConsolidate = async (leadId: string) => {
    try {
      await bizdevApi.markCostingReceived(leadId);
    } catch {
      /* demo — best effort */
    }
    setConsolidated(true);
  };

  if (loading || !data) {
    return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading estimation…"}</div>;
  }

  const { leads, project: lead, subProjects, versions, categories, config, overviewTotalIncl } = data;
  const activeSub = subProjects.find((s) => s.id === subProjectId) ?? null;
  const activeWf = subProjectId ? wfBySub[subProjectId] : undefined;
  const isOverview = subProjectId === null && subProjects.length > 0;
  const activeItems = activeSub?.items ?? [];
  const { grandTotalExcl, grandTotalIncl, primeCostTotal } = grandTotals(activeItems, config);
  const allApproved = subProjects.length > 0 && subProjects.every((s) => subStatus[s.id] === "approved");
  const activeVersion = versions.find((v) => v.v === version) ?? versions[0];
  const rfiCount = EST_RFIS_SEED.filter((r) => r.tenderId === lead.id && r.status !== "closed").length;
  const wfPending = !!activeWf && activeWf.status !== "approved";
  const isSubmitted = activeWf ? activeWf.trades.some((t) => t.status === "submitted") : lead.costingSubmitted || submitted;

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

  // Costing-sheet header status — reflects the live approval stage of the
  // active sub-project (Submit → Checker → Approver), naming who's up next.
  const chip = (bg: string, border: string, color: string, text: string) => (
    <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: bg, border: `0.5px solid ${border}`, borderRadius: 5, fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap" }}>{text}</span>
  );
  // Short person names (drop the "(role)" suffix) so the chip fits the fixed slot.
  const checkerName = (activeWf?.checker ?? "Checker").split(" (")[0];
  const approverName = (activeWf?.approver ?? "Approver").split(" (")[0];
  const submitStatus = !isSubmitted ? (
    <button type="button" onClick={() => setSubmitOpen(true)} style={{ padding: "5px 14px", background: "var(--ac)", color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
      ✈ Submit for Review
    </button>
  ) : activeWf?.approverStatus === "approved" ? (
    chip("#EAF3DE", "#C0DD97", "#3B6D11", `✓ Approved by ${approverName}`)
  ) : activeWf?.checkerStatus === "approved" ? (
    chip("#E6F1FB", "#B8D4F0", "#185FA5", `✓ ${checkerName} approved · awaiting ${approverName}`)
  ) : (
    chip("#FAEEDA", "#F0D4A0", "#854F0B", `⏳ Submitted · awaiting ${checkerName}`)
  );

  // Submit-for-Review modal: version preview + required comment (prototype parity).
  const nextVersion = `V${versions.length + 1}`;
  const checkerApproved = activeWf?.checkerStatus === "approved";
  const submitVersionLabel = checkerApproved
    ? `${nextVersion} — New version (checker approved previous)`
    : versions.length > 0
      ? `${activeVersion?.v ?? "V1"} — Update current draft (not yet checker-approved)`
      : "V1 — First submission";
  const doSubmit = () => {
    if (!submitComment.trim()) {
      setSubmitErr(true);
      return;
    }
    if (activeSub) submitAllTrades(activeSub.id);
    setSubmitted(true);
    setSubmitOpen(false);
    setSubmitComment("");
    setSubmitErr(false);
    setSub("workflow");
  };

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
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: subDotColor(subStatus[sp.id] ?? sp.status), flexShrink: 0 }} />
              {sp.name}
              <span style={{ fontSize: "8px", opacity: 0.7 }}>×{sp.units}</span>
            </div>
          );
        })}
        <div style={{ marginLeft: "auto" }}>
          <button
            disabled={!allApproved || consolidated}
            onClick={() => doConsolidate(lead.id)}
            title={consolidated ? "Costing received — sent to BD" : allApproved ? "Consolidate and send to BD" : "All sub-projects must be Approved first"}
            style={{ padding: "4px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: 600, cursor: allApproved && !consolidated ? "pointer" : "not-allowed", border: `0.5px solid ${allApproved ? "#3B6D11" : "#D8D7D4"}`, background: allApproved ? "#EAF3DE" : "#F5F4F2", color: allApproved ? "#3B6D11" : "#9B9894", opacity: allApproved ? 1 : 0.6 }}
          >
            {consolidated ? "✓ Sent to BD — costing received" : `⬡ Consolidate${allApproved ? " & Send to BD" : ""}`}
          </button>
        </div>
      </div>

      {isOverview ? (
        <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
          <SubProjectOverview subProjects={subProjects} overviewTotalIncl={overviewTotalIncl} statusById={subStatus} consolidated={consolidated} onSelect={(id) => { const sp = subProjects.find((s) => s.id === id); if (sp) selectSubProject(sp); }} />
        </div>
      ) : (
        <>
          {/* Toolbar: sub-tabs + type pills + version selector */}
          <div className="est-toolbar" style={{ marginBottom: "6px" }}>
            <div className="vtabs" style={{ marginBottom: 0, flex: 1 }}>
              {TABS.map((t) => (
                <div key={t.key} className={`vt${sub === t.key ? " active" : ""}`} onClick={() => setSub(t.key)} style={{ position: "relative" }}>
                  {t.label}
                  {t.key === "rfi" && rfiCount > 0 && (
                    <span style={{ marginLeft: 4, background: "#854F0B", color: "#fff", fontSize: "9px", padding: "0 5px", borderRadius: "8px", fontWeight: 600 }}>{rfiCount}</span>
                  )}
                  {t.key === "workflow" && wfPending && (
                    <span style={{ marginLeft: 5, display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#C84B2F", verticalAlign: "middle" }} />
                  )}
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
              <button type="button" className="tbb" style={{ fontSize: "10px" }} title="Create a new costing version (demo)">+ Version</button>
              <button type="button" className="tbb" style={{ fontSize: "10px" }} title="Export the costing sheet to Excel (demo)">↓ Excel</button>
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
            <CostingSheet
              key={subProjectId ?? "none"}
              items={activeItems}
              categories={categories}
              config={config}
              area={lead.area}
              headerActions={submitStatus}
            />
          )}
          {sub === "summary" && (
            <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
              <SummaryTab items={activeItems} categories={categories} config={config} area={lead.area} units={units} estType={estType} costingSubmitted={isSubmitted} />
            </div>
          )}
          {sub === "versions" && (
            <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
              <VersionsTab versions={versions} />
            </div>
          )}
          {sub === "rfi" && (
            <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
              <RfiTab projectId={lead.id} clientName={lead.client || lead.co} today={DEMO_TODAY} />
            </div>
          )}
          {sub === "docs" && (
            <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
              <TenderDocsTab docs={lead.docs} co={lead.co} date={lead.dl || "02 May 2026"} owner="BD Team" />
            </div>
          )}
          {sub === "workflow" && (
            <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
              {activeSub && activeWf ? (
                <EstWorkflowTab
                  key={activeSub.id}
                  wf={activeWf}
                  onSubmitTrade={(tid) => submitTrade(activeSub.id, tid)}
                  onCheckerApprove={() => checkerApprove(activeSub.id)}
                  onApproverApprove={() => approverApprove(activeSub.id)}
                />
              ) : (
                <div className="px-3.5 py-8 text-center text-t11 text-faint">Select a sub-project to view its approval workflow.</div>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        dark
        title="Submit Costing for Review"
        subtitle="This will create a new version and trigger the approval workflow"
        width={440}
        footer={
          <>
            <Button variant="default" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={doSubmit}>Submit for Review →</Button>
          </>
        }
      >
        <div style={{ padding: "8px 12px", background: "#F5F4F2", borderRadius: 6, fontSize: 11, color: "#6B6A68", marginBottom: 12 }}>
          <strong style={{ color: "#1A1917" }}>Version:</strong> {submitVersionLabel}
        </div>
        <label style={{ fontSize: 10, fontWeight: 600, color: "#1A1917", display: "block", marginBottom: 5 }}>
          Submission Comment <span style={{ color: "var(--ac)" }}>*</span>
        </label>
        <textarea
          rows={3}
          value={submitComment}
          onChange={(e) => {
            setSubmitComment(e.target.value);
            if (e.target.value.trim()) setSubmitErr(false);
          }}
          placeholder="e.g. Initial estimation based on drawings rev A — structural quantities confirmed by Imran"
          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: `1px solid ${submitErr ? "var(--ac)" : "#D8D7D4"}`, borderRadius: 6, fontSize: 11, fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.5 }}
        />
        {submitErr && <p style={{ color: "var(--ac)", fontSize: 10, marginTop: 4 }}>A submission comment is required.</p>}
        <div style={{ padding: "8px 12px", background: "#EAF3DE", borderRadius: 6, fontSize: 10, color: "#3B6D11", marginTop: 12, lineHeight: 1.6 }}>
          <strong>What happens next:</strong>
          <br />→ All trade sections marked <strong>submitted</strong> — pending Checker ({checkerName}) review
          <br />→ Submission comment recorded on {checkerApproved ? nextVersion : (activeVersion?.v ?? "the current version")}
          <br />→ Summary tab unlocked with this version&apos;s data
          <br />→ Once approved &amp; consolidated, BD&apos;s deal card shows &quot;Costing received&quot;
        </div>
      </Modal>
    </div>
  );
}
