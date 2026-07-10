"use client";

import { useState } from "react";
import type { GrnGroup } from "@/features/procurement/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePanel } from "@/components/layout/panel-provider";
import { fmtQ } from "@/lib/format";
import { procurementApi } from "@/features/procurement/api/client";

/** GRN history for a line + a form to record a fresh delivery (calls the API). */
export function GrnPanel({ group, onMutated }: { group: GrnGroup; onMutated: () => void }) {
  const { closePanel } = usePanel();
  const pending = Math.max(0, group.orderedQty - group.receivedQty);
  const [qty, setQty] = useState<string>(pending ? String(pending) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function record() {
    const n = Number(qty);
    if (!n || n <= 0) {
      setError("Enter a positive quantity");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await procurementApi.recordGrn(group.key, n, "Vinod K (Site Store)");
      onMutated();
      closePanel();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record GRN");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-3 rounded-lg bg-canvas px-3 py-2 text-t10 text-muted">
        Ordered <span className="font-semibold text-ink">{fmtQ(group.orderedQty)}</span> · Received{" "}
        <span className="font-semibold text-ink">{fmtQ(group.receivedQty)}</span> · Pending{" "}
        <span className="font-semibold text-warn">{fmtQ(pending)}</span>
      </div>

      <div className="mb-1 text-t9 font-medium uppercase tracking-[0.8px] text-faint">Receipts</div>
      {group.grns.length === 0 && <p className="py-2 text-t10 text-faint">No deliveries recorded yet.</p>}
      <div className="space-y-2">
        {group.grns.map((g) => (
          <div key={g.grnId} className="rounded-lg border-[0.5px] border-line bg-surface px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-t10 text-ink">{g.grnId}</span>
              <Badge tone={g.rejectedQty > 0 ? "danger" : "success"}>
                {fmtQ(g.qtyReceived)} received
              </Badge>
            </div>
            <div className="mt-1 text-t9 text-faint">
              {g.date} · {g.receivedBy}
              {g.batchNos.length > 0 && <> · batch {g.batchNos.join(", ")}</>}
            </div>
            {g.note && <div className="mt-1 text-t9 text-muted">{g.note}</div>}
          </div>
        ))}
      </div>

      {group.po && pending > 0 && (
        <div className="mt-4 border-t-[0.5px] border-line pt-3">
          <label htmlFor="grn-qty" className="mb-1 block text-t9 font-medium uppercase tracking-[0.5px] text-faint">
            Record delivery
          </label>
          <div className="flex items-center gap-2">
            <input
              id="grn-qty"
              type="number"
              min={0}
              max={pending}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-24 rounded-md border-[0.5px] border-input bg-surface px-2 py-[5px] text-right text-t11 text-ink"
            />
            <span className="text-t10 text-faint">{group.po.uom}</span>
            <Button variant="primary" size="sm" disabled={busy} onClick={record} className="ml-auto">
              {busy ? "Saving…" : "Record GRN"}
            </Button>
          </div>
          {error && <p className="mt-2 text-t10 text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
