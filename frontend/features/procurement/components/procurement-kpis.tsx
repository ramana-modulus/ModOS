"use client";

import type { ProcurementSummary } from "@/types/procurement";
import { KpiCard, KpiGrid } from "@/components/ui/kpi";
import { fmtCompact } from "@/lib/format";

/** KPI strip scoped to the current sub-project (faithful to `renderProcurement`). */
export function ProcurementKpis({ summary }: { summary: ProcurementSummary }) {
  return (
    <KpiGrid>
      <KpiCard label="BOM Items" value={summary.totalItems} sub="aggregated materials" />
      <KpiCard
        label="With Quotes"
        value={summary.withQuotes}
        sub={`${summary.l1Selected} L1 selected`}
        tone="info"
      />
      <KpiCard label="POs Raised" value={summary.posRaised} sub={`${summary.rcCovered} RC-covered`} />
      <KpiCard
        label="Committed"
        value={`₹${fmtCompact(summary.committedValue)}`}
        sub="ordered value"
        tone="accent"
      />
      <KpiCard
        label="GRN Progress"
        value={`${summary.posFullGRN}/${summary.posRaised}`}
        sub={`${summary.posPartialGRN} partial`}
        tone="success"
      />
      <KpiCard
        label="AP Pending"
        value={summary.apPending}
        sub={`₹${fmtCompact(summary.apForwardedValue)} forwarded`}
        tone={summary.apPending > 0 ? "warn" : "neutral"}
      />
    </KpiGrid>
  );
}
