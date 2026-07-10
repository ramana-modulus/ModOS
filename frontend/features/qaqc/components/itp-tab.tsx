"use client";

import type { Itp } from "@/features/qaqc/types";

const STAGE_META: Record<string, { label: string; color: string; bg: string }> = {
  incoming: { label: "Incoming", color: "#854F0B", bg: "#FAEEDA" },
  wip: { label: "WIP", color: "#185FA5", bg: "#E6F1FB" },
  final: { label: "Final", color: "#3B6D11", bg: "#EAF3DE" },
};

export function ItpTab({ itps, spName }: { itps: Itp[]; spName: string }) {
  const holdPts = itps.filter((i) => i.holdPoint).length;

  if (itps.length === 0) {
    return <div className="rounded-lg bg-subtle p-[30px] text-center text-t11 text-faint">No ITPs in the library for this scope.</div>;
  }

  return (
    <div>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        <button type="button" className="rounded-md border-[0.5px] border-accent bg-accent px-2.5 py-1 text-t10 font-medium text-white">
          + Define New ITP
        </button>
        <button type="button" className="rounded-md border-[0.5px] border-line bg-surface px-2.5 py-1 text-t10 text-muted">
          ↓ Export ITP Library (PDF)
        </button>
      </div>

      <div className="mb-2.5 rounded-md border-[0.5px] border-line bg-canvas px-3 py-2.5 text-t10 text-muted">
        <strong>{itps.length} ITPs</strong> · <span style={{ color: "#A32D2D", fontWeight: 600 }}>{holdPts} hold point{holdPts === 1 ? "" : "s"}</span>{" "}
        in the <strong>{spName}</strong> rulebook. Codes are born in the costing library (<strong>LIB_ITEMS</strong> / <strong>LIB_BOM</strong>);
        an ITP never mints a code — it points at one that already carries a rate, so a code resolves to both its rate and its inspection regime.
      </div>

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {itps.map((itp) => {
          const sm = STAGE_META[itp.stage] ?? STAGE_META.incoming!;
          return (
            <div
              key={itp.id}
              className="rounded-lg border-[0.5px] bg-surface p-3"
              style={{ borderColor: itp.holdPoint ? "#A32D2D" : "#E5E4E0", boxShadow: itp.holdPoint ? "0 0 0 0.5px #A32D2D" : undefined }}
            >
              <div className="mb-2 flex items-center justify-between border-b-[0.5px] border-line-soft pb-2">
                <div>
                  <div className="font-mono text-t10 font-semibold" style={{ color: "#5C2E91" }}>
                    {itp.id}
                  </div>
                  <div className="mt-0.5 text-t11 font-medium text-ink">{itp.name}</div>
                  <div className="mt-0.5 font-mono text-t9 text-faint">{itp.bomCode}</div>
                </div>
                <div className="flex flex-col items-end gap-[3px]">
                  <span className="rounded-sm px-1.5 py-0.5 text-t9 font-medium" style={{ background: sm.bg, color: sm.color }}>
                    {sm.label}
                  </span>
                  {itp.holdPoint && (
                    <span className="rounded-sm px-1.5 py-0.5 text-t9 font-semibold" style={{ background: "#FAE9E4", color: "#A32D2D" }}>
                      ⛔ HOLD POINT
                    </span>
                  )}
                  {itp.witnessPoint && (
                    <span className="rounded-sm px-1.5 py-0.5 text-t9" style={{ background: "#E6F1FB", color: "#185FA5" }}>
                      👁 Witness
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-1.5 text-t9 font-medium uppercase tracking-[0.5px] text-faint">Checks ({itp.checks.length})</div>
              <div className="flex flex-col gap-1">
                {itp.checks.map((c, idx) => (
                  <div key={idx} className="flex gap-1.5 rounded-sm bg-canvas px-2 py-[5px]">
                    <span className="mt-px flex-shrink-0 text-t9 text-faint">✓</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-t10 font-medium text-ink">{c.check}</div>
                      <div className="mt-px text-t9 text-muted">
                        {c.criteria} <span className="text-faint">· {c.method}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 border-t-[0.5px] border-line-soft pt-2 text-t9 text-faint">
                ⚡{" "}
                {itp.stage === "incoming"
                  ? "Auto-raised at GRN receipt" + (itp.holdPoint ? " · holds stock in quarantine until released" : " · acceptance check")
                  : "Raised on site WIR request" + (itp.holdPoint ? " · holds the line until released" : " · witness")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
