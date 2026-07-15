"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBell, IconCheckbox, IconMenu2 } from "@tabler/icons-react";
import { resolveDepartment } from "@/lib/nav";
import { inboxApi } from "@/features/inbox/api";
import { useQuery } from "@/features/procurement/hooks/use-query";

interface TopbarProps {
  /** Override the unread count; defaults to the live inbox count. */
  notificationCount?: number;
  /** Mobile: toggles the off-canvas sidebar. */
  onMenuClick?: () => void;
}

export function Topbar({ notificationCount, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { label, breadcrumb } = resolveDepartment(pathname);
  // Re-read on navigation so a fresh win (which adds notifications) is reflected.
  const { data } = useQuery(() => inboxApi.getInbox(), [pathname]);
  const count = notificationCount ?? data?.unreadCount ?? 0;

  return (
    <header className="flex h-header flex-shrink-0 items-center gap-2 border-b-[0.5px] border-line bg-surface px-3.5">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="mr-1 flex items-center rounded-md p-1 text-muted hover:bg-canvas md:hidden"
      >
        <IconMenu2 size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="truncate text-t10 text-faint">{breadcrumb}</div>
        <h1 className="truncate text-t14 font-semibold text-ink">{label}</h1>
      </div>

      <Link
        href="/notifications"
        title="Notifications"
        className="flex items-center gap-1.5 whitespace-nowrap rounded-md border-[0.5px] border-input bg-surface px-2.5 py-[5px] text-t11 text-muted hover:bg-canvas"
      >
        <IconBell size={15} aria-hidden />
        <span className="ml-0.5 rounded-[10px] bg-accent px-1.5 py-px text-t9 font-bold text-white">
          {count}
        </span>
      </Link>
      <Link
        href="/mytasks"
        className="flex items-center gap-1.5 whitespace-nowrap rounded-md border-[0.5px] border-input bg-surface px-2.5 py-[5px] text-t11 text-muted hover:bg-canvas"
      >
        <IconCheckbox size={15} aria-hidden />
        My Tasks
      </Link>
    </header>
  );
}
