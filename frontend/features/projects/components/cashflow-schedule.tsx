"use client";

import { useState } from "react";
import type { CashflowView } from "@/features/projects/types";
import { Pill } from "@/components/ui/badge";
import { CashflowChart } from "./cashflow-chart";

type CfView = "week" | "month" | "quarter";

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: "#9B9894", background: "#F5F4F2", borderRadius: 8 }}>
      {children}
    </div>
  );
}

/** Cashflow Schedule tab — KPI strip + stacked chart (Month) + detailed monthly table. */
export function CashflowSchedule({ cf, awarded }: { cf: CashflowView | null; awarded: boolean }) {
  const [view, setView] = useState<CfView>("month");

  if (!awarded) {
    return (
      <InfoBox>
        Cashflow schedule is derived from WBS + Billing milestones. Available after project is awarded and planning is
        approved.
      </InfoBox>
    );
  }
  if (!cf) {
    return (
      <InfoBox>
        Cashflow data not yet populated for this project. Available once WBS and billing milestones are entered in
        Planning.
      </InfoBox>
    );
  }

  const { months, totalIn, totalProc, totalLabour, totalOh, netCash, asOf, todayMonth } = cf;

  return (
    <div>
      {/* KPI strip */}
      <div className="kr" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 12 }}>
        <div className="kp"><div className="kl">Total Inflow (Plan)</div><div className="kv cg">₹{totalIn.toFixed(2)} Cr</div><div className="ks">across {months.length} months</div></div>
        <div className="kp"><div className="kl">Total Outflow (Plan)</div><div className="kv cr">₹{cf.totalOut.toFixed(2)} Cr</div><div className="ks">Proc + Labour + OH</div></div>
        <div className="kp"><div className="kl">Net Cash Position</div><div className={`kv ${netCash >= 0 ? "cg" : "cr"}`}>₹{netCash.toFixed(2)} Cr</div><div className="ks">end of project</div></div>
        <div className="kp"><div className="kl">As-of</div><div className="kv" style={{ fontSize: 13 }}>{asOf}</div><div className="ks">Current: {todayMonth}</div></div>
      </div>

      {/* Chart card */}
      <div className="cf-chart">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1917" }}>Monthly Cashflow — Inflow vs Outflow</div>
          <div className="cf-toggle">
            {(["week", "month", "quarter"] as const).map((v) => (
              <button key={v} type="button" className={`cf-toggle-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {view !== "month" ? (
          <div style={{ padding: 24, background: "#FBF9F6", border: "0.5px dashed #D8D7D4", borderRadius: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Pill cls="pac">Preview · drives off Finance</Pill>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1A1917" }}>
                {view === "week" ? "Weekly" : "Quarterly"} cashflow — planned vs actual
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#4A4945", lineHeight: 1.6 }}>
              {view === "week"
                ? "Weekly buckets of planned vs actual cash movement — answers what spend is coming next week, line-item-wise. Goes live once the Finance module feeds actual AP (payment runs) and AR (receipts) against the WBS-derived plan. Until then, Month shows the planned schedule."
                : "Quarterly roll-up for board-level cash position and forecast. Goes live alongside the Finance PnL + forecast engine. Month shows the underlying detail today."}
            </div>
          </div>
        ) : (
          <CashflowChart cf={cf} />
        )}
      </div>

      {/* Detailed table */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#1A1917", marginBottom: 6 }}>Monthly Schedule (Detailed)</div>
        <div className="tw">
          <div className="th" style={{ gridTemplateColumns: "1fr 100px 90px 90px 90px 100px 100px" }}>
            <span>Month</span><span>Inflow (AR)</span><span>Proc</span><span>Labour</span><span>OH</span><span>Net</span><span>Running Bal</span>
          </div>
          {months.map((m) => {
            const isCurrent = m.m === todayMonth;
            return (
              <div key={m.m} className="tr" style={{ gridTemplateColumns: "1fr 100px 90px 90px 90px 100px 100px", ...(isCurrent ? { background: "#FAEEDA" } : {}) }}>
                <span style={{ fontWeight: 600, color: "#1A1917" }}>
                  {m.m}
                  {isCurrent && <span style={{ fontSize: 9, color: "var(--ac)", fontWeight: 600, marginLeft: 4 }}>CURRENT</span>}
                </span>
                <span className="cg" style={{ fontWeight: 600 }}>{m.inflow > 0 ? `+₹${m.inflow.toFixed(2)} Cr` : "—"}</span>
                <span className="cr">-₹{m.outflow.proc.toFixed(2)} Cr</span>
                <span className="cr">-₹{m.outflow.labour.toFixed(2)} Cr</span>
                <span className="cr">-₹{m.outflow.oh.toFixed(2)} Cr</span>
                <span className={m.net >= 0 ? "cg" : "cr"} style={{ fontWeight: 600 }}>{m.net >= 0 ? "+" : ""}₹{m.net.toFixed(2)} Cr</span>
                <span className={m.balance >= 0 ? "cg" : "cr"} style={{ fontWeight: 600 }}>₹{m.balance.toFixed(2)} Cr</span>
              </div>
            );
          })}
          <div className="tr" style={{ gridTemplateColumns: "1fr 100px 90px 90px 90px 100px 100px", background: "#FAFAF9", borderTop: "1px solid #D8D7D4", fontWeight: 600 }}>
            <span>TOTAL</span>
            <span className="cg">+₹{totalIn.toFixed(2)} Cr</span>
            <span className="cr">-₹{totalProc.toFixed(2)} Cr</span>
            <span className="cr">-₹{totalLabour.toFixed(2)} Cr</span>
            <span className="cr">-₹{totalOh.toFixed(2)} Cr</span>
            <span className={netCash >= 0 ? "cg" : "cr"}>{netCash >= 0 ? "+" : ""}₹{netCash.toFixed(2)} Cr</span>
            <span className={netCash >= 0 ? "cg" : "cr"}>₹{netCash.toFixed(2)} Cr</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button className="tbb p" style={{ fontSize: 10 }} type="button"><i className="ti ti-download" /> Export PDF</button>
        <button className="tbb" style={{ fontSize: 10 }} type="button"><i className="ti ti-file-spreadsheet" /> Export Excel</button>
        <button className="tbb" style={{ fontSize: 10 }} type="button"><i className="ti ti-share" /> Share with Finance</button>
      </div>
    </div>
  );
}
