"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { inboxApi } from "@/features/inbox/api";
import { moduleHref } from "@/features/inbox/routes";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { Pill } from "@/components/ui/badge";

const C = "24px 70px 1fr 100px 80px 90px 80px";
const PRI_TASK: Record<string, string> = { high: "tp-high", med: "tp-med", low: "tp-low" };

export function MyTasksPage() {
  const { data, loading, error } = useQuery(() => inboxApi.getInbox(), []);
  const [done, setDone] = useState<Set<string>>(new Set());

  const tasks = useMemo(
    () => (data?.myTasks ?? []).map((t) => ({ ...t, done: t.done || done.has(t.id) })),
    [data, done]
  );
  if (loading || !data) return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading tasks…"}</div>;

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);
  const dueToday = data.dueToday;
  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-t14 font-semibold text-ink">My Tasks</div>
          <div className="text-t10 text-faint">Shreeram R · Admin · All departments</div>
        </div>
        <div className="flex gap-1.5">
          <Pill cls="pr">{pending.filter((t) => t.priority === "high").length} High</Pill>
          <Pill cls="pa">{pending.filter((t) => t.priority === "med").length} Medium</Pill>
          <Pill cls="pg">{completed.length} Done</Pill>
        </div>
      </div>

      <div className="kr mb-3.5 grid grid-cols-2 sm:grid-cols-4">
        <div className="kp"><div className="kl">Total Pending</div><div className="kv cr">{pending.length}</div><div className="ks">action needed</div></div>
        <div className="kp"><div className="kl">High Priority</div><div className="kv cr">{pending.filter((t) => t.priority === "high").length}</div><div className="ks">urgent</div></div>
        <div className="kp"><div className="kl">Due Today</div><div className="kv ca">{pending.filter((t) => t.due === dueToday).length}</div><div className="ks">{dueToday}</div></div>
        <div className="kp"><div className="kl">Completed</div><div className="kv cg">{completed.length}</div><div className="ks">this week</div></div>
      </div>

      <div className="-mx-3.5 min-h-0 flex-1 overflow-y-auto px-3.5 pb-3">
        <div className="tw">
          <div className="th" style={{ gridTemplateColumns: C }}>
            <span /><span>Dept</span><span>Task</span><span>Project</span><span>Priority</span><span>Due</span><span>Action</span>
          </div>
          {[...pending, ...completed].map((t) => {
            const col = data.deptColors[t.dept] ?? "#9B9894";
            return (
              <div key={t.id} className={`tr${t.priority === "high" && !t.done ? " hl" : ""}`} style={{ gridTemplateColumns: C }}>
                <span>
                  <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} style={{ accentColor: "var(--ac)" }} />
                </span>
                <span>
                  <span className="rounded px-1.5 py-0.5 text-t9 font-semibold" style={{ color: col, background: `${col}18` }}>{t.dept}</span>
                </span>
                <span className={`text-t11 ${t.done ? "font-normal text-faint line-through" : "font-medium text-ink"}`}>{t.msg}</span>
                <span className="text-t10 text-muted">{t.project}</span>
                <span><span className={`task-priority ${PRI_TASK[t.priority]}`}>{t.priority}</span></span>
                <span className="text-t10" style={{ color: t.due === dueToday ? "#A32D2D" : "#9B9894" }}>{t.due}</span>
                <span>
                  {t.done ? (
                    <Pill cls="pg">Done</Pill>
                  ) : (
                    <Link href={moduleHref(t.target)} className="rounded-md border-[0.5px] border-accent bg-accent px-[7px] py-[3px] text-t9 font-medium text-white">
                      Open →
                    </Link>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
