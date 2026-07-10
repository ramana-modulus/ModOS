"use client";

import { useMemo, useState } from "react";
import type { MatchResult } from "@/types/procurement";
import { DataTable, type Column } from "@/components/ui/table";
import { Badge, CodeTag } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { FilterChip, FilterRow } from "@/components/ui/filter-chip";
import { usePanel } from "@/components/layout/panel-provider";
import { fmtC } from "@/lib/format";
import { procurementApi } from "@/features/procurement/api/client";
import type { BillRow, ScopeParams } from "@/features/procurement/api/types";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { INVOICE_STATUS } from "@/features/procurement/status";

function MatchBadge({ label, result }: { label: string; result: MatchResult }) {
  return <Badge tone={result === "match" ? "success" : "danger"}>{label} {result === "match" ? "✓" : "✗"}</Badge>;
}

export function BillsTab({ scope }: { scope: ScopeParams }) {
  const { openPanel } = usePanel();
  const { data, loading, error } = useQuery(() => procurementApi.getBills(scope), [scope.project, scope.subProject]);
  const rows = data ?? [];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => (c[r.invoice.status] = (c[r.invoice.status] ?? 0) + 1));
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.invoice.status !== status) return false;
      if (q && !r.code.toLowerCase().includes(q) && !r.invoice.vendor.toLowerCase().includes(q) && !r.invoice.invId.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, status]);

  const columns: Column<BillRow>[] = [
    { key: "inv", header: "Invoice", width: "150px", render: (r) => <span className="font-mono text-t10 text-ink">{r.invoice.invId}</span> },
    { key: "vendor", header: "Vendor", render: (r) => (
        <div className="flex items-center gap-2">
          <CodeTag steel={r.code.startsWith("SS")}>{r.code}</CodeTag>
          <span className="text-t10 text-muted">{r.invoice.vendor}</span>
        </div>
      ) },
    { key: "value", header: "Invoice", align: "right", render: (r) => `₹${fmtC(r.invoice.invValue)}` },
    { key: "net", header: "Net Payable", align: "right", render: (r) => `₹${fmtC(r.invoice.netPayable)}` },
    { key: "match", header: "3-Way Match", render: (r) => (
        <div className="flex flex-wrap gap-1">
          <MatchBadge label="PO" result={r.invoice.matchPO} />
          <MatchBadge label="GRN" result={r.invoice.matchGRN} />
        </div>
      ) },
    { key: "status", header: "Status", render: (r) => <Badge tone={INVOICE_STATUS[r.invoice.status].tone}>{INVOICE_STATUS[r.invoice.status].label}</Badge> },
  ];

  return (
    <div>
      <FilterRow>
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoice or vendor…" className="w-56" />
        <span className="mx-1 h-4 w-px bg-line" aria-hidden />
        <FilterChip active={status === "all"} count={rows.length} onClick={() => setStatus("all")}>All</FilterChip>
        {(Object.keys(INVOICE_STATUS) as (keyof typeof INVOICE_STATUS)[])
          .filter((s) => statusCounts[s])
          .map((s) => (
            <FilterChip key={s} active={status === s} count={statusCounts[s]} onClick={() => setStatus(s)}>
              {INVOICE_STATUS[s].label}
            </FilterChip>
          ))}
      </FilterRow>
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={error ?? "No vendor bills for this sub-project."}
        getRowKey={(r) => r.key}
        onRowClick={(r) =>
          openPanel({
            tag: r.invoice.invId,
            title: r.invoice.vendor,
            subtitle: `${r.code} · ${r.name}`,
            width: 400,
            body: (
              <div>
                <Badge tone={INVOICE_STATUS[r.invoice.status].tone}>{INVOICE_STATUS[r.invoice.status].label}</Badge>
                <dl className="mt-3 text-t11">
                  {[
                    ["Invoice date", r.invoice.invDate],
                    ["Quantity", String(r.invoice.invQty)],
                    ["Rate", `₹${fmtC(r.invoice.invRate)}`],
                    ["Basic value", `₹${fmtC(r.invoice.invValue)}`],
                    [`GST @ ${r.invoice.gstPct}%`, `₹${fmtC(r.invoice.gst)}`],
                    [`TDS @ ${r.invoice.tdsPct}%`, `−₹${fmtC(r.invoice.tds)}`],
                    ["Net payable", `₹${fmtC(r.invoice.netPayable)}`],
                    ["PO match", r.invoice.matchPO],
                    ["GRN match", r.invoice.matchGRN],
                    ["Forwarded", r.invoice.forwardedToFinance ?? "—"],
                    ["Paid on", r.invoice.paidOn ?? "—"],
                    ["Pay ref", r.invoice.payRef ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b-[0.5px] border-line-soft py-1.5 last:border-b-0">
                      <dt className="text-t10 text-faint">{k}</dt>
                      <dd className="text-right font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                {r.invoice.note && <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-t10 leading-relaxed text-muted">{r.invoice.note}</p>}
              </div>
            ),
          })
        }
      />
    </div>
  );
}
