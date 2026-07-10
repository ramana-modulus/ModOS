"use client";

import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SetRole, SetUser } from "@/features/settings/types";

const C = "60px 1fr 200px 140px 100px 130px 40px";
const STATUS: Record<string, "pg" | "pa" | "pr"> = { active: "pg", invited: "pa", disabled: "pr" };
const STATUS_LABEL: Record<string, string> = { active: "Active", invited: "Invited", disabled: "Disabled" };

export function UsersTab({ users, roles }: { users: SetUser[]; roles: SetRole[] }) {
  return (
    <>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-t11 text-muted"><strong>{users.length}</strong> users in the organisation</div>
        <div className="flex gap-1.5">
          <Button variant="default" size="sm">↓ Export List</Button>
          <Button variant="primary" size="sm">+ Invite User</Button>
        </div>
      </div>
      <div className="tw">
        <div className="th" style={{ gridTemplateColumns: C }}>
          <span>ID</span><span>Name · Email · Phone</span><span>Role</span><span>Joined</span><span>Status</span><span>Last Active</span><span />
        </div>
        {users.map((u) => {
          const role = roles.find((r) => r.id === u.role);
          return (
            <div key={u.id} className="tr" style={{ gridTemplateColumns: C }}>
              <span className="font-mono text-t10 font-medium text-ink">{u.id}</span>
              <span>
                <div className="text-t11 font-medium text-ink">{u.name}</div>
                <div className="ts">{u.email || "no email"} · {u.phone}</div>
              </span>
              <span className="text-t10 text-ink-soft">{role ? role.name : u.role}<div className="text-t9 text-faint">{role?.type === "custom" ? "custom role" : "system role"}</div></span>
              <span className="text-t10 text-muted">{u.joinedOn}</span>
              <span>
                <Pill cls={STATUS[u.status] ?? "pr"}>{STATUS_LABEL[u.status]}</Pill>
                {u.status === "invited" && u.inviteSentOn && <div className="mt-0.5 text-t9 text-faint">sent {u.inviteSentOn}</div>}
              </span>
              <span className="text-t9 text-faint">{u.lastActive || "never"}</span>
              <span className="cursor-pointer text-center text-t14 text-faint">⋯</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3 py-2 text-t10 text-muted">
        <strong>How users are added:</strong> Admin invites via email or phone (for site workers without email — WhatsApp invite). User accepts → sets password → role becomes active. Role determines what they see; deactivated users keep audit trail but lose access immediately.
      </div>
    </>
  );
}
