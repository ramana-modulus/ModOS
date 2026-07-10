/** Notifications + My Tasks (the admin inbox). Faithful to `NOTIFICATIONS` / `MY_TASKS`. */

export type Priority = "high" | "med" | "low";

export interface AppNotification {
  id: string;
  dept: string;
  project: string;
  ref: string;
  type: "action" | "info";
  priority: Priority;
  msg: string;
  action?: string;
  actionTarget?: string;
  date: string;
  unread: boolean;
  from: string;
  to: string[];
  nav?: string;
}

export interface MyTask {
  id: string;
  dept: string;
  project: string;
  msg: string;
  priority: Priority;
  due: string;
  done: boolean;
  target: string;
}
