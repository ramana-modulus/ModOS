"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { inboxApi } from "@/features/inbox/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import type { AppNotification } from "@/features/inbox/types";
import { moduleHref } from "@/features/inbox/routes";
import { Button } from "@/components/ui/button";

const PRI_CLASS: Record<string, string> = { high: "pr", med: "pa", low: "pg" };

function NotifItem({ n, colors, onRead }: { n: AppNotification; colors: Record<string, string>; onRead: (id: string) => void }) {
  const col = colors[n.dept] ?? "#9B9894";
  const href = moduleHref(n.actionTarget ?? n.dept);
  return (
    <Link href={href} onClick={() => onRead(n.id)} className={`notif-item${n.unread ? " unread" : ""} block`}>
      <div className="notif-dot" style={{ background: col }} />
      <div className="flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <span className="notif-dept" style={{ color: col }}>{n.dept}</span>
          <span className={`pill ${PRI_CLASS[n.priority]}`} style={{ fontSize: 8 }}>{n.priority}</span>
          <span className="ml-auto text-t9 text-faint">{n.date}</span>
        </div>
        <div className="notif-msg">{n.msg}</div>
        <div className="notif-meta">{n.project} · {n.ref} · From: {n.from}</div>
        {n.action && <div className="notif-action">→ {n.action}</div>}
      </div>
    </Link>
  );
}

export function NotificationsPage() {
  const { data, loading, error } = useQuery(() => inboxApi.getInbox(), []);
  const [read, setRead] = useState<Set<string>>(new Set());

  const items = useMemo(
    () => (data?.notifications ?? []).map((n) => ({ ...n, unread: n.unread && !read.has(n.id) })),
    [data, read]
  );
  if (loading || !data) return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading notifications…"}</div>;

  const unread = items.filter((n) => n.unread);
  const earlier = items.filter((n) => !n.unread);
  const markAll = () => setRead(new Set(items.map((n) => n.id)));
  const markRead = (id: string) => setRead((prev) => new Set(prev).add(id));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-t14 font-semibold text-ink">Notifications</div>
          <div className="text-t10 text-faint">Admin view — all departments · Shreeram R</div>
        </div>
        <Button variant="default" size="sm" onClick={markAll}>Mark all read</Button>
      </div>

      <div className="-mx-3.5 min-h-0 flex-1 overflow-y-auto px-3.5 pb-3">
        {unread.length > 0 && (
          <>
            <div className="mb-1.5 text-t10 font-semibold uppercase tracking-[0.5px] text-ink">{unread.length} Unread</div>
            <div className="tw mb-3.5">
              {unread.map((n) => <NotifItem key={n.id} n={n} colors={data.deptColors} onRead={markRead} />)}
            </div>
          </>
        )}
        {earlier.length > 0 && (
          <>
            <div className="mb-1.5 text-t10 font-semibold uppercase tracking-[0.5px] text-faint">Earlier</div>
            <div className="tw">
              {earlier.map((n) => <NotifItem key={n.id} n={n} colors={data.deptColors} onRead={markRead} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
