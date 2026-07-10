"use client";

import type { SignoffView } from "@/features/planning/types";

const DEPT_ICON: Record<string, string> = {
  engineering: "ti-ruler-2",
  procurement: "ti-shopping-cart",
  ops: "ti-hammer",
  qaqc: "ti-shield-check",
  billing: "ti-file-invoice",
  finance: "ti-receipt",
};

/**
 * Signoff (Kickoff) tab — pre-flight checklist, meeting card, and the 6-dept
 * notification grid. Faithful (read-only) port of renderPlanningKickoff (~20068).
 */
export function SignoffTab({ signoff, client }: { signoff: SignoffView; client: string }) {
  const { planApproved, kickedOff, checklist, deptNotifications, meeting } = signoff;

  return (
    <div className="max-w-[760px]">
      {/* Pre-flight checklist */}
      <div className="mb-2 text-t10 uppercase tracking-[0.6px] text-faint">Pre-flight checklist</div>
      <div className="mb-4 rounded-lg border-[0.5px] border-line bg-surface p-3">
        {checklist.map((c, i) => (
          <div key={i} className="flex items-center gap-2.5 py-1.5 text-t11" style={{ opacity: c.ok ? 1 : 0.55 }}>
            <i
              className={`ti ${c.ok ? "ti-circle-check-filled" : "ti-circle"} text-[14px]`}
              style={{ color: c.ok ? "#3B6D11" : "#9B9894" }}
            />
            <span className="flex-1 text-ink">{c.label}</span>
            <span className="text-t10 text-faint">{c.ref}</span>
          </div>
        ))}
      </div>

      {/* Meeting card / schedule prompt */}
      {meeting ? (
        <div className="mb-4 rounded-lg border-[0.5px] border-line bg-canvas p-3.5">
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
              <i className="ti ti-calendar-event text-[18px]" />
            </div>
            <div className="flex-1">
              <div className="text-t13 font-semibold text-ink">Signoff Meeting</div>
              <div className="text-t10 text-muted">
                {meeting.scheduled} · {meeting.venue}
              </div>
            </div>
            <span className={`pill ${kickedOff ? "pg" : "pa"}`}>{kickedOff ? "Notified" : "Pending"}</span>
          </div>
          <div className="mb-1.5 text-t10 uppercase tracking-[0.6px] text-faint">
            Attendees ({meeting.attendees.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {meeting.attendees.map((a) => (
              <span key={a} className="rounded-[12px] border-[0.5px] border-line bg-surface px-2 py-[3px] text-t10 text-muted">
                {a}
              </span>
            ))}
          </div>
        </div>
      ) : planApproved ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border-[0.5px] border-accent bg-accent-soft p-3.5">
          <div>
            <div className="mb-0.5 text-t12 font-medium text-ink">Schedule signoff meeting</div>
            <div className="text-t10 text-muted">Pick a date/time, invite attendees, and prepare to notify departments.</div>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2 rounded-lg border-[0.5px] border-line bg-canvas px-3 py-2.5 text-t10 text-muted">
          <i className="ti ti-info-circle text-[13px]" style={{ color: "#854F0B" }} />
          <span>
            Signoff opens once the client approves the WBS. Submit the plan to <strong>{client}</strong> from the
            Approval tab first.
          </span>
        </div>
      )}

      {/* Department notification grid */}
      <div className="mb-2 text-t10 uppercase tracking-[0.6px] text-faint">
        Department notifications {kickedOff ? "· sent " + (meeting?.notifiedAt ?? "") : "· pending"}
      </div>
      <div className="mb-3.5 grid grid-cols-2 gap-2">
        {deptNotifications.map((d) => {
          const notified = kickedOff && d.notified;
          return (
            <div
              key={d.key}
              className="flex items-center gap-2.5 rounded-md border-[0.5px] bg-surface px-3 py-2.5"
              style={{ borderColor: notified ? "#3B6D11" : "#E5E4E0" }}
            >
              <div
                className="flex h-[30px] w-[30px] items-center justify-center rounded-md"
                style={{ background: notified ? "#EAF3DE" : "#F5F4F2", color: notified ? "#3B6D11" : "#9B9894" }}
              >
                <i className={`ti ${DEPT_ICON[d.key] ?? "ti-building"} text-[15px]`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-t11 font-medium text-ink">
                  {d.label}
                  {notified && <i className="ti ti-circle-check-filled text-[11px]" style={{ color: "#3B6D11" }} />}
                </div>
                <div className="truncate text-t10 text-muted">{d.role}</div>
              </div>
            </div>
          );
        })}
      </div>

      {kickedOff && meeting && (
        <div className="flex items-center gap-2 rounded-md border-[0.5px] border-[#3B6D11] bg-[#EAF3DE] px-3 py-2.5 text-t11" style={{ color: "#3B6D11" }}>
          <i className="ti ti-check text-[14px]" />
          <span>All {meeting.notifiedDepts.length} departments notified. Click any card above to jump into that department.</span>
        </div>
      )}
    </div>
  );
}
