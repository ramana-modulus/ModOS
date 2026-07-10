import "server-only";
import { DEPT_COLORS, MY_TASKS, NOTIFICATIONS } from "@/features/inbox/data";
import type { InboxPayload } from "@/features/inbox/api";

/** Admin inbox payload — notifications, tasks, and the badge count. */
export function getInbox(): InboxPayload {
  return {
    notifications: NOTIFICATIONS,
    myTasks: MY_TASKS,
    deptColors: DEPT_COLORS,
    unreadCount: NOTIFICATIONS.filter((n) => n.unread).length,
    dueToday: "20 May 2024",
  };
}
