"use client";

import { useState } from "react";
import { Pill } from "@/components/ui/badge";
import { usePanel } from "@/components/layout/panel-provider";
import { getStageSummary } from "@/features/engineering/domain";
import type { EngineeringPayload } from "@/features/engineering/api";
import type { Discipline, DisciplineFilter, DrwStatus, EngDrawingView, StageKey, StageSummary } from "@/features/engineering/types";
import { DRW_STATUS_META, STAGE_META, STAGE_STATUS_META, DrwStatusPill, EmptyState } from "./eng-ui";

const DISCIPLINES: { key: Discipline; label: string; icon: string; color: string }[] = [
  { key: "structure", label: "Structural", icon: "◫", color: "#185FA5" },
  { key: "architecture", label: "Architecture", icon: "▤", color: "#7B1FA2" },
  { key: "mep", label: "MEP", icon: "⚡", color: "#854F0B" },
];

const BREAKDOWN_ORDER: DrwStatus[] = ["pending", "in_progress", "submitted", "in_approval", "rework", "approved"];

/** Read-only drawing detail body (replaces the pin-annotation viewer). */
function DrawingDetailBody({ d }: { d: EngDrawingView }) {
  const pins = d.comments ?? [];
  const hist = d.drwVersionHistory ?? [];
  return (
    <div className="flex flex-col gap-3 text-t10">
      <div className="grid grid-cols-2 gap-2">
        <Meta label="Discipline" value={d.disc} />
        <Meta label="Stage" value={d.stage} />
        <Meta label="Revision" value={d.rev} />
        <Meta label="Version" value={d.drwVersion ?? "—"} />
        <Meta label="Uploaded by" value={`${d.by} · ${d.date}`} />
        <Meta label="Size" value={d.size} />
        {d.apprBy && <Meta label="Approved by" value={d.apprBy} />}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-t9 text-faint">Status</span>
        <DrwStatusPill status={d.drwStatus} />
      </div>

      <div>
        <div className="mb-1.5 text-t9 font-medium uppercase tracking-[0.5px] text-faint">
          Pins / comments ({pins.filter((c) => !c.resolved).length} open · {pins.length} total)
        </div>
        {pins.length === 0 ? (
          <div className="rounded-md bg-subtle px-2.5 py-2 text-t9 italic text-faint">No review pins on this drawing.</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {pins.map((c) => (
              <div
                key={c.id}
                className="rounded-md border-[0.5px] px-2.5 py-1.5"
                style={{ borderColor: c.resolved ? "#E5E4E0" : "#A32D2D" }}
              >
                <div className="mb-1 flex items-center gap-1.5 text-t9 text-faint">
                  <span>{c.resolved ? "✅" : "📌"}</span>
                  <span>
                    {c.by} · {c.role} · {c.date}
                    {c.resolved ? " · resolved" : ""}
                  </span>
                  {c.rfi && <span className="ml-auto font-mono text-danger">{c.rfi}</span>}
                </div>
                <div className="text-t10 leading-snug text-ink">{c.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {hist.length > 0 && (
        <div>
          <div className="mb-1.5 text-t9 font-medium uppercase tracking-[0.5px] text-faint">Version history</div>
          <div className="flex flex-col gap-1.5">
            {[...hist].reverse().map((v, i) => (
              <div key={i} className="rounded-md bg-subtle px-2.5 py-1.5">
                <div className="mb-0.5 flex items-baseline gap-1.5">
                  <span className="font-mono text-t10 font-semibold text-ink">{v.v}</span>
                  {v.decision && (
                    <span className={v.decision === "approved" ? "text-success" : "text-danger"}>
                      {v.decision === "approved" ? "✓ approved" : "✗ rejected"}
                    </span>
                  )}
                  <span className="ml-auto text-t9 text-faint">{v.reviewedAt ?? v.submittedAt}</span>
                </div>
                {v.comments && <div className="text-t9 italic text-muted">{v.comments}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-t8 uppercase tracking-[0.5px] text-faint">{label}</div>
      <div className="capitalize text-t10 text-ink">{value}</div>
    </div>
  );
}

function StageCard({
  summary,
  onOpen,
}: {
  summary: StageSummary;
  onOpen: (d: EngDrawingView) => void;
}) {
  const meta = STAGE_META[summary.stage]!;
  const derived =
    summary.derivedStatus === "approved"
      ? { border: "#7BAF3E", tint: "#EAF3DE50", pill: "pg" as const, label: "Approved" }
      : summary.derivedStatus === "in_progress"
        ? { border: "#E8B86D", tint: "#FFF8EC50", pill: "pa" as const, label: "In Progress" }
        : { border: "#E5E4E0", tint: "#FBF9F6", pill: "pgr" as const, label: "Empty" };

  const chips = BREAKDOWN_ORDER.filter((s) => summary.byStatus[s] > 0);

  return (
    <div className="relative rounded-md border-[0.5px] p-2.5" style={{ borderColor: derived.border, background: derived.tint }}>
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-t11 font-semibold text-ink">{meta.label}</span>
        <div className="flex items-center gap-1">
          {summary.total > 0 && (
            <span
              className="text-t10 font-semibold"
              style={{ color: summary.pctApproved === 100 ? "#3B6D11" : summary.pctApproved > 0 ? "#854F0B" : "#9B9894" }}
            >
              {summary.approved}/{summary.total} · {summary.pctApproved}%
            </span>
          )}
          <Pill cls={derived.pill}>{derived.label}</Pill>
        </div>
      </div>
      <div className="mb-1.5 text-t9 text-faint">{meta.sub}</div>

      {chips.length > 1 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {chips.map((s) => (
            <Pill key={s} cls={DRW_STATUS_META[s].pill}>
              {summary.byStatus[s]} {DRW_STATUS_META[s].label}
            </Pill>
          ))}
        </div>
      )}

      {summary.drawings.length === 0 ? (
        <div className="rounded border-[0.5px] border-dashed border-line bg-canvas px-2 py-2 text-center text-t9 italic text-faint">
          No drawings yet
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {summary.drawings.map((d) => {
            const dm = DRW_STATUS_META[d.drwStatus];
            const openPins = (d.comments ?? []).filter((c) => !c.resolved).length;
            const totalPins = (d.comments ?? []).length;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onOpen(d)}
                className="flex items-center gap-1.5 rounded border-[0.5px] border-line bg-surface px-1.5 py-1 text-left text-t9"
              >
                <span className="flex-shrink-0">📄</span>
                <span className="min-w-0 flex-1 truncate font-medium text-ink" title={d.name}>
                  {d.name}
                </span>
                {totalPins > 0 && (
                  <span
                    className="flex-shrink-0 rounded px-1 text-t8 font-semibold"
                    style={{
                      background: openPins > 0 ? "#FCEBEB" : "#EAF3DE",
                      color: openPins > 0 ? "#A32D2D" : "#3B6D11",
                    }}
                  >
                    📌{openPins}/{totalPins}
                  </span>
                )}
                {d.drwVersion && (
                  <span className="flex-shrink-0 font-mono text-t8 font-semibold" style={{ color: dm.color }}>
                    {d.drwVersion}
                  </span>
                )}
                <Pill cls={dm.pill}>{dm.label}</Pill>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DrawingsTab({ data }: { data: EngineeringPayload }) {
  const { openPanel } = usePanel();
  const [filter, setFilter] = useState<DisciplineFilter>("all");
  const state = data.drawingsState;
  const drawings = data.drawings;

  const openDrawing = (d: EngDrawingView) =>
    openPanel({
      tag: d.id,
      title: d.name,
      subtitle: `${d.disc} · ${d.stage} · ${d.rev}`,
      width: 420,
      body: <DrawingDetailBody d={d} />,
    });

  if (!state) {
    return <EmptyState>Engineering work has not started for this sub-project.</EmptyState>;
  }

  const siteQueries = drawings.filter((d) => d.drwStatus === "site_query");
  const filtered = drawings.filter((d) => filter === "all" || d.disc === filter);

  return (
    <div className="flex flex-col gap-2.5">
      {siteQueries.length > 0 && (
        <div className="rounded-lg border-[0.5px] border-danger/40 bg-danger-soft px-3.5 py-2.5">
          <div className="mb-1.5 text-t11 font-bold text-danger">
            📍 Site Queries — drawing corrections raised from site ({siteQueries.length})
          </div>
          {siteQueries.map((d) => (
            <div key={d.id} className="border-t-[0.5px] border-danger/20 py-1.5 text-t10">
              <b>{d.name}</b> <span className="text-faint">{d.drwVersion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Discipline tracks */}
      {DISCIPLINES.map((disc) => {
        const track = state[disc.key];
        if (!track) return null;
        const stages: StageKey[] = ["preliminary", "gfc", "detailed"];
        if (track.vetting) stages.push("vetting");
        return (
          <div key={disc.key} className="rounded-lg border-[0.5px] border-line bg-surface p-3">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-t13" style={{ color: disc.color }}>
                {disc.icon}
              </span>
              <div className="text-t12 font-semibold text-ink">{disc.label}</div>
              <div className="ml-auto flex items-center gap-1">
                {stages.map((s) => {
                  const st = track[s]?.status ?? "pending";
                  const color = STAGE_STATUS_META[st]?.color ?? "#9B9894";
                  return <span key={s} className="h-2 w-2 rounded-full" style={{ background: color }} title={`${STAGE_META[s]?.label}: ${STAGE_STATUS_META[st]?.label ?? st}`} />;
                })}
              </div>
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
              {stages.map((s) => {
                if (s === "vetting") {
                  const cell = track.vetting!;
                  const sm = STAGE_STATUS_META[cell.status] ?? STAGE_STATUS_META.pending;
                  return (
                    <div key={s} className="relative rounded-md border-[0.5px] border-line bg-canvas p-2.5">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-t11 font-semibold text-ink">🛡 {STAGE_META.vetting!.label}</span>
                        <Pill cls={sm.pill}>{sm.label}</Pill>
                      </div>
                      <div className="mb-1.5 text-t9 text-faint">{STAGE_META.vetting!.sub}</div>
                      {cell.vetter && <div className="text-t10 font-medium text-ink">{cell.vetter}</div>}
                      {cell.submittedAt && <div className="text-t9 text-muted">Submitted: {cell.submittedAt}</div>}
                      {cell.vettedAt && <div className="text-t9 font-medium text-success">Vetted: {cell.vettedAt}</div>}
                      {cell.note && !cell.vetter && <div className="mt-1 text-t9 italic text-muted">{cell.note}</div>}
                    </div>
                  );
                }
                const summary = getStageSummary(drawings, disc.key, s);
                return <StageCard key={s} summary={summary} onOpen={openDrawing} />;
              })}
            </div>
          </div>
        );
      })}

      {/* Flat drawing list */}
      <div className="rounded-lg border-[0.5px] border-line bg-surface p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-t11 font-semibold text-ink">
            All Drawings (Flat View){" "}
            <span className="text-t10 font-normal text-faint">
              {filtered.length} of {drawings.length}
            </span>
          </div>
          <div className="flex gap-1">
            {(["all", "structure", "architecture", "mep"] as DisciplineFilter[]).map((d) => {
              const active = filter === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFilter(d)}
                  className="cursor-pointer rounded-[12px] border-[0.5px] px-2 py-0.5 text-t9 capitalize"
                  style={{
                    borderColor: active ? "var(--ac)" : "#D8D7D4",
                    background: active ? "var(--ac-lt)" : "#fff",
                    color: active ? "var(--ac)" : "#6B6A68",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="py-5 text-center text-t11 text-faint">No drawings in this filter.</div>
        ) : (
          <div className="tw" style={{ background: "transparent", border: 0 }}>
            <div className="th" style={{ gridTemplateColumns: "1fr 90px 80px 110px 50px 100px 60px" }}>
              <span>Drawing</span>
              <span>Discipline</span>
              <span>Stage</span>
              <span>Status</span>
              <span>Ver</span>
              <span>Uploader</span>
              <span>Pins</span>
            </div>
            {filtered.map((d) => {
              const dm = DRW_STATUS_META[d.drwStatus];
              const openPins = (d.comments ?? []).filter((c) => !c.resolved).length;
              const totalPins = (d.comments ?? []).length;
              return (
                <div
                  key={d.id}
                  className="tr cursor-pointer"
                  style={{ gridTemplateColumns: "1fr 90px 80px 110px 50px 100px 60px" }}
                  onClick={() => openDrawing(d)}
                >
                  <span className="truncate text-t11 font-medium text-ink">📄 {d.name}</span>
                  <span className="text-t10 capitalize text-muted">{d.disc}</span>
                  <span className="text-t10 uppercase text-muted">{d.stage}</span>
                  <span>
                    <Pill cls={dm.pill}>{dm.label}</Pill>
                  </span>
                  <span className="font-mono text-t10 font-medium text-accent">{d.drwVersion ?? "—"}</span>
                  <span className="truncate text-t10 text-muted">{d.by}</span>
                  <span>
                    {totalPins > 0 ? (
                      <span
                        className="rounded px-1.5 text-t9 font-semibold"
                        style={{
                          background: openPins > 0 ? "#FEE2E2" : "#EAF3DE",
                          color: openPins > 0 ? "#A32D2D" : "#3B6D11",
                        }}
                      >
                        📌 {openPins}/{totalPins}
                      </span>
                    ) : (
                      <span className="text-t9 text-faint">—</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
