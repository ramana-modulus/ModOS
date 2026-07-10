"use client";

import type { ReactNode } from "react";
import type { BomRow } from "@/types/procurement";
import { Badge } from "@/components/ui/badge";
import { fmtC, fmtQ, fmtRupee } from "@/lib/format";
import { BOM_STATUS, PO_STATUS } from "@/features/procurement/status";

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b-[0.5px] border-line-soft py-1.5 text-t11 last:border-b-0">
      <span className="text-t10 text-faint">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="mb-1 border-t-[0.5px] border-line pt-3 text-t9 font-medium uppercase tracking-[0.8px] text-faint first:border-t-0 first:pt-0">
        {title}
      </div>
      {children}
    </div>
  );
}

/** Lifecycle detail for one BOM line — demand, rate variance, RC, RFQ and PO. */
export function BomRowDetail({ row }: { row: BomRow }) {
  const actualRate = row.po?.rate ?? row.l1?.rate ?? null;
  const variance = actualRate != null ? ((actualRate - row.rate) / row.rate) * 100 : null;

  return (
    <div>
      <Badge tone={BOM_STATUS[row.status].tone}>{BOM_STATUS[row.status].label}</Badge>

      <Section title="Demand">
        <DetailRow label="Total quantity" value={`${fmtQ(row.totalQty)} ${row.uom}`} />
        <DetailRow label="Basis" value={row.basis} />
        {row.sources.map((s, i) => (
          <DetailRow key={i} label={`↳ ${s.boq}`} value={`${fmtQ(s.qty)} ${row.uom}`} />
        ))}
      </Section>

      <Section title="Rate">
        <DetailRow label="Budget rate" value={fmtRupee(row.rate)} />
        {row.l1 && <DetailRow label={`L1 · ${row.l1.vendor}`} value={fmtRupee(row.l1.rate)} />}
        {row.po && <DetailRow label="PO rate" value={fmtRupee(row.po.rate)} />}
        {variance != null && (
          <DetailRow
            label="Variance vs budget"
            value={
              <span className={variance > 0 ? "text-danger" : "text-success"}>
                {variance > 0 ? "+" : ""}
                {variance.toFixed(1)}%
              </span>
            }
          />
        )}
      </Section>

      {row.activeRC && (
        <Section title="Rate Contract">
          <DetailRow label={row.activeRC.id} value={row.activeRC.vendorName} />
          <DetailRow label="Contract rate" value={`${fmtRupee(row.activeRC.rate)}/${row.activeRC.uom}`} />
          <DetailRow label="Valid until" value={row.activeRC.validUntil} />
        </Section>
      )}

      {row.rfq && (
        <Section title="RFQ">
          <DetailRow label={row.rfq.rfqId} value={row.rfq.mode === "rate_contract" ? "Rate contract" : "Open RFQ"} />
          <DetailRow label="Floated" value={row.rfq.floatedAt} />
          <DetailRow label="Invited" value={`${row.rfq.invitedVendors.length} vendor(s)`} />
          {row.rfq.closedReason && <DetailRow label="Closed" value={row.rfq.closedReason} />}
        </Section>
      )}

      {row.po ? (
        <Section title="Purchase Order">
          <DetailRow label={row.po.poNumber} value={<Badge tone={PO_STATUS[row.po.status].tone}>{PO_STATUS[row.po.status].label}</Badge>} />
          <DetailRow label="Vendor" value={row.po.vendor} />
          <DetailRow label="Ordered" value={`${fmtQ(row.po.qty)} ${row.po.uom}`} />
          <DetailRow label="Received" value={`${fmtQ(row.receivedQty)} ${row.po.uom}`} />
          <DetailRow label="Value" value={`₹${fmtC(row.po.value)}`} />
          {row.po.expDelivery && <DetailRow label="ETA" value={row.po.expDelivery} />}
        </Section>
      ) : (
        <Section title="Purchase Order">
          <p className="py-1.5 text-t10 text-faint">No PO raised yet.</p>
        </Section>
      )}
    </div>
  );
}
