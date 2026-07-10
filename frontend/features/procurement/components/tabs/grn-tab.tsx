"use client";

import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/ui/table";
import { Badge, CodeTag } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { FilterChip, FilterRow } from "@/components/ui/filter-chip";
import { usePanel } from "@/components/layout/panel-provider";
import { fmtQ } from "@/lib/format";
import { procurementApi } from "@/features/procurement/api/client";
import type { GrnGroup, ScopeParams } from "@/features/procurement/api/types";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { GrnPanel } from "@/features/procurement/components/panels/grn-panel";

type GrnState = "complete" | "partial" | "pending";

function grnState(g: GrnGroup): GrnState {
  if (g.orderedQty > 0 && g.receivedQty >= g.orderedQty) return "complete";
  if (g.receivedQty > 0) return "partial";
  return "pending";
}

const STATE_META: Record<GrnState, { label: string; tone: "success" | "warn" | "neutral" }> = {
  complete: { label: "Complete", tone: "success" },
  partial: { label: "Partial", tone: "warn" },
  pending: { label: "Awaiting", tone: "neutral" },
};

export function GrnTab({ scope }: { scope: ScopeParams }) {
  const { openPanel } = usePanel();
  const { data, loading, error, refetch } = useQuery(() => procurementApi.getGrn(scope), [scope.project, scope.subProject]);
  const rows = data ?? [];
  const [search, setSearch] = useState("");
  const [state, setState] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (state !== "all" && grnState(r) !== state) return false;
      if (q && !r.code.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, state]);

  const columns: Column<GrnGroup>[] = [
    { key: "code", header: "Code", width: "110px", render: (r) => <CodeTag steel={r.code.startsWith("SS")}>{r.code}</CodeTag> },
    { key: "name", header: "Material", render: (r) => <span className="text-t11 text-ink">{r.name}</span> },
    { key: "po", header: "PO #", render: (r) => <span className="font-mono text-t10 text-muted">{r.po?.poNumber ?? "—"}</span> },
    { key: "ordered", header: "Ordered", align: "right", render: (r) => fmtQ(r.orderedQty) },
    { key: "received", header: "Received", align: "right", render: (r) => fmtQ(r.receivedQty) },
    { key: "grns", header: "GRNs", align: "center", render: (r) => r.grns.length },
    { key: "state", header: "Status", render: (r) => <Badge tone={STATE_META[grnState(r)].tone}>{STATE_META[grnState(r)].label}</Badge> },
  ];

  return (
    <div>
      <FilterRow>
        <SearchInput value={search} onChange={setSearch} placeholder="Search material…" className="w-56" />
        <span className="mx-1 h-4 w-px bg-line" aria-hidden />
        <FilterChip active={state === "all"} count={rows.length} onClick={() => setState("all")}>All</FilterChip>
        {(["complete", "partial", "pending"] as GrnState[]).map((s) => (
          <FilterChip key={s} active={state === s} onClick={() => setState(s)}>{STATE_META[s].label}</FilterChip>
        ))}
      </FilterRow>
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={error ?? "No goods receipts for this sub-project."}
        getRowKey={(r) => r.key}
        onRowClick={(r) =>
          openPanel({ tag: r.code, title: r.name, subtitle: `GRN · ${r.po?.poNumber ?? "no PO"}`, width: 400, body: <GrnPanel group={r} onMutated={refetch} /> })
        }
      />
    </div>
  );
}
