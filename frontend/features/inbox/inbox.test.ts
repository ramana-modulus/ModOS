import { describe, expect, it } from "vitest";
import { getInbox } from "@/features/inbox/server/repository";
import { moduleHref } from "@/features/inbox/routes";

describe("getInbox", () => {
  const inbox = getInbox();
  it("returns all notifications + tasks", () => {
    expect(inbox.notifications.length).toBe(7);
    expect(inbox.myTasks.length).toBe(9);
  });
  it("counts unread notifications for the badge", () => {
    expect(inbox.unreadCount).toBe(inbox.notifications.filter((n) => n.unread).length);
    expect(inbox.unreadCount).toBe(6);
  });
  it("maps every notification's dept to a colour", () => {
    for (const n of inbox.notifications) {
      // BD/Admin etc. may be absent; at least the primary depts resolve
      if (["Estimation", "Engineering", "Procurement", "Ops", "Finance"].includes(n.dept)) {
        expect(inbox.deptColors[n.dept]).toBeTruthy();
      }
    }
  });
});
describe("moduleHref (cross-module link resolver)", () => {
  it("maps alias / suffixed targets to real routes (no 404s)", () => {
    expect(moduleHref("estimation_assign")).toBe("/estimation");
    expect(moduleHref("estimation_workflow")).toBe("/estimation");
    expect(moduleHref("bd")).toBe("/bizdev");
    expect(moduleHref("qa/qc")).toBe("/qaqc");
    expect(moduleHref("procurement")).toBe("/procurement");
    expect(moduleHref("engineering")).toBe("/engineering");
  });
  it("falls back to /projects for unknown targets", () => {
    expect(moduleHref("nonsense")).toBe("/projects");
    expect(moduleHref(undefined)).toBe("/projects");
  });
});
