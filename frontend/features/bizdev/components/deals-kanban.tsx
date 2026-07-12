"use client";

import type { BdStage, LeadView, StageId, StageThreshold } from "@/features/bizdev/types";
import { usePanel } from "@/components/layout/panel-provider";
import { bizdevApi } from "@/features/bizdev/api";
import { CostingBadge, StageAgePill, TechTag, TypePill } from "./tags";
import { LeadPanel } from "./lead-panel";

const DEAL_STATUSES = new Set(["costing", "proposal", "negotiation", "won", "lost", "not_participated"]);

export function DealsKanban({
  leads,
  stages,
  thresholds,
  onMutated,
  onEditLead,
}: {
  leads: LeadView[];
  stages: BdStage[];
  thresholds: Partial<Record<StageId, StageThreshold>>;
  onMutated: () => void;
  onEditLead?: (lead: LeadView) => void;
}) {
  const { openPanel, closePanel } = usePanel();
  const cols = stages.filter((s) => DEAL_STATUSES.has(s.id));
  const move = async (id: string, toStage: string) => {
    await bizdevApi.moveStage(id, toStage);
    onMutated();
    closePanel();
  };
  const open = (l: LeadView) =>
    openPanel({
      tag: `${l.ref} · ${l.type}`,
      title: `${l.client} — ${l.co}`,
      width: 468,
      body: (
        <LeadPanel
          lead={l}
          stages={stages}
          onMove={(s) => move(l.id, s)}
          onEdit={onEditLead ? () => { closePanel(); onEditLead(l); } : undefined}
        />
      ),
    });

  return (
    <div className="bd-kanban">
      {cols.map((st) => {
        const sl = leads.filter((l) => l.status === st.id);
        const tv = sl.reduce((s, l) => s + (l.ev || 0), 0);
        return (
          <div key={st.id} className="bd-col">
            <div className="bd-col-hdr" style={{ background: st.color }}>
              <div className="bd-col-title" style={{ color: st.tc }}>
                {st.label} <span className="font-normal opacity-70">{sl.length}</span>
              </div>
              {tv > 0 && (
                <div className="bd-col-meta" style={{ color: st.tc }}>
                  ₹{(tv / 100000).toFixed(1)}L
                </div>
              )}
            </div>
            {sl.length ? (
              sl.map((l) => (
                <div key={l.id} className="bd-card" onClick={() => open(l)}>
                  <div className="bd-card-ref">{l.ref} · {l.type}</div>
                  <div className="bd-card-name">{l.client}</div>
                  <div className="bd-card-desc">{l.desc.length > 55 ? l.desc.slice(0, 55) + "..." : l.desc}</div>
                  <div className="mb-[3px] flex flex-wrap items-center gap-[3px]">
                    {l.tech.map((t) => <TechTag key={t} tech={t} />)}
                    <TypePill kind={l.type} />
                  </div>
                  <div className="bd-card-val">{l.ev ? `₹${(l.ev / 100000).toFixed(1)}L` : "—"}</div>
                  <div className="bd-card-meta">
                    {l.owner} · {l.date} <span className="text-faint">({l.daysSinceCreated}d ago)</span>
                  </div>
                  <div className="mt-[3px]">
                    <StageAgePill status={l.status} days={l.daysInStage} stageLabel={st.label} threshold={thresholds[l.status]} />
                  </div>
                  {l.dl && <div className="bd-card-due">⏱ {l.dl}</div>}
                  {l.status === "costing" && (
                    <div className="mt-1">
                      <CostingBadge received={l.costingReceived} />
                    </div>
                  )}
                  {l.tr && <div className="mt-0.5 font-mono text-t9 text-faint">{l.tr}</div>}
                </div>
              ))
            ) : (
              <div className="p-2.5 text-center text-t10 text-faint">No leads</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
