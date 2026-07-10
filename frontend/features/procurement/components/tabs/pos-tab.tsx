"use client";

import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/ui/table";
import { Badge, CodeTag } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { FilterChip, FilterRow } from "@/components/ui/filter-chip";
import { usePanel } from "@/components/layout/panel-provider";
import { fmtC, fmtQ } from "@/lib/format";
import { procurementApi } from "@/features/procurement/api/client";
import type { PoRow, ScopeParams } from "@/features/procurement/api/types";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { PO_STATUS } from "@/features/procurement/status";

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-t9 text-faint">{pct}%</span>
    </div>
  );
}

export function PosTab({ scope }: { scope: ScopeParams }) {
  const { openPanel } = usePanel();
  const { data, loading, error } = useQuery(() => procurementApi.getPurchaseOrders(scope), [scope.project, scope.subProject]);
  const rows = data ?? [];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => (c[r.po.status] = (c[r.po.status] ?? 0) + 1));
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.po.status !== status) return false;
      if (q && !r.code.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) && !r.po.poNumber.toLowerCase().includes(q) && !r.po.vendor.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, status]);

  const columns: Column<PoRow>[] = [
    { key: "po", header: "PO #", width: "130px", render: (r) => <span className="font-mono text-t10 text-ink">{r.po.poNumber}</span> },
    { key: "material", header: "Material", render: (r) => (
        <div className="flex items-center gap-2">
          <CodeTag steel={r.code.startsWith("SS")}>{r.code}</CodeTag>
          <span className="text-t10 text-muted">{r.po.vendor}</span>
        </div>
      ) },
    { key: "qty", header: "Ordered", align: "right", render: (r) => `${fmtQ(r.po.qty)} ${r.po.uom}` },
    { key: "value", header: "Value", align: "right", render: (r) => `₹${fmtC(r.po.value)}` },
    { key: "recv", header: "Received", render: (r) => <ProgressBar value={r.receivedQty} total={r.po.qty} /> },
    { key: "approver", header: "Approver", render: (r) => <span className="text-t10 text-muted">{r.approverName}</span> },
    { key: "status", header: "Status", render: (r) => <Badge tone={PO_STATUS[r.po.status].tone}>{PO_STATUS[r.po.status].label}</Badge> },
  ];

  return (
    <div>
      <FilterRow>
        <SearchInput value={search} onChange={setSearch} placeholder="Search PO, material or vendor…" className="w-64" />
        <span className="mx-1 h-4 w-px bg-line" aria-hidden />
        <FilterChip active={status === "all"} count={rows.length} onClick={() => setStatus("all")}>All</FilterChip>
        {(Object.keys(PO_STATUS) as (keyof typeof PO_STATUS)[])
          .filter((s) => statusCounts[s])
          .map((s) => (
            <FilterChip key={s} active={status === s} count={statusCounts[s]} onClick={() => setStatus(s)}>
              {PO_STATUS[s].label}
            </FilterChip>
          ))}
      </FilterRow>
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={error ?? "No purchase orders for this sub-project."}
        getRowKey={(r) => r.key}
        onRowClick={(r) =>
          openPanel({
            tag: r.po.poNumber,
            title: r.name,
            subtitle: r.po.vendor,
            width: 380,
            body: (
              <dl className="text-t11">
                {[
                  ["Vendor", r.po.vendor],
                  ["Ordered", `${fmtQ(r.po.qty)} ${r.po.uom}`],
                  ["Received", `${fmtQ(r.receivedQty)} ${r.po.uom}`],
                  ["Rate", `₹${fmtC(r.po.rate)}/${r.po.uom}`],
                  ["Value", `₹${fmtC(r.po.value)}`],
                  ["PO date", r.po.poDate],
                  ["Expected", r.po.expDelivery],
                  ["Zoho ref", r.po.zohoRef ?? "—"],
                  ["Approver", r.approverName],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b-[0.5px] border-line-soft py-1.5 last:border-b-0">
                    <dt className="text-t10 text-faint">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
                {r.po.note && <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-t10 text-muted">{r.po.note}</p>}
              </dl>
            ),
          })
        }
      />
    </div>
  );
}
