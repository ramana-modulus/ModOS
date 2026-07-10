import { apiGet } from "@/lib/http";
import type { AppNotification, MyTask } from "./types";

export interface InboxPayload {
  notifications: AppNotification[];
  myTasks: MyTask[];
  deptColors: Record<string, string>;
  unreadCount: number;
  dueToday: string;
}

export const inboxApi = {
  getInbox: () => apiGet<InboxPayload>("/inbox"),
};
