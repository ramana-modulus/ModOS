"use client";

import type { BdStage, LeadView, StageId, StageThreshold } from "@/features/bizdev/types";
import { usePanel } from "@/components/layout/panel-provider";
import { bizdevApi } from "@/features/bizdev/api";
import { StageAgePill, TechTag, TypePill } from "./tags";
import { LeadPanel } from "./lead-panel";

const C = "60px 1fr 90px 60px 80px 80px 60px 80px 80px 70px";

export function DealsList({
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
  const stageOf = (id: string) => stages.find((s) => s.id === id);
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
    <div className="tw">
      <div className="th" style={{ gridTemplateColumns: C }}>
        <span>Ref</span>
        <span>Client / Description</span>
        <span>Tech Stack</span>
        <span>Type</span>
        <span>Est. Value</span>
        <span>Owner</span>
        <span>Chance</span>
        <span>Source</span>
        <span>Stage</span>
        <span>Age</span>
      </div>
      {leads.map((l) => {
        const st = stageOf(l.status);
        return (
          <div key={l.id} className="tr cursor-pointer" style={{ gridTemplateColumns: C }} onClick={() => open(l)}>
            <span className="ts">{l.ref}</span>
            <span>
              <div className="text-t11 font-medium">{l.client}</div>
              <div className="ts">{l.desc.slice(0, 45)}...</div>
            </span>
            <span className="flex flex-wrap gap-0.5">{l.tech.map((t) => <TechTag key={t} tech={t} />)}</span>
            <span><TypePill kind={l.type} /></span>
            <span className="text-t11 font-medium">{l.ev ? `₹${(l.ev / 100000).toFixed(1)}L` : "—"}</span>
            <span className="text-t10">{l.owner}</span>
            <span className="text-t10" style={{ color: l.ch >= 60 ? "#3B6D11" : "#854F0B" }}>{l.ch}%</span>
            <span className="text-t10 text-faint">{l.src}</span>
            <span>
              <span className="pill" style={{ background: st?.color, color: st?.tc }}>{st?.label ?? l.status}</span>
            </span>
            <span><StageAgePill status={l.status} days={l.daysInStage} stageLabel={st?.label ?? l.status} threshold={thresholds[l.status]} short /></span>
          </div>
        );
      })}
      {leads.length === 0 && <div className="p-5 text-center text-t11 text-faint">No deals in this filter.</div>}
    </div>
  );
}
