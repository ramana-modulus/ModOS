"use client";

import { useState, type CSSProperties } from "react";
import { fmtQ } from "@/lib/format";
import type {
  ApprovalView,
  Dept,
  GanttCatGroup,
  PlanState,
  WbsBlock,
  WbsView,
} from "@/features/planning/types";
import { LineItemsPanel } from "./line-items-panel";

type DeptMeta = Record<Dept, { label: string; color: string; bg: string }>;

const ALL_DEPTS: Dept[] = ["engg", "proc", "subcontracts", "ops", "qa"];
const BAR_CLASS: Partial<Record<Dept, string>> = { engg: "engg", proc: "proc", ops: "ops", qa: "qa" };

interface Props {
  wbs: WbsView;
  deptMeta: DeptMeta;
  plan: PlanState;
  approval: ApprovalView;
}

export function WbsGantt({ wbs, deptMeta, plan: _plan, approval }: Props) {
  const [view, setView] = useState<"weeks" | "days">("weeks");
  const [mode, setMode] = useState<"dept" | "activity">("dept");
  const [depts, setDepts] = useState<Record<Dept, boolean>>({
    engg: true,
    proc: true,
    subcontracts: true,
    ops: true,
    qa: true,
  });

  const DAY_W = view === "days" ? 28 : 14;
  const { totalDays, startDate, todayDay, stats } = wbs;
  const timelineW = totalDays * DAY_W;
  const start = new Date(startDate);

  const doneCount = wbs.items.filter((i) => i.fullyScheduled).length;

  /* ── Calendar header ── */
  const weeks = Math.ceil(totalDays / 7);
  const weekCells = [];
  for (let w = 0; w < weeks; w++) {
    const wStart = new Date(start);
    wStart.setDate(wStart.getDate() + w * 7);
    const wEnd = new Date(start);
    wEnd.setDate(wEnd.getDate() + Math.min(w * 7 + 6, totalDays - 1));
    const isCur = todayDay > w * 7 && todayDay <= (w + 1) * 7;
    const mo = wStart.toLocaleString("en-IN", { month: "short" });
    const label = view === "weeks" ? `${mo} ${wStart.getDate()}–${wEnd.getDate()}` : `W${w + 1}`;
    weekCells.push(
      <div
        key={w}
        className="flex-shrink-0 whitespace-nowrap border-r-[0.5px] border-line px-1.5 py-[3px] text-t9 font-semibold"
        style={{
          minWidth: 7 * DAY_W,
          maxWidth: 7 * DAY_W,
          color: isCur ? "var(--ac)" : "#1A1917",
          background: isCur ? "var(--ac-lt)" : "#F5F4F2",
        }}
      >
        {label}
      </div>
    );
  }

  const dayCells = [];
  if (view === "days") {
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const isWE = d.getDay() === 0 || d.getDay() === 6;
      const isToday = i === todayDay - 1;
      dayCells.push(
        <div
          key={i}
          className="wbs-day-hdr flex-shrink-0"
          style={{
            minWidth: DAY_W,
            maxWidth: DAY_W,
            background: isToday ? "var(--ac-lt)" : isWE ? "#F5F4F2" : "#fff",
            color: isToday ? "var(--ac)" : "#6B6A68",
          }}
        >
          {d.getDate()}
        </div>
      );
    }
  }

  const timelineStyle: CSSProperties = {
    width: timelineW,
    flex: "none",
    position: "relative",
    background: `repeating-linear-gradient(to right, transparent 0, transparent ${7 * DAY_W - 1}px, #F0EFED ${
      7 * DAY_W - 1
    }px, #F0EFED ${7 * DAY_W}px)`,
  };
  const todayLeft = (todayDay - 1) * DAY_W;

  const renderBar = (b: WbsBlock, dept: Dept, uom: string, pct?: number) => {
    const left = (b.day - 1) * DAY_W;
    const width = Math.max(b.duration * DAY_W - 2, 4);
    const meta = deptMeta[dept];
    const cls = BAR_CLASS[dept];
    return (
      <div
        key={b.id}
        className={`wbs-bar${cls ? " " + cls : ""}`}
        style={{ left, width, background: meta.color }}
        title={`${b.label} · ${fmtQ(b.qty)} ${uom} · Day ${b.day}–${b.day + b.duration - 1}${
          pct != null ? ` · ${pct}% scheduled` : ""
        }`}
      >
        {b.label}
      </div>
    );
  };

  const renderGroup = (g: GanttCatGroup) => {
    const rows: React.ReactNode[] = [];
    // Category header (dark) row
    rows.push(
      <div key={`cat-${g.catId}`} className="wbs-row cat-row">
        <div className="wbs-row-label cat">{g.cat}</div>
        <div className="wbs-timeline" style={{ ...timelineStyle, background: "#1A1917" }} />
      </div>
    );

    if (mode === "activity") {
      for (const r of g.activityRows) {
        if (!depts[r.dept]) continue;
        const meta = deptMeta[r.dept];
        const left = (r.start - 1) * DAY_W;
        const width = Math.max((r.end - r.start) * DAY_W - 2, 4);
        const fillW = Math.max(0, Math.min(width, (width * r.pct) / 100));
        rows.push(
          <div key={`${g.catId}-${r.dept}`} className="wbs-row">
            <div className="wbs-row-label dept flex items-center justify-between">
              <span style={{ color: meta.color }}>↳ {r.label}</span>
              <span className="text-t9 font-bold" style={{ color: r.pct >= 100 ? "#3B6D11" : "#854F0B" }}>
                {r.pct}%
              </span>
            </div>
            <div className="wbs-timeline" style={timelineStyle}>
              <div className="absolute bottom-0 top-0 z-[3] w-[1.5px] opacity-40" style={{ left: todayLeft, background: "var(--ac)" }} />
              <div
                className="absolute z-[2] overflow-hidden rounded-[3px]"
                style={{ left, top: 5, height: 20, width, background: meta.bg, border: `0.5px solid ${meta.color}40` }}
                title={`${meta.label} — ${g.cat} · Day ${r.start}–${r.end - 1} · ${r.pct}% scheduled`}
              >
                <div className="absolute bottom-0 left-0 top-0 opacity-90" style={{ width: fillW, background: meta.color }} />
                <span
                  className="relative z-[1] flex h-full items-center truncate px-1.5 text-t8 font-semibold"
                  style={{ color: r.pct > 50 ? "#fff" : meta.color }}
                >
                  {meta.label}
                </span>
              </div>
            </div>
          </div>
        );
      }
      return rows;
    }

    // Dept view: one row per (item × dept)
    for (const dr of g.deptRows) {
      if (!depts[dr.dept]) continue;
      const meta = deptMeta[dr.dept];
      const item = wbs.items.find((i) => i.code === dr.code)!;
      rows.push(
        <div key={dr.key} className="wbs-row">
          <div className="wbs-row-label item flex items-center gap-1.5">
            <span className="flex-1 truncate">
              {dr.isFirst ? dr.itemName : <span className="text-line">↳ </span>}
              {!dr.isFirst && dr.itemName}
            </span>
            <span className="whitespace-nowrap text-t9 font-semibold" style={{ color: meta.color }}>
              {meta.label}
            </span>
            {dr.deptFull && (
              <span
                className="whitespace-nowrap rounded-[3px] border-[0.5px] px-1 text-[7px] font-bold"
                style={{ color: "#3B6D11", background: "#3B6D111A", borderColor: "#3B6D1140" }}
                title="Fully scheduled"
              >
                FULL
              </span>
            )}
          </div>
          <div className="wbs-timeline" style={timelineStyle}>
            <div className="absolute bottom-0 top-0 z-[3] w-[1.5px] opacity-40" style={{ left: todayLeft, background: "var(--ac)" }} />
            {dr.blocks.map((b) => renderBar(b, dr.dept, item.uom, item.deptProgress.find((p) => p.dept === dr.dept)?.pct))}
          </div>
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Lock progress banner */}
      <div className="mb-1.5 flex items-center gap-2 rounded-md border-[0.5px] border-line bg-canvas px-2.5 py-1.5 text-t10 text-muted">
        {approval.fullyScheduled ? (
          <>
            <i className="ti ti-circle-check text-[13px]" style={{ color: "#3B6D11" }} />
            <span>All line items 100% scheduled. {approval.planner} can baseline &amp; route this for approval.</span>
          </>
        ) : (
          <>
            <i className="ti ti-progress text-[13px]" style={{ color: "#854F0B" }} />
            <span>
              {doneCount}/{wbs.items.length} line items fully scheduled (across all required depts) — lock available
              once all reach 100%.
            </span>
          </>
        )}
      </div>

      {/* Stats bar */}
      <div className="mb-2 flex flex-shrink-0 overflow-hidden rounded-lg border-[0.5px] border-line">
        {(
          [
            ["Total Activities", `${stats.totalActivities}`, "#1A1917"],
            ["Not Started", `${stats.notStarted}`, "#9B9894"],
            ["In Progress", `${stats.inProgress}`, "#854F0B"],
            ["Completed", `${stats.completed}`, "#3B6D11"],
            ["Schedule Progress", `${stats.schedulePct}%`, "#1A1917"],
          ] as const
        ).map(([l, v, c]) => (
          <div key={l} className="flex-1 border-r-[0.5px] border-line bg-surface px-3 py-2">
            <div className="mb-0.5 text-t9 uppercase tracking-[0.5px] text-faint">{l}</div>
            <div className="text-t20 font-bold" style={{ color: c }}>
              {v}
            </div>
          </div>
        ))}
        <div className="flex-1 border-r-[0.5px] border-line bg-surface px-3 py-2">
          <div className="mb-0.5 text-t9 uppercase tracking-[0.5px] text-faint">Schedule Status</div>
          <div className="text-t13 font-bold" style={{ color: "#3B6D11" }}>
            {stats.scheduleStatus}
          </div>
        </div>
        <div className="flex-1 border-r-[0.5px] border-line bg-surface px-3 py-2">
          <div className="mb-0.5 text-t9 uppercase tracking-[0.5px] text-faint">Planned End</div>
          <div className="text-t12 font-semibold" style={{ color: "#1A1917" }}>
            {stats.plannedEndDate}
          </div>
        </div>
        <div className="flex-1 bg-surface px-3 py-2">
          <div className="mb-0.5 text-t9 uppercase tracking-[0.5px] text-faint">Projected End</div>
          <div className="text-t12 font-semibold" style={{ color: "#854F0B" }}>
            {stats.projectedEndDate}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-2 flex flex-shrink-0 flex-wrap items-center gap-2">
        <input className="fi max-w-[220px] flex-1" placeholder="🔍 Search by Activity Name, WBS…" readOnly />
        <span className="text-t10 text-faint">Show:</span>
        {ALL_DEPTS.map((d) => {
          const meta = deptMeta[d];
          return (
            <label key={d} className="flex cursor-pointer items-center gap-1 text-t10 font-semibold" style={{ color: meta.color }}>
              <input
                type="checkbox"
                checked={depts[d]}
                onChange={(e) => setDepts((prev) => ({ ...prev, [d]: e.target.checked }))}
                style={{ accentColor: meta.color }}
              />
              {meta.label}
            </label>
          );
        })}
        <div className="ml-auto flex gap-1">
          <div className="flex overflow-hidden rounded-md border-[0.5px] border-line">
            <button
              type="button"
              onClick={() => setMode("dept")}
              className="px-2.5 py-[5px] text-t10"
              style={{ background: mode === "dept" ? "#1A1917" : "#fff", color: mode === "dept" ? "#fff" : "#6B6A68" }}
            >
              Dept View
            </button>
            <button
              type="button"
              onClick={() => setMode("activity")}
              className="border-l-[0.5px] border-line px-2.5 py-[5px] text-t10"
              style={{ background: mode === "activity" ? "#1A1917" : "#fff", color: mode === "activity" ? "#fff" : "#6B6A68" }}
            >
              Activity View
            </button>
          </div>
          <div className="flex overflow-hidden rounded-md border-[0.5px] border-line">
            <button
              type="button"
              onClick={() => setView("days")}
              className="px-2.5 py-[5px] text-t10"
              style={{ background: view === "days" ? "#1A1917" : "#fff", color: view === "days" ? "#fff" : "#6B6A68" }}
            >
              Days
            </button>
            <button
              type="button"
              onClick={() => setView("weeks")}
              className="border-l-[0.5px] border-line px-2.5 py-[5px] text-t10"
              style={{ background: view === "weeks" ? "#1A1917" : "#fff", color: view === "weeks" ? "#fff" : "#6B6A68" }}
            >
              Weeks
            </button>
          </div>
        </div>
      </div>

      {/* Main: gantt + line items panel */}
      <div className="wbs-wrap min-h-0 flex-1">
        <div className="wbs-gantt">
          <div className="wbs-gantt-hdr">
            <div className="wbs-row-label" style={{ width: 220, minWidth: 220, alignItems: "flex-end" }}>
              {mode === "activity" ? "Activity" : "Line Item"}
            </div>
            <div style={{ width: timelineW, flex: "none" }}>
              <div className="flex border-b-[0.5px] border-line">{weekCells}</div>
              {view === "days" && <div className="flex">{dayCells}</div>}
            </div>
          </div>
          {wbs.groups.map((g) => renderGroup(g))}
        </div>

        {mode !== "activity" && (
          <LineItemsPanel items={wbs.items} deptMeta={deptMeta} />
        )}
      </div>
    </div>
  );
}
