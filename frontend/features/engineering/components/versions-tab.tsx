"use client";

import { useState } from "react";
import { Pill } from "@/components/ui/badge";
import type { EngineeringPayload } from "@/features/engineering/api";
import { EmptyState, InfoBanner } from "./eng-ui";

type SubView = "sets" | "boq" | "drawing";

function DeliverableSets({ data }: { data: EngineeringPayload }) {
  const versions = data.versions;
  if (versions.length === 0) return <EmptyState>No engineering versions snapshotted yet.</EmptyState>;
  const activeLabel = versions.find((v) => v.active)?.ver ?? "V—";

  return (
    <div className="max-w-[720px]">
      <InfoBanner>
        <span>ℹ️</span>
        <span>
          An <strong>Engineering Version</strong> is a snapshot of all drawings + BOM + supporting docs at a point in
          time. Released versions are sent to Procurement for PO action.
        </span>
      </InfoBanner>
      {versions.map((v) => (
        <div
          key={v.ver}
          className="mb-2 rounded-lg border-[0.5px] p-4"
          style={{ borderColor: v.active ? "var(--ac)" : "#E8E7E4", background: v.active ? "var(--ac-lt)" : "#fff" }}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <div className="text-t13 font-semibold" style={{ color: v.active ? "var(--ac)" : "#1A1917" }}>
              {v.label}
            </div>
            <div className="flex gap-1.5">
              {v.active ? <Pill cls="pg">Active · Editable</Pill> : <Pill cls="pgr">Locked · Read-only</Pill>}
              {v.released && <Pill cls="pb">✓ Released to Procurement</Pill>}
            </div>
          </div>
          <div className="mb-1.5 text-t10 text-faint">
            {v.date} · Snapshot by {v.by}
            {v.releasedAt ? ` · Released on ${v.releasedAt}` : ""}
          </div>
          <div className="mb-2 text-t11 leading-snug text-muted">{v.note}</div>
          <div className="grid grid-cols-4 gap-2 rounded-md bg-canvas px-2.5 py-2">
            <Stat label="Drawings" value={v.stats.drawings} />
            <Stat label="BOM Items" value={v.stats.bomItems} />
            <Stat label="Open RFI" value={v.stats.openRFI} color={v.stats.openRFI > 0 ? "#A32D2D" : "#3B6D11"} />
            <Stat label="Open RFC" value={v.stats.openRFC} color={v.stats.openRFC > 0 ? "#854F0B" : "#3B6D11"} />
          </div>
          {!v.active && (
            <div className="mt-2 text-t9 text-faint">Compare with {activeLabel} · locked snapshot (read-only)</div>
          )}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="text-t8 uppercase tracking-[0.5px] text-faint">{label}</div>
      <div className="text-t13 font-semibold" style={{ color: color ?? "#1A1917" }}>
        {value}
      </div>
    </div>
  );
}

function BoqVersions({ data }: { data: EngineeringPayload }) {
  const rows = data.bomLines.filter((l) => l.engVersionHistory.length > 0);
  if (rows.length === 0) return <EmptyState>No BOQ has been submitted — no version history yet.</EmptyState>;
  return (
    <div>
      <InfoBanner>
        <span>ℹ️</span>
        <span>
          <strong>Per-BOQ version history.</strong> Versions only bump when an approver rejects and the maker resubmits.
        </span>
      </InfoBanner>
      <div className="tw">
        <div className="th" style={{ gridTemplateColumns: "90px 1fr 60px 110px 130px 140px 1fr" }}>
          <span>Code</span>
          <span>BOQ</span>
          <span>Current</span>
          <span>Status</span>
          <span>Last action by</span>
          <span>Last action at</span>
          <span>Last note / rejection</span>
        </div>
        {rows.map((it) => {
          const hist = it.engVersionHistory;
          const latest = hist[hist.length - 1]!;
          const lastReviewed = [...hist].reverse().find((v) => v.reviewedAt) ?? latest;
          return (
            <div key={it.code} className="tr" style={{ gridTemplateColumns: "90px 1fr 60px 110px 130px 140px 1fr" }}>
              <span className="font-mono text-t10 font-medium text-ink">{it.code}</span>
              <span className="text-t10 text-ink">{it.name}</span>
              <span className="font-mono text-t10 font-semibold text-accent">{it.engVersion ?? "—"}</span>
              <span className="text-t10 capitalize text-muted">{it.engStatus.replace("_", " ")}</span>
              <span className="text-t10 text-muted">{lastReviewed.reviewedBy ?? lastReviewed.submittedBy ?? "—"}</span>
              <span className="text-t10 text-faint">{lastReviewed.reviewedAt ?? lastReviewed.submittedAt ?? "—"}</span>
              <span className="truncate text-t9 italic text-muted" title={lastReviewed.comments ?? ""}>
                {lastReviewed.comments ?? (lastReviewed.decision === "approved" ? "(approved)" : "(submitted)")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DrawingVersions({ data }: { data: EngineeringPayload }) {
  const rows = data.drawings.filter((d) => d.drwVersionHistory.length > 0);
  if (rows.length === 0) return <EmptyState>No drawings submitted yet.</EmptyState>;
  return (
    <div>
      <InfoBanner>
        <span>ℹ️</span>
        <span>
          <strong>Per-drawing version history.</strong> Each drawing has its own independent version stream.
        </span>
      </InfoBanner>
      <div className="tw">
        <div className="th" style={{ gridTemplateColumns: "1fr 95px 80px 60px 100px 110px 1fr" }}>
          <span>Drawing</span>
          <span>Discipline</span>
          <span>Stage</span>
          <span>Current</span>
          <span>Status</span>
          <span>Last action by</span>
          <span>Last note / rejection</span>
        </div>
        {rows.map((d) => {
          const hist = d.drwVersionHistory;
          const latest = hist[hist.length - 1]!;
          const lastReviewed = [...hist].reverse().find((v) => v.reviewedAt) ?? latest;
          return (
            <div key={d.id} className="tr" style={{ gridTemplateColumns: "1fr 95px 80px 60px 100px 110px 1fr" }}>
              <span className="truncate text-t10 font-medium text-ink">📄 {d.name}</span>
              <span className="text-t10 capitalize text-muted">{d.disc}</span>
              <span className="text-t10 uppercase text-muted">{d.stage}</span>
              <span className="font-mono text-t10 font-semibold text-accent">{d.drwVersion ?? "—"}</span>
              <span className="text-t10 capitalize text-muted">{d.drwStatus.replace("_", " ")}</span>
              <span className="text-t10 text-muted">{lastReviewed.reviewedBy ?? lastReviewed.submittedBy ?? "—"}</span>
              <span className="truncate text-t9 italic text-muted" title={lastReviewed.comments ?? ""}>
                {lastReviewed.comments ?? (lastReviewed.decision === "approved" ? "(approved)" : "(submitted)")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VersionsTab({ data }: { data: EngineeringPayload }) {
  const [view, setView] = useState<SubView>("sets");
  const inner: { key: SubView; label: string }[] = [
    { key: "sets", label: "Deliverable Sets" },
    { key: "boq", label: "BOQ Versions" },
    { key: "drawing", label: "Drawing Versions" },
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
            </button>
          );
        })}
      </div>
      {view === "sets" && <DeliverableSets data={data} />}
      {view === "boq" && <BoqVersions data={data} />}
      {view === "drawing" && <DrawingVersions data={data} />}
    </div>
  );
}
