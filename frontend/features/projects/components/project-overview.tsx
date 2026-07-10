"use client";

import type { Project } from "@/types/procurement";
import type { ProjectOverview as ProjectOverviewData, PulseRow } from "@/features/projects/types";
import { Pill } from "@/components/ui/badge";
import { avatarColor, initials, stagePillClass } from "@/features/projects/domain";
import { CashflowChart } from "./cashflow-chart";

const LABEL_CSS: React.CSSProperties = {
  color: "#9B9894",
  fontSize: 9,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

function pulseFill(p: PulseRow): string {
  if (p.warn) return "#D97706";
  if (p.val >= 80) return "#1FA855";
  if (p.val >= 60) return "#3B82F6";
  return "#F97316";
}

function InfoField({ label, value, span }: { label: string; value: React.ReactNode; span?: boolean }) {
  return (
    <div style={span ? { gridColumn: "1/-1" } : undefined}>
      <div style={LABEL_CSS}>{label}</div>
      <div style={{ fontWeight: 500, color: "#1A1917", marginTop: 2 }}>{value}</div>
    </div>
  );
}

export function ProjectOverview({
  proj,
  overview,
  onOpenCashflow,
}: {
  proj: Project;
  overview: ProjectOverviewData;
  onOpenCashflow: () => void;
}) {
  const { ext, health, metrics: mx, activity, cashflow } = overview;

  return (
    <>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1A1917" }}>{proj.name}</div>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#9B9894", background: "#F0EFED", padding: "2px 6px", borderRadius: 4 }}>{proj.code}</span>
        <Pill cls={stagePillClass(proj.stage)}>{proj.stage}</Pill>
        <div className={`hbadge ${health.val}`} title={health.reasons.join(" · ") || "All indicators within thresholds"}>
          <span className="hdot" />
          {health.label}
          <span className="hsrc">{health.auto ? "AUTO" : "PM SET"}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="tbb p" style={{ fontSize: 10 }} type="button"><i className="ti ti-clipboard-list" /> Open in Planning</button>
          <button className="tbb" style={{ fontSize: 10 }} type="button" onClick={onOpenCashflow}><i className="ti ti-cash" /> Cashflow</button>
          <button className="tbb" style={{ fontSize: 10 }} type="button"><i className="ti ti-files" /> Docs</button>
          <button className="tbb" style={{ fontSize: 10 }} type="button"><i className="ti ti-download" /> Summary PDF</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kr" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 10 }}>
        <div className="kp kp-prog">
          <div className="kl">Physical Progress</div>
          <div className="kv">
            {mx.actualPct}%
            <span style={{ fontSize: 11, fontWeight: 400, color: mx.pgDelta < 0 ? "#A32D2D" : "#1F7A3D", marginLeft: 6 }}>
              {mx.pgDelta >= 0 ? "+" : ""}{mx.pgDelta}%
            </span>
          </div>
          <div className="kp-bar">
            <div className={`kp-bar-fill ${mx.pgDelta < -3 ? "red" : mx.pgDelta < 0 ? "amber" : "green"}`} style={{ width: `${mx.actualPct}%` }} />
            <div className="kp-bar-tick" style={{ left: `${mx.plannedPct}%` }} title={`Planned ${mx.plannedPct}%`} />
          </div>
          <div className="ks">vs planned {mx.plannedPct}%</div>
        </div>

        <div className="kp kp-prog">
          <div className="kl">Cost Health</div>
          <div className="kv">
            ₹{mx.costIncurredCr.toFixed(1)}
            <span style={{ fontSize: 11, fontWeight: 400, color: "#6B6A68" }}>/{mx.costRevisedCr.toFixed(1)} Cr</span>
          </div>
          <div className="kp-bar">
            <div className={`kp-bar-fill ${mx.costHealth === "green" ? "green" : "amber"}`} style={{ width: `${mx.costPct}%` }} />
          </div>
          <div className="ks">Forecast final ₹{mx.forecastFinalCr.toFixed(1)} Cr · Margin {mx.forecastMarginPct}%</div>
        </div>

        <div className="kp">
          <div className="kl">Schedule · SPI</div>
          <div className={`kv ${mx.spi < 0.95 ? "ca" : "cg"}`}>{mx.spi.toFixed(2)}</div>
          <div className="ks">{mx.scheduleVar < 0 ? `${Math.abs(mx.scheduleVar)}% behind` : "On / ahead of plan"} · CPI {mx.cpi.toFixed(2)}</div>
        </div>

        <div className="kp">
          <div className="kl">Open Risks</div>
          <div className={`kv ${mx.totalRisks >= 5 ? "cr" : mx.totalRisks >= 3 ? "ca" : "cg"}`}>{mx.totalRisks}</div>
          <div className="ks">RFI {ext.risks.rfis} · NCR {ext.risks.ncrs} · CO {ext.risks.changeOrders}</div>
        </div>
      </div>

      {/* Key info + pulse + team */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          {/* Key Info */}
          <div className="pulse-card">
            <div style={{ fontSize: 10, color: "#9B9894", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8, fontWeight: 500 }}>Key Info</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11 }}>
              <InfoField label="Client" value={proj.client} />
              <InfoField label="Type" value={proj.type} />
              <InfoField label="Contract Type" value={ext.contract.type} />
              <InfoField label="Retention" value={`${ext.contract.retention}% · DLP ${ext.contract.dlpMonths} months`} />
              <InfoField label="Payment Terms" value={ext.contract.paymentTerms} span />
              <InfoField label="LD Clause" value={ext.contract.ldClause} span />
              <div style={{ gridColumn: "1/-1", paddingTop: 8, borderTop: "0.5px dashed #E8E7E4" }}>
                <div style={LABEL_CSS}>Site Location</div>
                <div style={{ fontWeight: 500, color: "#1A1917", marginTop: 2 }}>📍 {ext.location.addr}</div>
                <div style={{ color: "#6B6A68", fontSize: 10, marginTop: 1 }}>{ext.location.distFromFactory}</div>
              </div>
            </div>
          </div>

          {/* Sub-projects */}
          {proj.subProjects && proj.subProjects.length > 0 && (
            <div className="tw" style={{ marginTop: 10 }}>
              <div className="th" style={{ gridTemplateColumns: "60px 1fr 70px 1fr" }}>
                <span>ID</span><span>Sub-project</span><span>Units</span><span>Specification</span>
              </div>
              {proj.subProjects.map((sp) => (
                <div key={sp.id} className="tr" style={{ gridTemplateColumns: "60px 1fr 70px 1fr" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#6B6A68" }}>{sp.id}</span>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{sp.name}</span>
                  <span><Pill cls="pb">×{sp.units}</Pill></span>
                  <span style={{ fontSize: 10, color: "#6B6A68" }}>{sp.spec}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Cross-Module Pulse */}
          <div className="pulse-card">
            <div style={{ fontSize: 10, color: "#9B9894", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4, fontWeight: 500 }}>Cross-Module Pulse</div>
            {ext.pulse.map((p) => (
              <div key={p.dept} className={`pulse-row ${p.warn ? "warn" : ""}`}>
                <div className="pulse-icon"><i className={`ti ${p.icon}`} /></div>
                <div>
                  <div className="pulse-dept">{p.dept}</div>
                  <div className="pulse-sub">{p.sub}</div>
                </div>
                <div className="pulse-bar"><div className="pulse-fill" style={{ width: `${p.val}%`, background: pulseFill(p) }} /></div>
                <div className="pulse-val">{p.val}%</div>
              </div>
            ))}
          </div>

          {/* Project Team */}
          <div className="pulse-card" style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#9B9894", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 500 }}>Project Team</div>
              <button className="tbb" style={{ fontSize: 9, padding: "3px 7px" }} type="button"><i className="ti ti-edit" /> Edit</button>
            </div>
            <div className="team-grid">
              {[ext.team.pm, ext.team.planning, ext.team.engg, ext.team.proc, ext.team.ops, ext.team.qa, ext.team.billing, ext.team.finance].map((t) => (
                <div key={t.role} className="team-card" title={`${t.email} · ${t.phone}`}>
                  <div className="team-avatar" style={{ background: avatarColor(t.name) }}>{initials(t.name)}</div>
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div className="team-name" style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{t.name}</div>
                    <div className="team-role">{t.role}</div>
                  </div>
                </div>
              ))}
              <div className="team-card spoc" title={`${ext.team.clientSpoc.email} · ${ext.team.clientSpoc.phone}`}>
                <div className="team-avatar" style={{ background: avatarColor(ext.team.clientSpoc.name) }}>{initials(ext.team.clientSpoc.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="team-name">{ext.team.clientSpoc.name} <span style={{ fontSize: 9, color: "#9B9894" }}>· {ext.team.clientSpoc.org}</span></div>
                  <div className="team-role">{ext.team.clientSpoc.role}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="tbb" style={{ fontSize: 9, padding: "3px 6px" }} type="button" title="Call"><i className="ti ti-phone" /></button>
                  <button className="tbb" style={{ fontSize: 9, padding: "3px 6px" }} type="button" title="Email"><i className="ti ti-mail" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Dates */}
      <div className="sec-hdr">Key Dates</div>
      <div className="dates-strip">
        <div className="date-item"><div className="date-label">LOI</div><div className="date-val">{ext.dates.loi}</div></div>
        <div className="date-item"><div className="date-label">Contract</div><div className="date-val">{ext.dates.contract}</div></div>
        <div className="date-item"><div className="date-label">Site Handover</div><div className="date-val">{ext.dates.siteHandover}</div></div>
        <div className="date-item"><div className="date-label">Plan Start</div><div className="date-val">{ext.dates.plannedStart}</div></div>
        <div className="date-item actual"><div className="date-label">Actual Start</div><div className="date-val">{ext.dates.actualStart}</div></div>
        <div className="date-item"><div className="date-label">Plan End</div><div className="date-val">{ext.dates.plannedEnd}</div></div>
        <div className="date-item forecast"><div className="date-label">Forecast End</div><div className="date-val">{ext.dates.forecastEnd}</div></div>
        <div className="date-item"><div className="date-label">DLP End</div><div className="date-val">{ext.dates.dlpEnd}</div></div>
      </div>

      {/* Open Risks */}
      <div className="sec-hdr">Open Risks</div>
      <div className="risk-strip">
        <div className={`risk-pill-card ${ext.risks.rfis >= 3 ? "warm" : ""}`}><div className="rc-val">{ext.risks.rfis}</div><div className="rc-lbl">RFIs</div></div>
        <div className={`risk-pill-card ${ext.risks.rfcs >= 2 ? "warm" : ""}`}><div className="rc-val">{ext.risks.rfcs}</div><div className="rc-lbl">RFCs</div></div>
        <div className={`risk-pill-card ${ext.risks.ncrs >= 3 ? "hot" : ext.risks.ncrs >= 1 ? "warm" : ""}`}><div className="rc-val">{ext.risks.ncrs}</div><div className="rc-lbl">NCRs</div></div>
        <div className={`risk-pill-card ${ext.risks.changeOrders >= 2 ? "warm" : ""}`}><div className="rc-val">{ext.risks.changeOrders}</div><div className="rc-lbl">Change Orders</div></div>
        <div className={`risk-pill-card ${ext.risks.pendingApprovals >= 3 ? "warm" : ""}`}><div className="rc-val">{ext.risks.pendingApprovals}</div><div className="rc-lbl">Pending Approvals</div></div>
      </div>

      {/* Recent Activity */}
      <div className="sec-hdr">Recent Activity</div>
      <div className="act-feed">
        {activity.map((a) => (
          <div key={a.id} className="act-item">
            <div className={`act-icon ${a.severity || ""}`}><i className={`ti ${a.icon}`} /></div>
            <div>
              <div className="act-body"><b>{a.by}</b> · <span style={{ color: "#6B6A68" }}>{a.dept}</span> — {a.action}</div>
              <div className="act-meta">Ref: <span style={{ fontFamily: "monospace" }}>{a.ref}</span></div>
            </div>
            <div className="act-time">{a.when}</div>
          </div>
        ))}
      </div>

      {/* Cashflow */}
      {cashflow && (
        <>
          <div className="sec-hdr">Cashflow</div>
          <div className="cf-chart">
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1917", marginBottom: 14 }}>Monthly Cashflow — Inflow vs Outflow</div>
            <CashflowChart cf={cashflow} />
          </div>
        </>
      )}
    </>
  );
}
