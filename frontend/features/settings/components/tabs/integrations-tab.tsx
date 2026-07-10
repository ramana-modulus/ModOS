"use client";

import { IconPlugConnected } from "@tabler/icons-react";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SetIntegration } from "@/features/settings/types";

const CATEGORY_COLOR: Record<string, string> = {
  Accounting: "#854F0B",
  Communication: "#185FA5",
  Storage: "#5C2E91",
  Compliance: "#3B6D11",
  Banking: "#A32D2D",
};
const STATUS_META: Record<string, { pill: "pg" | "pa" | "pgr"; label: string }> = {
  connected: { pill: "pg", label: "Connected" },
  pilot: { pill: "pa", label: "Pilot" },
  disconnected: { pill: "pgr", label: "Disconnected" },
};

export function IntegrationsTab({ integrations }: { integrations: SetIntegration[] }) {
  const byCat = new Map<string, SetIntegration[]>();
  integrations.forEach((i) => (byCat.get(i.category) ?? byCat.set(i.category, []).get(i.category)!).push(i));

  return (
    <>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-t11 text-muted"><strong>{integrations.filter((i) => i.status === "connected").length}</strong> active integrations across <strong>{byCat.size}</strong> categories</div>
        <Button variant="primary" size="sm">+ Browse Integration Marketplace</Button>
      </div>
      <div className="flex flex-col gap-3.5">
        {[...byCat.entries()].map(([cat, ints]) => {
          const color = CATEGORY_COLOR[cat] ?? "#9B9894";
          return (
            <div key={cat}>
              <div className="mb-1.5 text-t10 font-semibold uppercase tracking-[0.5px]" style={{ color }}>{cat} · {ints.length}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ints.map((i) => {
                  const sm = STATUS_META[i.status] ?? STATUS_META.disconnected!;
                  return (
                    <div key={i.id} className="rounded-lg border-[0.5px] border-[#E5E4E0] bg-surface p-3">
                      <div className="mb-2 flex items-start justify-between gap-2.5">
                        <div className="flex flex-1 items-center gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md" style={{ background: `${color}15`, color }}><IconPlugConnected size={16} /></div>
                          <div className="min-w-0 flex-1">
                            <div className="text-t12 font-semibold text-ink">{i.name}</div>
                            <div className="text-t10 text-faint">{i.authType}{i.authUser ? ` · ${i.authUser}` : ""}</div>
                          </div>
                        </div>
                        <Pill cls={sm.pill}>{sm.label}</Pill>
                      </div>
                      <div className="mb-2 text-t10 leading-normal text-ink-soft"><span className="text-faint">Scope:</span> {i.scope}</div>
                      <div className="mb-2 grid grid-cols-2 gap-2 rounded bg-[#FBF9F6] px-2 py-1.5 text-t9">
                        <div><span className="text-faint">Sync freq:</span> <strong className="text-ink">{i.syncFreq}</strong></div>
                        <div><span className="text-faint">Last sync:</span> <strong className="text-ink">{i.lastSync || "never"}</strong></div>
                      </div>
                      {i.note && <div className="rounded border-l-2 bg-[#FBF9F6] px-2 py-1.5 text-t10 leading-normal text-muted" style={{ borderColor: color }}>{i.note}</div>}
                      <div className="mt-2 flex gap-1.5">
                        {i.status === "connected" && <><Button variant="default" size="sm">Sync Now</Button><Button variant="default" size="sm">Configure</Button></>}
                        {i.status === "pilot" && <><Button variant="primary" size="sm">Graduate to Production</Button><Button variant="default" size="sm">Configure</Button></>}
                        {i.status === "disconnected" && <Button variant="primary" size="sm">Connect</Button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
