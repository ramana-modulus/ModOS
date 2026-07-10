"use client";

import { useState } from "react";
import { usePanel } from "@/components/layout/panel-provider";
import { Pill } from "@/components/ui/badge";
import type { InspectionView, Itp } from "@/features/qaqc/types";
import { InspectionDetail } from "./panels";

type Mode = "all" | "materials" | "lineitem";

const COLS = "92px 58px 82px 82px 104px 82px 104px 1.4fr 88px";

const TYPE_META: Record<string, { color: string; bg: string }> = {
  IMIR: { color: "#854F0B", bg: "#FAEEDA" },
  WIR: { color: "#185FA5", bg: "#E6F1FB" },
  FIR: { color: "#7B1FA2", bg: "#F3E8FB" },
};

function StatusCell({ i }: { i: InspectionView }) {
  const hp =
    i.isHoldPoint && i.hpState === "awaiting_release" ? (
      <div className="mt-0.5 text-[8px] font-bold" style={{ color: "#A32D2D" }}>
        ⛔ awaiting release
      </div>
    ) : i.isHoldPoint && (i.hpState === "released" || i.hpState === "released_conditional") ? (
      <div className="mt-0.5 text-[8px]" style={{ color: "#3B6D11" }}>
        released
      </div>
    ) : null;

  if (i.type === "FIR") {
    const ok = i.status === "passed";
    return (
      <span>
        <span
          className="inline-block rounded px-[7px] py-0.5 text-t9 font-semibold"
          style={ok ? { color: "#3B6D11", background: "#EAF3DE" } : { color: "#854F0B", background: "#FAEEDA" }}
        >
          {ok ? "✓ No snags" : "Snag raised"}
        </span>
        {hp}
      </span>
    );
  }
  const cls = i.status === "passed" ? "pg" : i.status === "failed" ? "pr" : "pa";
  const label = i.status === "passed" ? "Passed" : i.status === "failed" ? "Failed" : i.status === "partial_pass" ? "Partial" : "Pending";
  return (
    <span>
      <Pill cls={cls}>{label}</Pill>
      {hp}
    </span>
  );
}

function Section({
  title,
  tag,
  tagCol,
  tagBg,
  subtitle,
  list,
  onOpen,
}: {
  title: string;
  tag: string;
  tagCol: string;
  tagBg: string;
  subtitle: string;
  list: InspectionView[];
  onOpen: (i: InspectionView) => void;
}) {
  return (
    <div className="mb-2.5">
      <div className="mb-2 mt-3.5 flex items-baseline gap-2.5">
        <span className="text-t12 font-bold text-ink">{title}</span>
        <span className="rounded-[10px] px-2 py-0.5 text-t9 font-bold" style={{ color: tagCol, background: tagBg }}>
          {tag}
        </span>
        <span className="text-t9 text-faint">
          {subtitle} · {list.length} inspection{list.length === 1 ? "" : "s"}
        </span>
      </div>
      {list.length === 0 ? (
        <div className="rounded-lg bg-subtle p-[18px] text-center text-t10 text-faint">Nothing here yet.</div>
      ) : (
        <div className="tw">
          <div className="th" style={{ gridTemplateColumns: COLS }}>
            <span>ID</span>
            <span>Type</span>
            <span>Date</span>
            <span>Item Code</span>
            <span>Cabin</span>
            <span>ITP</span>
            <span>Status</span>
            <span>Inspector · Note</span>
            <span>NCR / RTV</span>
          </div>
          {list.map((i) => {
            const tm = TYPE_META[i.type]!;
            return (
              <div key={i.id} className="tr" style={{ gridTemplateColumns: COLS }} onClick={() => onOpen(i)}>
                <span className="font-mono text-t10 font-medium text-ink">{i.id}</span>
                <span>
                  <span className="inline-block rounded-sm px-1.5 py-0.5 text-t9 font-medium" style={{ background: tm.bg, color: tm.color }}>
                    {i.type}
                  </span>
                </span>
                <span className="text-t10 text-ink">{i.date.split(" ").slice(0, 2).join(" ")}</span>
                <span className="font-mono text-t10 font-medium" style={{ color: "#854F0B" }}>
                  {i.bomCode}
                </span>
                <span>
                  {i.type !== "IMIR" && i.cabins?.length ? (
                    <span className="rounded-sm px-1.5 py-px text-t9 font-semibold" style={{ color: "#0F766E", background: "#E6F5F3" }}>
                      {i.cabinLabel}
                    </span>
                  ) : (
                    <span className="text-t9 text-faint">Site-wide</span>
                  )}
                </span>
                <span className="font-mono text-t10" style={{ color: "#5C2E91" }}>
                  {i.itpRef ?? "—"}
                </span>
                <span>
                  <StatusCell i={i} />
                </span>
                <span className="text-t10 text-ink-soft">
                  {i.note}
                  {i.inspector && <div className="text-t9 text-faint">by {i.inspector}</div>}
                </span>
                <span>
                  {i.ncrTriggered ? (
                    <span className="font-mono text-t10 font-medium" style={{ color: "#A32D2D" }}>
                      ⚠ {i.ncrId}
                    </span>
                  ) : i.type === "IMIR" && i.status === "failed" ? (
                    <span className="font-mono text-t10 font-medium" style={{ color: "#A32D2D" }}>
                      ↗ RTV
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
  );
}

export function InspectionsTab({ inspections, itps }: { inspections: InspectionView[]; itps: Itp[] }) {
  const { openPanel } = usePanel();
  const [mode, setMode] = useState<Mode>("all");

  const onOpen = (i: InspectionView) => {
    const itp = itps.find((t) => t.id === i.itpRef) ?? null;
    openPanel({
      tag: i.id,
      title: itp?.name ?? i.bomCode,
      subtitle: `${i.type} · ${i.itpRef ?? "no ITP"}`,
      width: 460,
      body: <InspectionDetail insp={i} itp={itp} />,
    });
  };

  const imir = inspections.filter((i) => i.type === "IMIR");
  const lineitem = inspections.filter((i) => i.type === "WIR" || i.type === "FIR");
  const showMat = mode !== "lineitem";
  const showLine = mode !== "materials";

  const segs: [Mode, string][] = [
    ["all", "All"],
    ["materials", "Materials · IMIR"],
    ["lineitem", "Line-item · WIR/FIR"],
  ];

  return (
    <div>
      {/* banner */}
      <div className="mb-2.5 rounded-md border-[0.5px] border-line bg-canvas px-3 py-2 text-t10 text-muted">
        <strong>Incoming</strong> — every inbound inspection demand lands here: auto-IMIRs at material receipt, WIRs pulled by site, QC
        requests from Ops. Triage, release hold points, and raise a <strong>field audit (FIR)</strong>. Criteria come from the ITPs &amp;
        Checklists rulebook; a non-conformance is logged as an NCR.
      </div>

      {/* segmented toggle */}
      <div className="mb-2.5 flex items-center gap-2">
        <span className="mr-0.5 text-t9 uppercase tracking-[0.5px] text-faint">Show</span>
        <div className="flex gap-1.5">
          {segs.map(([v, lbl]) => {
            const a = mode === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setMode(v)}
                className="cursor-pointer rounded-[14px] border-[0.5px] px-[11px] py-1 text-t10"
                style={{ borderColor: a ? "#1A1917" : "#D8D7D4", background: a ? "#F0EFEB" : "#fff", color: a ? "#1A1917" : "#6B6A68", fontWeight: a ? 600 : 400 }}
              >
                {lbl}
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <button type="button" className="rounded-md border-[0.5px] border-accent bg-accent px-2.5 py-1 text-t10 font-medium text-white">
          + Raise FIR (field audit)
        </button>
      </div>

      {showMat && (
        <Section title="Materials inspection" tag="IMIR" tagCol="#854F0B" tagBg="#FAEEDA" subtitle="incoming material gate" list={imir} onOpen={onOpen} />
      )}
      {showLine && (
        <Section
          title="Line-item inspection"
          tag="WIR · FIR"
          tagCol="#185FA5"
          tagBg="#E6F1FB"
          subtitle="work certification & field audit"
          list={lineitem}
          onOpen={onOpen}
        />
      )}

      <div className="mt-2.5 rounded-md border-[0.5px] border-line bg-canvas px-3 py-2 text-t10 text-muted">
        <strong>How it ties together:</strong> <b style={{ color: "#185FA5" }}>WIR</b> (Work Inspection Request) is pulled by site when a line
        is ready — QA certifies (pass → unblocks RA billing) or rejects (→ rework). <b style={{ color: "#7B1FA2" }}>FIR</b> (Field Audit) is
        QA&apos;s own unscheduled site walk — findings raise an NCR for Ops to fix. <b style={{ color: "#854F0B" }}>IMIR</b> stays the
        incoming-material gate. Both run per the relevant ITP.
      </div>
    </div>
  );
}
