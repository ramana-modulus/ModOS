"use client";

import { useMemo, useState } from "react";
import { IconStarFilled } from "@tabler/icons-react";
import { DataTable, type Column } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { FilterChip, FilterRow } from "@/components/ui/filter-chip";
import { usePanel } from "@/components/layout/panel-provider";
import { fmtC } from "@/lib/format";
import { procurementApi } from "@/features/procurement/api/client";
import type { VendorRow } from "@/features/procurement/api/types";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { VENDOR_CATEGORY, VENDOR_STATUS } from "@/features/procurement/status";

export function VendorsTab() {
  const { openPanel } = usePanel();
  const { data, loading, error } = useQuery(() => procurementApi.getVendors(), []);
  const rows = data ?? [];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== "all" && r.vendor.category !== category) return false;
      if (q && !r.vendor.name.toLowerCase().includes(q) && !r.vendor.code.toLowerCase().includes(q) && !r.vendor.state.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, category]);

  const columns: Column<VendorRow>[] = [
    { key: "code", header: "Code", width: "90px", render: (r) => <span className="font-mono text-t10 text-muted">{r.vendor.code}</span> },
    { key: "name", header: "Vendor", render: (r) => (
        <div>
          <div className="text-t11 font-medium text-ink">{r.vendor.name}</div>
          <div className="text-t9 text-faint">{r.vendor.state} · {r.vendor.primary}</div>
        </div>
      ) },
    { key: "cat", header: "Category", render: (r) => <Badge tone={VENDOR_CATEGORY[r.vendor.category].tone}>{VENDOR_CATEGORY[r.vendor.category].label}</Badge> },
    { key: "rating", header: "Rating", align: "center", render: (r) => (r.vendor.rating != null ? (
          <span className="inline-flex items-center gap-0.5 text-ink">
            <IconStarFilled size={11} className="text-warn" /> {r.vendor.rating.toFixed(1)}
          </span>
        ) : <span className="text-faint">—</span>) },
    { key: "pos", header: "POs", align: "right", render: (r) => r.performance.poCount },
    { key: "spend", header: "Spend", align: "right", render: (r) => (r.performance.totalSpend ? `₹${fmtC(r.performance.totalSpend)}` : "—") },
    { key: "ontime", header: "On-time", align: "right", render: (r) => (r.performance.onTimePct != null ? `${r.performance.onTimePct}%` : "—") },
    { key: "status", header: "Status", render: (r) => <Badge tone={VENDOR_STATUS[r.vendor.status].tone}>{VENDOR_STATUS[r.vendor.status].label}</Badge> },
  ];

  return (
    <div>
      <FilterRow>
        <SearchInput value={search} onChange={setSearch} placeholder="Search vendor, code or state…" className="w-64" />
        <span className="mx-1 h-4 w-px bg-line" aria-hidden />
        <FilterChip active={category === "all"} count={rows.length} onClick={() => setCategory("all")}>All</FilterChip>
        {(["preferred", "standard", "probation"] as const).map((c) => (
          <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>{VENDOR_CATEGORY[c].label}</FilterChip>
        ))}
      </FilterRow>
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={error ?? "No vendors."}
        getRowKey={(r) => r.vendor.code}
        onRowClick={(r) =>
          openPanel({
            tag: r.vendor.code,
            title: r.vendor.name,
            subtitle: `${r.vendor.state} · onboarded ${r.vendor.onboardedOn}`,
            width: 400,
            body: (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={VENDOR_CATEGORY[r.vendor.category].tone}>{VENDOR_CATEGORY[r.vendor.category].label}</Badge>
                  <Badge tone={VENDOR_STATUS[r.vendor.status].tone}>{VENDOR_STATUS[r.vendor.status].label}</Badge>
                  <Badge tone={r.vendor.panVerified ? "success" : "warn"}>PAN {r.vendor.panVerified ? "verified" : "pending"}</Badge>
                </div>
                <dl className="mt-3 text-t11">
                  {[
                    ["GST", r.vendor.gstNumber],
                    ["MSME", r.vendor.msmeStatus === "msme" ? r.vendor.msmeCert ?? "MSME" : r.vendor.msmeStatus],
                    ["Payment terms", `${r.vendor.paymentTermsDays} days`],
                    ["Compliance until", r.vendor.complianceExpiry ?? "—"],
                    ["Phone", r.vendor.contact.phone],
                    ["Email", r.vendor.contact.email],
                    ["POs", String(r.performance.poCount)],
                    ["Total spend", r.performance.totalSpend ? `₹${fmtC(r.performance.totalSpend)}` : "—"],
                    ["On-time", r.performance.onTimePct != null ? `${r.performance.onTimePct}%` : "—"],
                    ["Quality", r.performance.qualityAvg ?? "—"],
                    ["Rate stability", r.performance.rateStability != null ? `${r.performance.rateStability}%` : "—"],
                    ["Rate contracts", String(r.rateContractCount)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b-[0.5px] border-line-soft py-1.5 last:border-b-0">
                      <dt className="text-t10 text-faint">{k}</dt>
                      <dd className="break-all text-right font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3">
                  <div className="mb-1 text-t9 font-medium uppercase tracking-[0.8px] text-faint">Handles</div>
                  <div className="flex flex-wrap gap-1">
                    {r.vendor.handles.map((h) => (
                      <span key={h} className="rounded border-[0.5px] border-line bg-neutral-soft px-1.5 py-0.5 font-mono text-t9 text-muted">{h}</span>
                    ))}
                  </div>
                </div>
                {r.vendor.probationNote && <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-t10 text-warn">{r.vendor.probationNote}</p>}
                {r.vendor.note && <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-t10 text-muted">{r.vendor.note}</p>}
              </div>
            ),
          })
        }
      />
    </div>
  );
}
