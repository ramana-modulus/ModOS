"use client";

import { useMemo, useState } from "react";
import {
  IconArrowBackUp,
  IconBolt,
  IconBoltFilled,
  IconCash,
  IconCircleCheckFilled,
  IconClock,
  IconCoin,
  IconFileText,
  IconMailFast,
  IconMailQuestion,
} from "@tabler/icons-react";
import type { Quote } from "@/types/procurement";
import type { QuoteItem, ScopeParams } from "@/features/procurement/api/types";
import { procurementApi } from "@/features/procurement/api/client";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { Pill } from "@/components/ui/badge";
import { CatBanner } from "@/features/procurement/components/cat-banner";
import { fmtC, fmtQ } from "@/lib/format";

function sidebarBadge(item: QuoteItem) {
  if (item.activeRC) return <span className="text-t9 font-semibold text-success" title="Rate Contract active">★ RC</span>;
  if (item.rfq && !item.rfq.closedAt && item.rfq.mode === "rfq") return <span className="text-t9 text-info">⏳ RFQ</span>;
  if (item.quotes.some((q) => q.selected)) return <span className="text-t9 text-success">L1 ✓</span>;
  if (item.quotes.length > 0) return <span className="text-t9 text-warn">{item.quotes.length} open</span>;
  return <span className="text-t9 text-danger">0 quotes</span>;
}

export function QuotesTab({ scope }: { scope: ScopeParams }) {
  const { data, loading, error, refetch } = useQuery(() => procurementApi.getQuotesView(scope), [scope.project, scope.subProject]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => data?.items ?? [], [data]);
  const catOrder = data?.catOrder ?? [];

  const activeCode = useMemo(() => {
    if (selected && items.some((i) => i.code === selected)) return selected;
    return (items.find((i) => i.quotes.length > 0) ?? items[0])?.code ?? null;
  }, [selected, items]);
  const item = items.find((i) => i.code === activeCode) ?? null;

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      refetch();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="px-3.5 py-8 text-center text-t11 text-faint">Loading quotations…</div>;
  if (error || !item) return <div className="rounded-lg bg-canvas p-8 text-center text-t11 text-faint">{error ?? "No BOM items."}</div>;

  const groups = catOrder
    .map((cat) => ({ cat, list: items.filter((i) => i.cat === cat) }))
    .filter((g) => g.list.length > 0);
  const sorted = [...item.quotes].sort((a, b) => a.rate - b.rate);
  const anySel = item.quotes.some((q) => q.selected);

  return (
    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <div>
        <div className="mb-1.5 px-1 text-t10 font-medium uppercase tracking-[0.6px] text-faint">BOM Items ({items.length})</div>
        <div className="max-h-[540px] overflow-y-auto rounded-md border-[0.5px] border-[#E5E4E0] bg-surface">
          {groups.map((g) => (
            <div key={g.cat}>
              <CatBanner cat={g.cat} count={g.list.length} noun="item" />
              {g.list.map((it) => {
                const active = it.code === activeCode;
                return (
                  <button
                    key={it.code}
                    type="button"
                    onClick={() => setSelected(it.code)}
                    className="block w-full border-b-[0.5px] border-[#F0EFEB] px-2.5 py-2 text-left"
                    style={{ background: active ? "#FBF0EC" : "#fff", borderLeft: `2px solid ${active ? "#C84B2F" : "transparent"}` }}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono text-t10 font-semibold text-warn">{it.code}</span>
                      {sidebarBadge(it)}
                    </div>
                    <div className="mt-0.5 text-t10 leading-[1.3] text-ink-soft">{it.name}</div>
                    <div className="mt-0.5 text-t9 text-faint">
                      {fmtQ(it.totalQty)} {it.uom}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3.5">
        {/* Item header */}
        <div className="mb-3 flex items-start justify-between gap-2.5 border-b-[0.5px] border-[#F0EFEB] pb-2.5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-t12 font-semibold text-warn">{item.code}</span>
              <span className="text-t13 font-semibold text-ink">{item.name}</span>
              {item.activeRC && (
                <span className="rounded-[10px] bg-success-soft px-2 py-0.5 text-t9 font-semibold tracking-[0.3px] text-success">★ RC AVAILABLE</span>
              )}
            </div>
            <div className="text-t10 text-muted">
              Total qty: <strong className="text-ink">{fmtQ(item.totalQty)} {item.uom}</strong> · From BOQ:{" "}
              {item.sourceBOQs.map((b, i) => (
                <span key={b}>
                  {i > 0 && " + "}
                  <span className="font-mono text-warn">{b}</span>
                </span>
              ))}
            </div>
            {item.sourceBOQs.length > 1 && (
              <div className="mt-0.5 text-t9 text-faint">Breakdown: {item.sources.map((s) => `${s.boq} (${fmtQ(s.qty)})`).join(" + ")}</div>
            )}
          </div>
        </div>

        {/* Active RC banner */}
        {item.activeRC && (
          <div className="mb-3 rounded-md border-[0.5px] border-success bg-success-soft px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <IconBoltFilled size={18} className="mt-px shrink-0 text-success" />
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-t11 font-semibold text-success">Active Rate Contract — skip RFQ, raise PO directly</div>
                  <span className="rounded-lg bg-surface px-2 py-0.5 font-mono text-t10 text-success">{item.activeRC.id}</span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5 text-t10 sm:grid-cols-4">
                  <div><div className="text-muted">Vendor</div><div className="font-medium text-ink">{item.activeRC.vendorName}</div></div>
                  <div><div className="text-muted">Locked Rate</div><div className="font-medium text-ink">₹{item.activeRC.rate}/{item.activeRC.uom}</div></div>
                  <div><div className="text-muted">Validity</div><div className="font-medium text-ink">{item.activeRC.validFrom} → {item.activeRC.validUntil}</div></div>
                  <div><div className="text-muted">Volume YTD</div><div className="font-medium text-ink">{fmtQ(item.activeRC.consumedYtd)} / {fmtQ(item.activeRC.volumeCommitMax)} {item.activeRC.uom}</div></div>
                </div>
                <div className="mt-1.5 text-t9 italic text-muted">{item.activeRC.paymentTerms} · {item.activeRC.freightTerms}</div>
              </div>
            </div>
          </div>
        )}

        {/* RFQ banner */}
        {item.rfq && item.rfq.mode === "rfq" && !item.rfq.closedAt && (
          <div className="mb-3 rounded-md border-[0.5px] border-info bg-info-soft px-3.5 py-3">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconMailFast size={14} className="text-info" />
                <span className="text-t11 font-semibold text-info">RFQ Open — {item.rfq.rfqId}</span>
              </div>
              <div className="text-t9 text-muted">Deadline: <strong>{item.rfq.deadline}</strong></div>
            </div>
          </div>
        )}
        {item.rfq && item.rfq.closedAt && (
          <div className="mb-2.5 flex items-center gap-2 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3 py-2 text-t10 text-muted">
            <IconMailFast size={12} className="text-success" />
            <span><strong>{item.rfq.rfqId}</strong> closed on {item.rfq.closedAt} — {item.rfq.closedReason}</span>
          </div>
        )}

        {/* Quote cards / empty */}
        {sorted.length === 0 ? (
          <div className="rounded-md bg-canvas p-6 text-center text-t11 text-faint">
            <IconMailQuestion size={24} className="mx-auto mb-2 text-[#D8D7D4]" />
            No quotes yet for this item.
            {!item.anyVendorHandles && (
              <div className="mt-2 text-t10 text-danger">⚠ No existing vendor handles this item — onboard a new vendor first (see Vendors tab).</div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(sorted.length, 3)}, minmax(0,1fr))` }}>
              {sorted.map((q, idx) => (
                <QuoteCard
                  key={q.id}
                  q={q}
                  rank={idx + 1}
                  uom={item.uom}
                  totalQty={item.totalQty}
                  hasPO={Boolean(item.po)}
                  anySel={anySel}
                  busy={busy}
                  onSelect={() => run(() => procurementApi.selectL1(item.key, q.id))}
                  onRevert={() => run(() => procurementApi.revertL1(item.key))}
                  onGeneratePO={() => run(() => procurementApi.generatePurchaseOrder(scope, item.key, q.id))}
                  poNumber={item.po?.poNumber}
                />
              ))}
            </div>
            {item.po && (
              <div className="flex items-center justify-between rounded-md border-[0.5px] border-success bg-[#F5F9F2] px-3 py-2.5 text-t10 text-success">
                <div>
                  <IconCircleCheckFilled size={13} className="mr-1 inline align-[-2px]" />
                  PO {item.po.poNumber} raised to {item.po.vendor} on {item.po.poDate}
                  {item.po.zohoRef ? ` · Synced to Zoho (${item.po.zohoRef})` : ""}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QuoteCard({
  q,
  rank,
  uom,
  totalQty,
  hasPO,
  anySel,
  busy,
  onSelect,
  onRevert,
  onGeneratePO,
  poNumber,
}: {
  q: Quote;
  rank: number;
  uom: string;
  totalQty: number;
  hasPO: boolean;
  anySel: boolean;
  busy: boolean;
  onSelect: () => void;
  onRevert: () => void;
  onGeneratePO: () => void;
  poNumber?: string;
}) {
  const isL1 = rank === 1;
  const isSel = q.selected;
  return (
    <div
      className="relative rounded-md border-[0.5px] p-3"
      style={{ borderColor: isSel ? "#C84B2F" : isL1 ? "#3B6D11" : "#E5E4E0", background: isSel ? "#FBF0EC" : "#fff" }}
    >
      {isSel && <div className="absolute right-2 top-2"><Pill cls="pg">✓ Selected</Pill></div>}
      <div className="mb-1 text-t10 font-semibold tracking-[0.5px] text-faint">L{rank} {isL1 ? "· LOWEST" : ""}</div>
      <div className="text-t12 font-semibold text-ink">{q.vendor}</div>
      <div className="mb-2 font-mono text-t9 text-faint">{q.vCode}</div>
      <div className="mb-1.5 flex items-baseline gap-1">
        <span className="text-t20 font-semibold text-ink">₹{q.rate}</span>
        <span className="text-t10 text-muted">/ {uom}</span>
      </div>
      <div className="mb-1 text-t10 text-ink-soft"><IconClock size={10} className="mr-1 inline align-[-1px]" />{q.leadTime} day lead time</div>
      {q.payTerms && <div className="mb-1 text-t10 text-ink-soft"><IconCash size={10} className="mr-1 inline align-[-1px]" />{q.payTerms}</div>}
      <div className="mb-2 text-t10 text-ink-soft"><IconCoin size={10} className="mr-1 inline align-[-1px] " />Total: ₹{fmtC(q.rate * totalQty)}</div>
      <div className="mb-2 flex items-center gap-1.5 rounded bg-canvas px-2 py-1.5 text-t10 text-ink-soft">
        <IconFileText size={11} className="text-warn" />
        <span className="truncate">{q.file}</span>
      </div>
      {q.note && <div className="mb-1.5 text-t9 italic text-muted">{q.note}</div>}
      <div className="mb-2 text-t9 text-faint">Received {q.date}</div>

      {!isSel && !hasPO && !anySel && (
        <button type="button" disabled={busy} onClick={onSelect} className="w-full rounded-md border-[0.5px] border-ink bg-ink px-2 py-1 text-t10 font-medium text-white disabled:opacity-50">
          Select as L1 →
        </button>
      )}
      {!isSel && !hasPO && anySel && (
        <>
          <button type="button" disabled className="w-full cursor-not-allowed rounded-md border-[0.5px] border-[#E5E4E0] bg-[#F0EFEB] px-2 py-1 text-t10 text-[#B0AEAA]">
            Select as L1 →
          </button>
          <div className="mt-1 text-center text-[8.5px] text-faint">Revert current L1 to switch</div>
        </>
      )}
      {isSel && !hasPO && (
        <>
          <button type="button" disabled={busy} onClick={onGeneratePO} className="w-full rounded-md border-[0.5px] border-accent bg-accent px-2 py-1 text-t10 font-medium text-white disabled:opacity-50">
            <IconBolt size={10} className="mr-1 inline align-[-1px]" />Generate PO →
          </button>
          <button type="button" onClick={onRevert} className="mx-auto mt-1.5 block cursor-pointer text-t9 text-faint underline">
            <IconArrowBackUp size={10} className="mr-0.5 inline align-[-1px]" />Revert L1 selection
          </button>
        </>
      )}
      {isSel && hasPO && (
        <div className="rounded bg-success-soft px-1.5 py-1.5 text-center text-t10 text-success">
          PO Raised: <strong>{poNumber}</strong>
        </div>
      )}
    </div>
  );
}
