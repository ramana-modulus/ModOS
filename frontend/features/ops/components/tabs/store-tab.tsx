"use client";

import { useState } from "react";
import type { OpsPayload } from "@/features/ops/api";
import type { StoreMaterial } from "@/features/ops/domain";
import { fmtQ } from "@/lib/format";

type StoreView = "stock" | "received" | "log";

const REASON_COLOR: Record<string, string> = {
  grn: "#3B6D11",
  utilised: "#185FA5",
  wasted: "#854F0B",
  damaged: "#A32D2D",
  returned: "#7B1FA2",
};

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

function StockDetail({ m }: { m: StoreMaterial }) {
  const buckets: { label: string; value: number; bg: string; border: string; fg: string }[] = [
    { label: "RECEIVED", value: m.rec, bg: "#F3F9F0", border: "#D6E8CC", fg: "#3B6D11" },
    { label: "UTILISED", value: m.util, bg: "#EFF5FB", border: "#BBD4EC", fg: "#185FA5" },
    { label: "WASTE/DMG", value: m.waste + m.dmg, bg: "#FBF1E0", border: "#E5C9A0", fg: "#854F0B" },
    { label: "AVAILABLE", value: m.avail, bg: "#FBF9F6", border: "#E5E4E0", fg: "#6B6A68" },
  ];
  return (
    <div className="rounded-lg border-[0.5px] border-line bg-surface px-3.5 py-3">
      <div className="mb-2.5 flex items-start justify-between">
        <div>
          <div className="text-t12 font-bold">{m.code}</div>
          {m.name && <div className="mt-px text-t10 text-ink-soft">{m.name}</div>}
          <div className="text-t10 text-faint">Material ledger{m.uom ? ` · ${m.uom}` : ""}</div>
        </div>
      </div>
      <div className="mb-3 flex gap-2">
        {buckets.map((b) => (
          <div key={b.label} className="flex-1 rounded-md border-[0.5px] px-2.5 py-2" style={{ background: b.bg, borderColor: b.border }}>
            <div className="text-t9 font-semibold" style={{ color: b.fg }}>
              {b.label}
            </div>
            <div className="text-[14px] font-bold" style={{ color: b.label === "AVAILABLE" && b.value <= 0 ? "#A32D2D" : "#1A1917" }}>
              {fmtQ(b.value)}
            </div>
          </div>
        ))}
      </div>
      <div className="mb-1.5 text-t10 font-bold uppercase tracking-[0.4px] text-muted">History</div>
      <table className="t text-t10">
        <thead>
          <tr>
            <th>Date</th>
            <th>Movement</th>
            <th className="text-right">Qty</th>
            <th>By</th>
            <th>Ref / Note</th>
          </tr>
        </thead>
        <tbody>
          {m.ledger.map((e, i) => (
            <tr key={i}>
              <td className="whitespace-nowrap">{e.date}</td>
              <td>
                <span className="font-semibold" style={{ color: REASON_COLOR[e.kind === "grn" ? "grn" : e.reason ?? "utilised"] ?? "#6B6A68" }}>
                  {e.label}
                </span>
              </td>
              <td className="text-right font-bold" style={{ color: e.delta >= 0 ? "#3B6D11" : "#A32D2D" }}>
                {e.delta >= 0 ? "+" : ""}
                {fmtQ(e.delta)}
              </td>
              <td className="text-muted">{e.by}</td>
              <td className="text-muted">
                {e.ref && <span className="font-mono text-t9">{e.ref} </span>}
                {e.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StoreTab({ data }: { data: OpsPayload }) {
  const { store, grn, storeIssues } = data;
  const [view, setView] = useState<StoreView>("stock");
  const [selCode, setSelCode] = useState<string | null>(null);

  const totRec = store.reduce((s, m) => s + m.rec, 0);
  const totUtil = store.reduce((s, m) => s + m.util, 0);
  const totLoss = store.reduce((s, m) => s + m.waste + m.dmg, 0);
  const totAvail = store.reduce((s, m) => s + m.avail, 0);
  const lowCount = store.filter((m) => m.avail <= 0 && m.rec > 0).length;

  const sel = (selCode && store.find((m) => m.code === selCode)) || store[0] || null;
  const views: [StoreView, string][] = [
    ["stock", "Current Stock"],
    ["received", "Stock Received"],
    ["log", "Consumption Log"],
  ];

  return (
    <div>
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Total Received" value={fmtQ(totRec)} sub={`from ${store.length} material(s) · GRN`} />
        <Kpi label="Under Inspection" value={fmtQ(0)} sub="none held" tone="cg" />
        <Kpi label="Rejected" value={fmtQ(0)} sub="none rejected" tone="cg" />
        <Kpi label="Consumed (Utilised)" value={fmtQ(totUtil)} sub="issued into work" />
        <Kpi label="Waste + Damage" value={fmtQ(totLoss)} sub={totRec > 0 ? `${((totLoss / totRec) * 100).toFixed(1)}% of received` : "—"} tone={totLoss > 0 ? "ca" : "cg"} />
        <Kpi label="Available on Site" value={fmtQ(totAvail)} sub={lowCount > 0 ? `${lowCount} depleted` : "in stock"} tone={lowCount > 0 ? "cac" : "cg"} />
      </div>

      <div className="vtabs mb-2.5">
        {views.map((v) => (
          <div
            key={v[0]}
            className={`vt${view === v[0] ? " active" : ""}`}
            onClick={() => {
              setView(v[0]);
              setSelCode(null);
            }}
          >
            {v[1]}
          </div>
        ))}
      </div>

      {view === "stock" && (
        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
          <table className="t text-t10">
            <thead>
              <tr>
                <th>Material</th>
                <th>Description</th>
                <th className="text-right">Received</th>
                <th className="text-right">Consumed</th>
                <th className="text-right">Available</th>
              </tr>
            </thead>
            <tbody>
              {store.map((m) => {
                const isSel = sel?.code === m.code;
                return (
                  <tr key={m.code} className="cursor-pointer" style={{ background: isSel ? "#FBF5EF" : undefined }} onClick={() => setSelCode(m.code)}>
                    <td>
                      <b>{m.code}</b>
                      {m.uom && <span className="text-t9 text-faint"> {m.uom}</span>}
                    </td>
                    <td className="max-w-[230px] text-t10 leading-tight text-ink-soft">{m.name || "—"}</td>
                    <td className="text-right">{fmtQ(m.rec)}</td>
                    <td className="text-right text-muted">{fmtQ(m.iss)}</td>
                    <td className="text-right font-bold" style={{ color: m.avail <= 0 ? "#A32D2D" : m.avail < m.rec * 0.15 ? "#854F0B" : "#1A1917" }}>
                      {fmtQ(m.avail)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sel && <StockDetail m={sel} />}
        </div>
      )}

      {view === "received" && (
        <table className="t text-t10">
          <thead>
            <tr>
              <th>GRN</th>
              <th>Date</th>
              <th>Material</th>
              <th>Description</th>
              <th>PO</th>
              <th className="text-right">Received</th>
              <th className="text-right">Rejected</th>
              <th>Condition</th>
              <th>Batch</th>
            </tr>
          </thead>
          <tbody>
            {grn.map((g) => (
              <tr key={g.grnId}>
                <td>
                  <b>{g.grnId}</b>
                </td>
                <td className="whitespace-nowrap">{g.date}</td>
                <td>{g.code}</td>
                <td className="max-w-[230px] text-t10 leading-tight text-ink-soft">{g.materialName || "—"}</td>
                <td className="font-mono text-t9">{g.poNumber}</td>
                <td className="text-right font-semibold">{fmtQ(g.qtyReceived)}</td>
                <td className="text-right" style={{ color: g.rejectedQty > 0 ? "#A32D2D" : "#9B9894" }}>
                  {g.rejectedQty ? fmtQ(g.rejectedQty) : "—"}
                </td>
                <td>
                  <span className={`pill ${g.condition === "good" ? "pg" : "pa"}`} style={{ fontSize: 8, padding: "2px 6px" }}>
                    {g.condition}
                  </span>
                </td>
                <td className="text-t9 text-muted">{(g.batchNos || []).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {view === "log" && (
        <table className="t text-t10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Material</th>
              <th className="text-right">Qty</th>
              <th>Reason</th>
              <th>To line</th>
              <th>By</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {storeIssues.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td className="whitespace-nowrap">{i.date}</td>
                <td>
                  <b>{i.matCode}</b>
                </td>
                <td className="text-right font-semibold">
                  {fmtQ(i.qty)} {i.uom || ""}
                </td>
                <td>
                  <span className="font-semibold capitalize" style={{ color: REASON_COLOR[i.reason || "utilised"] }}>
                    {i.reason || "utilised"}
                  </span>
                </td>
                <td>{i.toCode ? <span className="font-mono text-t9">{i.toCode}</span> : "—"}</td>
                <td className="text-muted">{i.by}</td>
                <td className="text-muted">{i.note || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
