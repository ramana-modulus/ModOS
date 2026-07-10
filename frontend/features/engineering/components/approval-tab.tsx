"use client";

import { useMemo, useState } from "react";
import { Pill } from "@/components/ui/badge";
import { fmtQ } from "@/lib/format";
import type { EngineeringPayload } from "@/features/engineering/api";
import type { EngBomLineView, EngDrawingView, EngWorkflow } from "@/features/engineering/types";
import { EmptyState } from "./eng-ui";

type SubView = "workflow" | "boq" | "drawing";

/* ─────────────────────────── Workflow tracker ─────────────────────────── */

interface WfNode {
  role: string;
  person: string;
  status: string;
  state: "done" | "active" | "pending";
}

function buildNodes(wf: EngWorkflow): WfNode[] {
  const allSubmitted = wf.disciplines.every((d) => d.status === "submitted");
  const anySubmitted = wf.disciplines.some((d) => d.status === "submitted");
  const checkerDone = wf.checkerStatus === "approved";
  const approverDone = wf.approverStatus === "approved";
  const vettingDone = wf.vettingStatus === "vetted";
  const vettingSubmitted = wf.vettingStatus === "submitted";
  const released = wf.procurementReleased;

  const nodes: WfNode[] = [
    {
      role: "Maker",
      person: wf.disciplines.filter((d) => d.assignee).map((d) => (d.assignee ?? "").split(" ")[0]).join(", ") || "Team",
      status: allSubmitted ? "All submitted" : anySubmitted ? "Partial submitted" : "In progress",
      state: allSubmitted ? "done" : "active",
    },
    {
      role: "Checker",
      person: wf.checker,
      status: checkerDone ? "Approved" : anySubmitted ? "Pending review" : "Waiting for makers",
      state: checkerDone ? "done" : anySubmitted ? "active" : "pending",
    },
    {
      role: "Approver",
      person: wf.approver,
      status: approverDone ? "Approved" : checkerDone ? "Pending approval" : "Waiting",
      state: approverDone ? "done" : checkerDone ? "active" : "pending",
    },
  ];
  if (wf.vettingRequired) {
    nodes.push({
      role: "IIT Vetting",
      person: "Prof. Bashyam",
      status: vettingDone ? "Vetted ✓" : vettingSubmitted ? "Submitted to vetter" : approverDone ? "Ready to submit" : "Waiting",
      state: vettingDone ? "done" : vettingSubmitted || approverDone ? "active" : "pending",
    });
  }
  nodes.push({
    role: "Release",
    person: "→ Procurement",
    status: released ? "Released ✓" : vettingDone || (approverDone && !wf.vettingRequired) ? "Ready to release" : "Waiting",
    state: released ? "done" : vettingDone || (approverDone && !wf.vettingRequired) ? "active" : "pending",
  });
  return nodes;
}

function WorkflowView({ wf }: { wf: EngWorkflow }) {
  const nodes = buildNodes(wf);
  return (
    <div>
      <div className="wf-tracker">
        {nodes.map((n, i) => (
          <div key={i} className={`wf-node ${n.state}`}>
            <div className="wf-node-role">{n.role}</div>
            <div className="wf-node-person">{n.person}</div>
            <div className="wf-node-status">
              {n.state === "done" ? "✓ " : n.state === "active" ? "→ " : "○ "}
              {n.status}
            </div>
            {i < nodes.length - 1 && <div className="wf-arr-overlay">›</div>}
          </div>
        ))}
      </div>

      <div className="mb-2 mt-3.5 text-t11 font-semibold text-ink">Discipline Submissions</div>
      {wf.disciplines.map((d) => {
        const cls = d.status === "submitted" ? "submitted" : d.status === "in_progress" ? "in-progress" : "pending";
        return (
          <div key={d.id} className={`trade-card ${cls}`}>
            <div className="trade-hdr">
              <div>
                <div className="trade-name">{d.name}</div>
                <div className="trade-assignee">
                  Assigned to: <strong>{d.assignee ?? "Not yet assigned"}</strong>
                  {d.submittedOn ? ` · Submitted: ${d.submittedOn}` : ""}
                </div>
              </div>
              {d.status === "submitted" ? (
                <Pill cls="pg">Submitted ✓</Pill>
              ) : d.status === "in_progress" ? (
                <Pill cls="pa">In Progress</Pill>
              ) : (
                <Pill cls="pgr">Pending</Pill>
              )}
            </div>
            {d.sections.length > 0 && <div className="text-t9 text-faint">Scope: {d.sections.join(", ")}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Queue helpers ─────────────────────────── */

function QueueHeader({ title, subtitle, count }: { title: string; subtitle: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-lg border-[0.5px] border-line bg-canvas px-3.5 py-2.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-accent-soft text-t18 text-accent">
        ✓
      </div>
      <div className="flex-1">
        <div className="text-t12 font-semibold text-ink">{title}</div>
        <div className="text-t10 text-muted">{subtitle}</div>
      </div>
      <Pill cls={count > 0 ? "pa" : "pgr"}>{count} pending</Pill>
    </div>
  );
}

interface Batch<T> {
  batchId: string;
  sentAt: string;
  sentBy: string;
  rows: T[];
}

function groupByBatch<T extends { batchId: string; sentAt: string; sentBy: string }>(items: T[]): Batch<T>[] {
  const map = new Map<string, Batch<T>>();
  for (const q of items) {
    const b = map.get(q.batchId) ?? { batchId: q.batchId, sentAt: q.sentAt, sentBy: q.sentBy, rows: [] };
    b.rows.push(q);
    map.set(q.batchId, b);
  }
  return [...map.values()].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

function BatchShell({ batch, children }: { batch: Batch<unknown>; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 overflow-hidden rounded-lg border-[0.5px] border-warn/40 bg-surface">
      <div className="flex items-center gap-2 border-b-[0.5px] border-warn/40 bg-warn-soft px-3 py-2 text-warn">
        <span className="text-t10 font-semibold">📦 Batch</span>
        <span className="font-mono text-t10">{batch.batchId}</span>
        <span className="text-t9 text-muted">·</span>
        <span className="text-t10 text-muted">
          {batch.rows.length} sent by <strong>{batch.sentBy}</strong>
        </span>
        <span className="ml-auto text-t9 text-faint">{batch.sentAt}</span>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────── BOQ queue ─────────────────────────── */

function BoqQueueView({ data }: { data: EngineeringPayload }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const byCode = useMemo(() => new Map(data.bomLines.map((l) => [l.code, l])), [data.bomLines]);
  const batches = groupByBatch(data.boqQueue.map((q) => ({ ...q, batchId: q.batchId })));

  const recent = data.bomLines
    .filter((l) => ["approved", "rework"].includes(l.engStatus) && l.engVersionHistory.length > 0)
    .map((l) => ({ line: l, ver: [...l.engVersionHistory].reverse().find((v) => v.reviewedAt) }))
    .filter((r): r is { line: EngBomLineView; ver: NonNullable<typeof r.ver> } => !!r.ver)
    .slice(0, 5);

  return (
    <div>
      <QueueHeader
        title={`BOQ Approval Queue — ${data.workflow?.approver ?? "Rohith R"}`}
        subtitle="Review each BOQ line individually. Approve releases to Procurement, or send back for rework."
        count={data.boqQueue.length}
      />
      {data.boqQueue.length === 0 ? (
        <EmptyState>Queue is empty — no BOQ lines awaiting approval.</EmptyState>
      ) : (
        batches.map((batch) => (
          <BatchShell key={batch.batchId} batch={batch}>
            {batch.rows.map((q) => {
              const line = q.boqCode ? byCode.get(q.boqCode) : undefined;
              if (!line) return null;
              const isOpen = open.has(line.code);
              const v = line.variancePct ?? 0;
              const flag = Math.abs(v) > 8 ? "high" : Math.abs(v) > 3 ? "med" : "low";
              const col = flag === "high" ? "#A32D2D" : flag === "med" ? "#854F0B" : "#6B6A68";
              return (
                <div key={line.code} className="border-b-[0.5px] border-line bg-surface">
                  <div
                    className="flex cursor-pointer items-start gap-3 px-3.5 py-3"
                    onClick={() =>
                      setOpen((p) => {
                        const n = new Set(p);
                        if (n.has(line.code)) n.delete(line.code);
                        else n.add(line.code);
                        return n;
                      })
                    }
                  >
                    <span className="mt-0.5 text-muted">{isOpen ? "▾" : "▸"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-baseline gap-2">
                        <span className="font-mono text-t11 font-semibold text-ink">{line.code}</span>
                        <span className="text-t11 font-medium text-ink">{line.name}</span>
                        <span className="font-mono text-t9 font-semibold text-warn">{line.engVersion} ⏳</span>
                      </div>
                      <div className="flex flex-wrap gap-3.5 text-t10 text-muted">
                        <span>
                          <strong className="text-ink">
                            {fmtQ(line.engQty)} {line.uom}
                          </strong>{" "}
                          eng qty
                        </span>
                        <span>
                          BOQ {fmtQ(line.boqQty)} {line.uom}
                        </span>
                        <span style={{ color: col, fontWeight: flag !== "low" ? 500 : 400 }}>
                          {v >= 0 ? "+" : ""}
                          {v.toFixed(1)}% var {flag === "high" ? "⚠" : ""}
                        </span>
                        <span>
                          <strong className="text-ink">{(line.components ?? []).length}</strong> BOM lines
                        </span>
                      </div>
                    </div>
                    <Pill cls="pa">Pending review</Pill>
                  </div>
                  {isOpen && (
                    <div className="border-t-[0.5px] border-dashed border-line bg-canvas px-3.5 py-3 pl-9">
                      {(line.components ?? []).length === 0 ? (
                        <div className="rounded bg-danger-soft px-3 py-2 text-t10 text-danger">
                          No BOM components — submitted without breakdown.
                        </div>
                      ) : (
                        <div className="tw" style={{ background: "#fff" }}>
                          <div className="th" style={{ gridTemplateColumns: "90px 1fr 80px 60px 80px" }}>
                            <span>Code</span>
                            <span>Material</span>
                            <span>Eng Qty</span>
                            <span>UOM</span>
                            <span>Source</span>
                          </div>
                          {line.components.map((c) => (
                            <div key={c.code} className="tr" style={{ gridTemplateColumns: "90px 1fr 80px 60px 80px" }}>
                              <span className="font-mono text-t10 text-warn">{c.code}</span>
                              <span className="text-t10 text-ink">{c.name}</span>
                              <span className="text-right text-t10 font-medium text-ink">{fmtQ(c.engQty)}</span>
                              <span className="text-t10 text-muted">{c.uom}</span>
                              <span>{c.source === "auto" ? <Pill cls="pgr">auto</Pill> : <Pill cls="pb">+ library</Pill>}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </BatchShell>
        ))
      )}

      {recent.length > 0 && <RecentActioned rows={recent.map((r) => ({ label: `${r.line.code} · ${r.line.name}`, ver: r.ver.v, decision: r.ver.decision, at: r.ver.reviewedAt }))} />}
    </div>
  );
}

/* ─────────────────────────── Drawing queue ─────────────────────────── */

function DrawingQueueView({ data }: { data: EngineeringPayload }) {
  const byId = useMemo(() => new Map(data.drawings.map((d) => [d.id, d])), [data.drawings]);
  const batches = groupByBatch(data.drawingQueue.map((q) => ({ ...q, batchId: q.batchId })));

  const recent = data.drawings
    .filter((d) => ["approved", "rework"].includes(d.drwStatus) && d.drwVersionHistory.length > 0)
    .map((d) => ({ d, ver: [...d.drwVersionHistory].reverse().find((v) => v.reviewedAt) }))
    .filter((r): r is { d: EngDrawingView; ver: NonNullable<typeof r.ver> } => !!r.ver)
    .slice(0, 5);

  return (
    <div>
      <QueueHeader
        title={`Drawing Approval Queue — ${data.workflow?.approver ?? "Rohith R"}`}
        subtitle="Each drawing carries its own version stream + state machine."
        count={data.drawingQueue.length}
      />
      {data.drawingQueue.length === 0 ? (
        <EmptyState>Queue is empty — no drawings awaiting approval.</EmptyState>
      ) : (
        batches.map((batch) => (
          <BatchShell key={batch.batchId} batch={batch}>
            {batch.rows.map((q) => {
              const d = q.drawingId ? byId.get(q.drawingId) : undefined;
              if (!d) return null;
              const openPins = (d.comments ?? []).filter((c) => !c.resolved).length;
              const totalPins = (d.comments ?? []).length;
              return (
                <div key={d.id} className="flex items-start gap-3 border-b-[0.5px] border-line px-3.5 py-3">
                  <span className="flex-shrink-0">📄</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-baseline gap-2">
                      <span className="text-t11 font-semibold text-ink">{d.name}</span>
                      <span className="font-mono text-t9 font-semibold text-warn">{d.drwVersion} ⏳</span>
                      {d.stage === "detailed" && <Pill cls="pb">construction-ready</Pill>}
                    </div>
                    <div className="flex flex-wrap gap-3.5 text-t10 text-muted">
                      <span className="capitalize">{d.disc}</span>
                      <span className="uppercase">{d.stage}</span>
                      <span>by {q.sentBy}</span>
                      {totalPins > 0 && (
                        <span className="font-medium" style={{ color: openPins > 0 ? "#A32D2D" : "#3B6D11" }}>
                          📌 {openPins}/{totalPins} pins
                        </span>
                      )}
                    </div>
                  </div>
                  <Pill cls="pa">Pending review</Pill>
                </div>
              );
            })}
          </BatchShell>
        ))
      )}

      {recent.length > 0 && <RecentActioned rows={recent.map((r) => ({ label: `${r.d.name} · ${r.d.disc}/${r.d.stage}`, ver: r.d.drwVersion ?? "—", decision: r.ver.decision, at: r.ver.reviewedAt }))} />}
    </div>
  );
}

function RecentActioned({ rows }: { rows: { label: string; ver: string; decision?: string; at?: string }[] }) {
  return (
    <div className="mt-3.5 overflow-hidden rounded-lg border-[0.5px] border-line bg-surface">
      <div className="border-b-[0.5px] border-line bg-subtle px-3 py-2 text-t10 font-semibold text-ink">
        Recently Actioned <span className="font-normal text-faint">(last {rows.length})</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2.5 border-b-[0.5px] border-line px-3.5 py-2 text-t10">
          <span style={{ color: r.decision === "approved" ? "#3B6D11" : "#A32D2D" }}>
            {r.decision === "approved" ? "✓" : "↩"}
          </span>
          <span className="min-w-0 flex-1 truncate text-ink">{r.label}</span>
          <span className="font-mono text-t9 text-faint">{r.ver}</span>
          <span className="font-medium" style={{ color: r.decision === "approved" ? "#3B6D11" : "#A32D2D" }}>
            {r.decision === "approved" ? "Approved" : "Rework"}
          </span>
          <span className="text-t9 text-faint">{r.at}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Tab shell ─────────────────────────── */

export function ApprovalTab({ data }: { data: EngineeringPayload }) {
  const [view, setView] = useState<SubView>("workflow");

  const inner: { key: SubView; label: string; count?: number }[] = [
    { key: "workflow", label: "Workflow" },
    { key: "boq", label: "BOQ Queue", count: data.queueCounts.boq },
    { key: "drawing", label: "Drawing Queue", count: data.queueCounts.drawing },
  ];

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {inner.map((t) => {
          const active = view === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setView(t.key)}
              className="cursor-pointer rounded-md px-2.5 py-1 text-t10"
              style={{ background: active ? "#1A1917" : "#F5F4F2", color: active ? "#fff" : "#6B6A68" }}
            >
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className="ml-1 rounded-lg bg-accent px-1.5 text-t8 font-semibold text-white">{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {view === "workflow" &&
        (data.workflow ? <WorkflowView wf={data.workflow} /> : <EmptyState>No active workflow for this sub-project.</EmptyState>)}
      {view === "boq" && <BoqQueueView data={data} />}
      {view === "drawing" && <DrawingQueueView data={data} />}
    </div>
  );
}
