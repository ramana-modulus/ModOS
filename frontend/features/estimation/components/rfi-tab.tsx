"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { EstRfi } from "@/features/estimation/types";
import { EST_RFIS_SEED, nextRfiId } from "@/features/estimation/data/rfis";

const STATUS_STYLE: Record<EstRfi["status"], { color: string; bg: string; label: string }> = {
  open: { color: "#854F0B", bg: "#F6ECD9", label: "Open" },
  answered: { color: "#185FA5", bg: "#E3EEF7", label: "Answered" },
  closed: { color: "#3B6D11", bg: "#EAF3E0", label: "Closed" },
};

function RfiCard({ r, onClose }: { r: EstRfi; onClose: (id: string) => void }) {
  const s = STATUS_STYLE[r.status];
  return (
    <div style={{ padding: "10px 14px", borderBottom: "0.5px solid #F0EFED" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#7B1FA2" }}>
          {r.id} <span style={{ color: "#9B9894", fontWeight: 400 }}>· {r.raisedBy} · {r.raisedOn}</span>
        </span>
        <span style={{ fontSize: 9.5, fontWeight: 600, color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 10 }}>{s.label}</span>
      </div>
      <div style={{ fontSize: 11.5, color: "#1A1917", marginBottom: 6 }}>{r.question}</div>
      {r.answer && (
        <div style={{ fontSize: 11, color: "#3B6D11", background: "#F5F8F0", padding: "7px 10px", borderRadius: 6, borderLeft: "2px solid #3B6D11" }}>
          ↳ {r.answer} <span style={{ color: "#9B9894" }}>— {r.answeredBy}, {r.answeredOn}</span>
        </div>
      )}
      {r.status === "answered" && (
        <div style={{ marginTop: 8 }}>
          <button type="button" className="tbb p" style={{ fontSize: 10 }} onClick={() => onClose(r.id)}>Acknowledge / Close</button>
        </div>
      )}
    </div>
  );
}

/** RFI to Contracts tab (`renderEstRFI`). Estimation raises queries; Contracts
 * answers at pre-bid; Estimation acknowledges/closes. Client-state demo. */
export function RfiTab({ projectId, clientName, today }: { projectId: string; clientName: string; today: string }) {
  const [rfis, setRfis] = useState<EstRfi[]>(() => EST_RFIS_SEED.filter((r) => r.tenderId === projectId).map((r) => ({ ...r })));
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [by, setBy] = useState("Estimation");
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!q.trim()) { setErr("Enter the query"); return; }
    setRfis((prev) => [
      { id: nextRfiId(), tenderId: projectId, raisedBy: `${by.trim() || "Estimation"} (Estimation)`, raisedOn: today, question: q.trim(), answer: "", answeredBy: "", answeredOn: "", status: "open" },
      ...prev,
    ]);
    setQ("");
    setErr(null);
    setRaiseOpen(false);
  };
  const closeRfi = (id: string) => setRfis((prev) => prev.map((r) => (r.id === id ? { ...r, status: "closed" } : r)));

  return (
    <div style={{ background: "#fff", border: "0.5px solid #E8E7E4", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #E8E7E4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1917" }}>RFIs — queries to Contracts for {clientName}</span>
          <div style={{ fontSize: 10, color: "#9B9894", marginTop: 1 }}>Raise the information you need to complete costing. Contracts answers at pre-bid and circulates back.</div>
        </div>
        <button type="button" className="tbb p" style={{ fontSize: 10 }} onClick={() => setRaiseOpen(true)}>+ Raise RFI</button>
      </div>
      {rfis.length ? (
        <div style={{ padding: "4px 0" }}>
          {rfis.map((r) => <RfiCard key={r.id} r={r} onClose={closeRfi} />)}
        </div>
      ) : (
        <div style={{ padding: 30, textAlign: "center", color: "#9B9894", fontSize: 12 }}>
          No RFIs raised yet for this tender. Click <strong style={{ color: "#7B1FA2" }}>+ Raise RFI</strong> to send a query to Contracts.
        </div>
      )}

      <Modal
        open={raiseOpen}
        onClose={() => setRaiseOpen(false)}
        title="Raise RFI to Contracts"
        width={520}
        footer={
          <>
            <Button variant="default" onClick={() => setRaiseOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>Send to Contracts</Button>
          </>
        }
      >
        <label className="mb-1 block text-t9 uppercase tracking-[0.4px] text-faint">Raised by</label>
        <input className="mb-3 w-full rounded-md border-[0.5px] border-input bg-surface px-2 py-1.5 text-t11 text-ink" value={by} onChange={(e) => setBy(e.target.value)} />
        <label className="mb-1 block text-t9 uppercase tracking-[0.4px] text-faint">Query / information needed for costing</label>
        <textarea
          className="w-full rounded-md border-[0.5px] border-input bg-surface px-2 py-1.5 text-t11 text-ink"
          rows={4}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. BOQ silent on floor finish — vinyl or screed? Rate impact ±₹180/sqft."
        />
        {err && <p className="mt-2 text-t10 text-danger">{err}</p>}
      </Modal>
    </div>
  );
}
