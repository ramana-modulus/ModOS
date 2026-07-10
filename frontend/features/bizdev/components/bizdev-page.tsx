"use client";

import { useMemo, useState } from "react";
import { bizdevApi } from "@/features/bizdev/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import type { LeadView } from "@/features/bizdev/types";
import { LeadsList } from "./leads-list";
import { DealsKanban } from "./deals-kanban";
import { DealsList } from "./deals-list";
import { NewLeadModal } from "./new-lead-modal";

const DEAL_STATUSES = ["costing", "proposal", "negotiation", "won", "lost", "not_participated"];

function Kpi({ label, value, sub, tone }: { label: string; value: string | number; sub: string; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

export function BizDevPage() {
  const { data, loading, error, refetch } = useQuery(() => bizdevApi.getBizDev(), []);
  const [sub, setSub] = useState<"leads" | "deals">("leads");
  const [type, setType] = useState<"all" | "b2b" | "b2g">("all");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [newLeadOpen, setNewLeadOpen] = useState(false);

  const leadsAll = useMemo(() => data?.leads ?? [], [data]);
  const leads = leadsAll.filter((l) => l.type === "B2B" && l.status === "enquiry");
  const deals = leadsAll.filter((l) => DEAL_STATUSES.includes(l.status));
  const filteredDeals: LeadView[] = deals.filter((l) => (type === "b2b" ? l.type === "B2B" : type === "b2g" ? l.type === "B2G" : true));

  if (loading || !data) return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading pipeline…"}</div>;

  const { stats, stages, thresholds } = data;
  const cr = (b: boolean) => (b ? "cr" : "cg");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Top tabs */}
      <div className="vtabs mb-3">
        <div className={`vt${sub === "leads" ? " active" : ""}`} onClick={() => setSub("leads")}>
          Leads <span className="ml-0.5 rounded-lg bg-neutral-soft px-[5px] py-px text-t9">{leads.length}</span>
        </div>
        <div className={`vt${sub === "deals" ? " active" : ""}`} onClick={() => setSub("deals")}>
          Deals <span className="ml-0.5 rounded-lg bg-neutral-soft px-[5px] py-px text-t9">{deals.length}</span>
        </div>
      </div>

      {/* Secondary controls */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {sub === "deals" ? (
            ([
              ["all", "All"],
              ["b2b", "B2B"],
              ["b2g", "B2G Tender"],
            ] as const).map(([v, l]) => {
              const active = type === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setType(v)}
                  className="cursor-pointer rounded-[20px] border-[0.5px] px-2.5 py-[3px] text-t11"
                  style={{ borderColor: active ? "#C84B2F" : "#D8D7D4", background: active ? "#FAE9E4" : "#fff", color: active ? "#C84B2F" : "#6B6A68", fontWeight: active ? 500 : 400 }}
                >
                  {l}
                </button>
              );
            })
          ) : (
            <div className="self-center text-t10 text-faint">Private (B2B) pipeline · B2G tenders are sourced in Contracts</div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {sub === "deals" && (
            <>
              <button type="button" onClick={() => setView("kanban")} className="cursor-pointer rounded-md px-2.5 py-[3px] text-t11" style={{ background: view === "kanban" ? "#1A1917" : "#F5F4F2", color: view === "kanban" ? "#fff" : "#6B6A68" }}>⊞ Kanban</button>
              <button type="button" onClick={() => setView("list")} className="cursor-pointer rounded-md px-2.5 py-[3px] text-t11" style={{ background: view === "list" ? "#1A1917" : "#F5F4F2", color: view === "list" ? "#fff" : "#6B6A68" }}>≡ List</button>
            </>
          )}
          <button type="button" onClick={() => setNewLeadOpen(true)} className="rounded-md border-[0.5px] border-accent bg-accent px-2.5 py-1 text-t10 font-medium text-white">
            + {sub === "leads" ? "New Lead" : "New Deal"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-4">
        {sub === "leads" ? (
          <>
            <Kpi label="Total Leads" value={leads.length} sub="in enquiry stage" />
            <Kpi label="Hot Leads" value={leads.filter((l) => l.lt === "Hot").length} sub="high priority" tone="cr" />
            <Kpi label="Warm Leads" value={leads.filter((l) => l.lt === "Warm").length} sub="nurturing" tone="ca" />
            <Kpi label="Cold Leads" value={leads.filter((l) => l.lt === "Cold").length} sub="low priority" />
          </>
        ) : (
          <>
            <Kpi label="Pipeline Value" value={`₹${(stats.pipelineValue / 10000000).toFixed(1)}Cr`} sub={`${stats.pipelineCount} active deals`} />
            <Kpi label="Won (this year)" value={`₹${(stats.won / 100000).toFixed(0)}L`} sub={`${stats.wonCount} deals closed`} tone="cg" />
            <Kpi label="Costing Needed" value={stats.costingNeeded} sub="estimation queue" tone={cr(stats.costingNeeded > 0)} />
            <Kpi label="Active Deals" value={stats.activeDeals} sub="in progress" />
          </>
        )}
      </div>

      {/* Body */}
      <div className="-mx-3.5 min-h-0 flex-1 overflow-auto px-3.5 pb-3">
        {sub === "leads" && <LeadsList leads={leads} stages={stages} thresholds={thresholds} onMutated={refetch} />}
        {sub === "deals" && view === "kanban" && <DealsKanban leads={filteredDeals} stages={stages} thresholds={thresholds} onMutated={refetch} />}
        {sub === "deals" && view === "list" && <DealsList leads={filteredDeals} stages={stages} thresholds={thresholds} onMutated={refetch} />}
      </div>

      <NewLeadModal
        open={newLeadOpen}
        defaultType={sub === "leads" ? "B2B" : "B2B"}
        onClose={() => setNewLeadOpen(false)}
        onCreated={() => {
          setNewLeadOpen(false);
          setSub("leads");
          refetch();
        }}
      />
    </div>
  );
}
