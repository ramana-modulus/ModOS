"use client";

import type { CashflowView } from "@/features/projects/types";

/** Stacked inflow-vs-outflow bar chart (`.cf-chart` internals + `.cf-legend`). */
export function CashflowChart({ cf }: { cf: CashflowView }) {
  const { months, maxVal, todayMonth } = cf;
  const todayIdx = months.findIndex((m) => m.m === todayMonth);

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 200, padding: "0 10px" }}>
        {months.map((m, idx) => {
          const inH = (m.inflow / maxVal) * 160;
          const procH = (m.outflow.proc / maxVal) * 160;
          const labH = (m.outflow.labour / maxVal) * 160;
          const ohH = (m.outflow.oh / maxVal) * 160;
          return (
            <div className="cf-bar-wrap" key={m.m}>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 170 }}>
                {/* Inflow bar */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 9, color: "#1F7A3D", fontWeight: 600, marginBottom: 2 }}>
                    {m.inflow > 0 ? `+₹${m.inflow.toFixed(1)}` : ""}
                  </div>
                  <div
                    className="cf-bar-in"
                    style={{ height: inH, width: 18 }}
                    title={`Inflow ₹${m.inflow.toFixed(2)} Cr`}
                  />
                </div>
                {/* Outflow stack */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 9, color: "#A32D2D", fontWeight: 600, marginBottom: 2 }}>
                    {`-₹${m.outTotal.toFixed(1)}`}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", width: 18 }}>
                    <div className="cf-bar-out-proc" style={{ height: procH }} title={`Procurement ₹${m.outflow.proc.toFixed(2)} Cr`} />
                    <div className="cf-bar-out-lab" style={{ height: labH }} title={`Labour ₹${m.outflow.labour.toFixed(2)} Cr`} />
                    <div className="cf-bar-out-oh" style={{ height: ohH }} title={`Overheads ₹${m.outflow.oh.toFixed(2)} Cr`} />
                  </div>
                </div>
              </div>
              <div className={`cf-bar-month ${idx === todayIdx ? "current" : ""}`}>{m.m}</div>
              <div style={{ fontSize: 9, color: m.balance >= 0 ? "#1F7A3D" : "#A32D2D", marginTop: 2, fontWeight: 600 }}>
                Bal: ₹{m.balance.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="cf-legend">
        <span><span className="cf-legend-sw" style={{ background: "#1FA855" }} />Inflow (Client AR)</span>
        <span><span className="cf-legend-sw" style={{ background: "#DC2626" }} />Procurement</span>
        <span><span className="cf-legend-sw" style={{ background: "#F97316" }} />Labour (Ops + Subcon)</span>
        <span><span className="cf-legend-sw" style={{ background: "#FBBF24" }} />Overheads</span>
        <span style={{ marginLeft: "auto", color: "#9B9894" }}>Running balance below each month</span>
      </div>
    </>
  );
}
