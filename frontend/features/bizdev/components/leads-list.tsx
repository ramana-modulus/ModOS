"use client";

import type { BdStage, LeadView, StageId, StageThreshold } from "@/features/bizdev/types";
import { usePanel } from "@/components/layout/panel-provider";
import { bizdevApi } from "@/features/bizdev/api";
import { HeatPill, TechTag, TypePill } from "./tags";
import { LeadPanel } from "./lead-panel";

const C = "60px 100px 1fr 80px 60px 80px 60px 70px 80px";

export function LeadsList({
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
  void thresholds;
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
    <>
      <div className="tw">
        <div className="th" style={{ gridTemplateColumns: C }}>
          <span>Ref</span>
          <span>Date</span>
          <span>Client / Description</span>
          <span>Tech Stack</span>
          <span>Type</span>
          <span>Lead Type</span>
          <span>Chance</span>
          <span>Owner</span>
          <span>Action</span>
        </div>
        {leads.length ? (
          leads.map((l) => (
            <div key={l.id} className="tr cursor-pointer" style={{ gridTemplateColumns: C }} onClick={() => open(l)}>
              <span className="ts">{l.ref}</span>
              <span className="text-t10 text-faint">{l.date}</span>
              <span>
                <div className="text-t11 font-medium text-ink">{l.client} — {l.co}</div>
                <div className="ts">{l.desc.length > 45 ? l.desc.slice(0, 45) + "..." : l.desc}</div>
              </span>
              <span className="flex flex-wrap gap-0.5">{l.tech.map((t) => <TechTag key={t} tech={t} />)}</span>
              <span><TypePill kind={l.type} /></span>
              <span><HeatPill heat={l.lt} /></span>
              <span className="text-t10 font-medium" style={{ color: l.ch >= 60 ? "#3B6D11" : "#854F0B" }}>{l.ch}%</span>
              <span className="text-t10 text-muted">{l.owner}</span>
              <span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void move(l.id, "costing");
                  }}
                  className="rounded-md border-[0.5px] border-accent bg-accent px-[7px] py-[3px] text-t9 font-medium text-white"
                >
                  → Deal
                </button>
              </span>
            </div>
          ))
        ) : (
          <div className="p-5 text-center text-t11 text-faint">No leads in this filter.</div>
        )}
      </div>
      <div className="mt-1.5 text-t10 text-faint">Click &quot;→ Deal&quot; to convert a lead to the Deals pipeline and notify the Estimation team.</div>
    </>
  );
}
