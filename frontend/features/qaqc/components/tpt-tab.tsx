"use client";

import { Pill } from "@/components/ui/badge";
import type { Tpt, TptStatus } from "@/features/qaqc/types";

const STATUS_META: Record<TptStatus, { pill: "pg" | "pa" | "pr" | "pb" | "pgr" | "pac"; label: string }> = {
  scheduled: { pill: "pgr", label: "Scheduled" },
  sample_collected: { pill: "pa", label: "Sample Collected" },
  at_lab: { pill: "pa", label: "At Lab" },
  report_received: { pill: "pb", label: "Report Received" },
  passed: { pill: "pg", label: "Passed" },
  rejected: { pill: "pr", label: "Rejected" },
};

const STAGES: TptStatus[] = ["scheduled", "sample_collected", "at_lab", "report_received", "passed"];

function Kpi({ label, value, sub, tone }: { label: string; value: number; sub: string; tone?: string }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={`kv ${tone ?? ""}`}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-t9 uppercase tracking-[0.4px] text-faint">{label}</div>
      <div className="text-t10 text-ink">{value}</div>
    </div>
  );
}

export function TptTab({ tpts }: { tpts: Tpt[] }) {
  const awaiting = tpts.filter((t) => ["scheduled", "sample_collected", "at_lab", "report_received"].includes(t.status)).length;
  const passedN = tpts.filter((t) => t.status === "passed").length;
  const failedN = tpts.filter((t) => t.status === "rejected").length;

  return (
    <div>
      <button type="button" className="mb-2.5 rounded-md border-[0.5px] border-accent bg-accent px-2.5 py-1 text-t10 font-medium text-white">
        + Schedule Test
      </button>

      <div className="kr mb-3 grid grid-cols-2 sm:grid-cols-4">
        <Kpi label="Total Tests" value={tpts.length} sub="this sub-project" />
        <Kpi label="Awaiting Result" value={awaiting} sub="scheduled · at lab" tone={awaiting > 0 ? "cac" : "cg"} />
        <Kpi label="Passed" value={passedN} sub="validated" tone="cg" />
        <Kpi label="Failed → NCR" value={failedN} sub="non-conformance" tone={failedN > 0 ? "cr" : "cg"} />
      </div>

      {tpts.length === 0 ? (
        <div className="rounded-lg bg-subtle p-[30px] text-center text-t11 text-faint">No third-party tests scheduled yet.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tpts.map((t) => {
            const sm = STATUS_META[t.status] ?? STATUS_META.scheduled;
            const isRej = t.status === "rejected";
            const curIdx = isRej ? 4 : STAGES.indexOf(t.status);
            return (
              <div
                key={t.id}
                className="rounded-lg border-[0.5px] bg-surface p-3.5"
                style={{ borderColor: t.status === "passed" ? "#3B6D11" : isRej ? "#A32D2D" : "#E5E4E0" }}
              >
                {/* header */}
                <div className="mb-2.5 flex justify-between gap-2.5 border-b-[0.5px] border-line-soft pb-2.5">
                  <div className="flex-1">
                    <div className="mb-[3px] flex flex-wrap items-center gap-2">
                      <span className="font-mono text-t13 font-semibold text-ink">{t.id}</span>
                      <Pill cls={sm.pill}>{sm.label}</Pill>
                      {t.linkedNCR && (
                        <span className="rounded-sm px-2 py-0.5 text-t9 font-semibold" style={{ background: "#FAE9E4", color: "#A32D2D" }}>
                          ↳ {t.linkedNCR}
                        </span>
                      )}
                      {t.linkedNCROut && (
                        <span className="rounded-sm px-2 py-0.5 text-t9 font-semibold" style={{ background: "#FCEBEB", color: "#A32D2D" }}>
                          ⚠ {t.linkedNCROut} →
                        </span>
                      )}
                    </div>
                    <div className="text-t12 font-medium text-ink">{t.testType}</div>
                    <div className="mt-0.5 text-t10 text-faint">
                      For <span className="font-mono" style={{ color: "#854F0B" }}>{t.bomCode}</span>
                      {t.standard && (
                        <>
                          {" "}
                          · <b className="text-muted">{t.standard}</b>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-t10 font-medium text-ink">{t.lab}</div>
                    {t.sampleSize && <div className="text-t9 text-faint">{t.sampleSize}</div>}
                  </div>
                </div>

                {/* stepper */}
                <div className="mb-3 flex items-center">
                  {STAGES.map((s, i) => {
                    const last = i === STAGES.length - 1;
                    const label = last ? (isRej ? "Rejected" : "Passed") : STATUS_META[s].label;
                    const done = i <= curIdx;
                    const isCur = i === curIdx;
                    const bg = !done ? "#E5E4E0" : last && isRej ? "#A32D2D" : last ? "#3B6D11" : "var(--ac)";
                    return (
                      <div key={s} className="flex flex-1 items-center">
                        <div className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-t9 font-semibold text-white" style={{ background: bg }}>
                          {done ? (last && isRej ? "×" : "✓") : i + 1}
                        </div>
                        <div className="ml-[5px] text-t9" style={{ color: done || isCur ? "#1A1917" : "#9B9894", fontWeight: isCur ? 600 : 400 }}>
                          {label}
                        </div>
                        {!last && <div className="mx-[5px] h-[1.5px] flex-1" style={{ background: i < curIdx ? "var(--ac)" : "#E5E4E0" }} />}
                      </div>
                    );
                  })}
                </div>

                {/* KV grid */}
                <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Kv label="Scheduled" value={t.scheduledFor ?? "—"} />
                  <Kv label="Sample collected" value={t.sampleCollected ?? "pending"} />
                  <Kv label="Sent to lab" value={t.sentToLab ?? "—"} />
                  <Kv label="Report" value={t.reportDate ?? "—"} />
                </div>

                {t.acceptance && (
                  <div className="mb-1.5 text-t10 text-muted">
                    <span className="text-t9 uppercase tracking-[0.5px] text-faint">Acceptance: </span>
                    {t.acceptance}
                  </div>
                )}

                {(t.status === "passed" || isRej) && (
                  <div className="mb-2 rounded border-[0.5px] px-2.5 py-2 text-t10" style={isRej ? { background: "#FBF3F3", borderColor: "#E8C9C9", color: "#A32D2D" } : { background: "#EAF3DE", borderColor: "#cfe0b8", color: "#3B6D11" }}>
                    <b>{isRej ? "FAILED" : "PASSED"}</b>
                    {t.resultNote ? " — " + t.resultNote : ""}
                    {t.attestedBy && (
                      <div className="mt-[3px] text-t9 text-muted">
                        Attested by {t.attestedBy}
                        {t.reportDate ? " · " + t.reportDate : ""}
                      </div>
                    )}
                  </div>
                )}

                {t.note && <div className="mb-2 text-t10 italic text-faint">{t.note}</div>}
                {t.reportFile && (
                  <button type="button" className="rounded-md border-[0.5px] border-line bg-surface px-2.5 py-1 text-t10 text-muted">
                    📄 {t.reportFile}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2.5 rounded-md border-[0.5px] border-line bg-canvas px-3 py-2 text-t10 text-muted">
        Schedule a sample → accredited lab → result. A <b style={{ color: "#3B6D11" }}>passed</b> TPT validates the batch&apos;s acceptance; a{" "}
        <b style={{ color: "#A32D2D" }}>failed</b> TPT auto-raises an NCR (source TPT) that holds the line&apos;s RA until closed.
      </div>
    </div>
  );
}
