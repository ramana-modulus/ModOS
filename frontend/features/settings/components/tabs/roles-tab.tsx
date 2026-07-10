"use client";

import { useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { SetDept, SetPermLevel, SetRole } from "@/features/settings/types";

const initialOf = (lvl: string) => (lvl === "none" ? "—" : lvl === "view" ? "V" : lvl === "edit" ? "E" : "A");

export function RolesTab({ roles, depts, permLevels }: { roles: SetRole[]; depts: SetDept[]; permLevels: SetPermLevel[] }) {
  const [roleView, setRoleView] = useState<string | null>(null);
  const meta = (id: string) => permLevels.find((p) => p.id === id) ?? permLevels[0]!;

  if (roleView) {
    const r = roles.find((x) => x.id === roleView);
    if (!r) return <div>Role not found</div>;
    return (
      <>
        <div className="mb-2.5 flex items-center gap-2">
          <button type="button" onClick={() => setRoleView(null)} className="inline-flex items-center gap-1 text-t11 text-accent">
            <IconArrowLeft size={12} /> All roles
          </button>
          <span className="text-faint">/</span>
          <span className="text-t11 font-medium text-ink">{r.name}</span>
        </div>
        <div className="mb-3 rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-t14 font-semibold text-ink">{r.name}</span>
                <span className="rounded px-2 py-0.5 text-t9 font-medium" style={{ background: r.type === "custom" ? "#F0EBF9" : "#F0EFEB", color: r.type === "custom" ? "#5C2E91" : "#4A4945" }}>{r.type}</span>
                <span className="rounded bg-info-soft px-2 py-0.5 text-t9 font-medium text-info">{r.userCount} user{r.userCount === 1 ? "" : "s"}</span>
              </div>
              <div className="text-t11 text-muted">{r.description}</div>
              <div className="mt-1 font-mono text-t10 text-faint">{r.id}</div>
            </div>
            <div className="flex gap-1.5">
              <Button variant="default" size="sm">Duplicate</Button>
              {r.type === "custom" && <Button variant="default" size="sm" className="text-danger">Delete</Button>}
              <Button variant="primary" size="sm">Save Changes</Button>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface">
          <div className="border-b-[0.5px] border-[#E5E4E0] bg-[#F0EFEB] px-3.5 py-2.5 text-t11 font-semibold text-ink">Department-level Permissions</div>
          <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3">
            {depts.map((d) => {
              const cur = r.perms[d.id] ?? "none";
              return (
                <div key={d.id} className="rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] p-2.5">
                  <div className="mb-1.5 text-t11 font-medium text-ink">{d.name}</div>
                  <div className="flex flex-wrap gap-[3px]">
                    {permLevels.map((p) => {
                      const sel = cur === p.id;
                      return (
                        <span key={p.id} className="rounded px-2 py-[3px] text-t9" style={{ background: sel ? p.bg : "#fff", color: sel ? p.color : "#9B9894", border: `0.5px solid ${sel ? p.color : "#D8D7D4"}`, fontWeight: sel ? 600 : 400 }}>
                          {p.id === "none" ? "None" : p.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2.5 rounded-md border-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3 py-2 text-t10 text-muted">
          <strong>Permission semantics:</strong> View = read-only access. Edit = create/modify records. Approve = approve workflow items. Approve implies edit, edit implies view.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-t11 text-muted"><strong>{roles.length}</strong> roles defined · {depts.length} departments × 4 permission levels</div>
        <Button variant="primary" size="sm">+ Create Custom Role</Button>
      </div>
      <div className="mb-3 overflow-hidden rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface">
        <div className="border-b-[0.5px] border-[#E5E4E0] bg-[#F0EFEB] px-3.5 py-2.5 text-t11 font-semibold text-ink">Permission Matrix — Roles × Departments</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-t10">
            <thead>
              <tr className="bg-[#FBF9F6]">
                <th className="sticky left-0 min-w-[180px] border-b-[0.5px] border-r-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-2.5 py-2 text-left font-medium text-ink">Role</th>
                <th className="w-[50px] border-b-[0.5px] border-[#E5E4E0] px-1 py-1.5 text-center text-t9 font-medium text-muted">Users</th>
                {depts.map((d) => <th key={d.id} className="border-b-[0.5px] border-[#E5E4E0] px-1 py-1.5 text-center text-t9 font-medium text-muted">{d.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="cursor-pointer border-b-[0.5px] border-[#F0EFEB] hover:bg-[#FBF9F6]" onClick={() => setRoleView(r.id)}>
                  <td className="sticky left-0 border-r-[0.5px] border-[#E5E4E0] bg-surface px-2.5 py-2">
                    <div className="text-t11 font-medium text-ink">{r.name}</div>
                    <div className="text-t9 text-faint">{r.type === "custom" ? "custom" : "system"} · {r.description}</div>
                  </td>
                  <td className="px-1 py-1 text-center text-t11 font-semibold text-ink">{r.userCount}</td>
                  {depts.map((d) => {
                    const lvl = r.perms[d.id] ?? "none";
                    const m = meta(lvl);
                    return (
                      <td key={d.id} className="px-1 py-1 text-center">
                        <span className="inline-block h-[22px] w-[26px] rounded text-t10 font-semibold leading-[22px]" style={{ background: m.bg, color: m.color }} title={m.label}>{initialOf(lvl)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t-[0.5px] border-[#E5E4E0] bg-[#FBF9F6] px-3.5 py-2 text-t10 text-muted">
          <div className="flex flex-wrap items-center gap-2.5">
            <strong>Legend:</strong>
            {permLevels.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1">
                <span className="inline-block h-[18px] w-[22px] rounded text-center text-t9 font-semibold leading-[18px]" style={{ background: p.bg, color: p.color }}>{initialOf(p.id)}</span>
                {p.label}
              </span>
            ))}
          </div>
          <span>Click any row to edit role permissions</span>
        </div>
      </div>
    </>
  );
}
