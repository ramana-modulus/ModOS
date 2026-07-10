"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { bizdevApi } from "@/features/bizdev/api";

const TECHS = ["PEB", "CISP", "Portacabin", "LGSF", "Kiosk", "Prefab Shelter"];
const SOURCES = ["Inbound", "Outbound", "Palladium", "GeM", "Tender247", "Referral"];
const inputCls = "w-full rounded-md border-[0.5px] border-input bg-surface px-2 py-1.5 text-t11 text-ink";
const labelCls = "mb-1 block text-t9 uppercase tracking-[0.4px] text-faint";

/** New-lead form (`openNewLeadModal` / `createLead`). */
export function NewLeadModal({
  open,
  defaultType,
  onClose,
  onCreated,
}: {
  open: boolean;
  defaultType: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState(defaultType);
  const [lt, setLt] = useState("Warm");
  const [src, setSrc] = useState("Inbound");
  const [client, setClient] = useState("");
  const [co, setCo] = useState("");
  const [desc, setDesc] = useState("");
  const [tech, setTech] = useState("PEB");
  const [area, setArea] = useState("");
  const [ev, setEv] = useState("");
  const [tr, setTr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setClient(""); setCo(""); setDesc(""); setArea(""); setEv(""); setTr(""); setError(null);
  };

  async function submit() {
    if (!client.trim() || !desc.trim()) {
      setError("Client and Description are required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await bizdevApi.createLead({
        type, lt, src, tech,
        client: client.trim(),
        co: co.trim() || undefined,
        desc: desc.trim(),
        area: area ? parseInt(area, 10) : 0,
        ev: ev ? parseInt(ev, 10) : null,
        tr: type === "B2G" ? tr.trim() : undefined,
      });
      reset();
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create lead");
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Lead"
      subtitle="Adds to the Leads pipeline (enquiry stage)"
      width={560}
      footer={
        <>
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={busy} onClick={submit}>{busy ? "Creating…" : "Create Lead"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Type</label>
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
            <option>B2B</option>
            <option>B2G</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Lead Heat</label>
          <select className={inputCls} value={lt} onChange={(e) => setLt(e.target.value)}>
            <option>Hot</option><option>Warm</option><option>Cold</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Source</label>
          <select className={inputCls} value={src} onChange={(e) => setSrc(e.target.value)}>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Client (contact) *</label>
          <input className={inputCls} value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Kesavan" />
        </div>
        <div>
          <label className={labelCls}>Company / Project</label>
          <input className={inputCls} value={co} onChange={(e) => setCo(e.target.value)} placeholder="e.g. Oragadam Warehouse" />
        </div>
      </div>

      <div className="mt-3">
        <label className={labelCls}>Description / Scope *</label>
        <input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. PEB Warehouse — 14,100 sqft" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Tech</label>
          <select className={inputCls} value={tech} onChange={(e) => setTech(e.target.value)}>
            {TECHS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Area (sqft)</label>
          <input className={inputCls} type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className={labelCls}>Est. Value (₹)</label>
          <input className={inputCls} type="number" value={ev} onChange={(e) => setEv(e.target.value)} placeholder="optional" />
        </div>
      </div>

      {type === "B2G" && (
        <div className="mt-3">
          <label className={labelCls}>Tender Reference</label>
          <input className={inputCls} value={tr} onChange={(e) => setTr(e.target.value)} placeholder="e.g. GEM/2026/B/7506141" />
        </div>
      )}

      {error && <p className="mt-3 text-t10 text-danger">{error}</p>}
    </Modal>
  );
}
