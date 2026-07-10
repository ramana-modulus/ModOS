import type { ReactNode } from "react";

/** Generic coloured pill (`_cPill`). */
export function CPill({ children, color, bg }: { children: ReactNode; color: string; bg: string }) {
  return (
    <span
      style={{
        fontSize: "9.5px",
        fontWeight: 600,
        color,
        background: bg,
        padding: "2px 8px",
        borderRadius: "10px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const STATUS_COLORS: Record<string, [string, string]> = {
  ready: ["#3B6D11", "#EAF3E0"],
  uploaded: ["#3B6D11", "#EAF3E0"],
  paid: ["#3B6D11", "#EAF3E0"],
  active: ["#3B6D11", "#EAF3E0"],
  closed: ["#3B6D11", "#EAF3E0"],
  submitted: ["#185FA5", "#E3EEF7"],
  on_track: ["#3B6D11", "#EAF3E0"],
  met: ["#3B6D11", "#EAF3E0"],
  pending: ["#854F0B", "#F6ECD9"],
  requested: ["#185FA5", "#E3EEF7"],
  open: ["#A32D2D", "#F6E0E0"],
  at_risk: ["#A32D2D", "#F6E0E0"],
  breached: ["#A32D2D", "#F6E0E0"],
  refund_pending: ["#854F0B", "#F6ECD9"],
  answered: ["#185FA5", "#E3EEF7"],
  awaiting_estimation: ["#854F0B", "#F6ECD9"],
  na: ["#9B9894", "#F0EFED"],
  conciliation: ["#854F0B", "#F6ECD9"],
};

/** Status pill with the module's canonical status→colour map (`_cStatusPill`). */
export function StatusPill({ status }: { status: string }) {
  const [c, b] = STATUS_COLORS[status] ?? ["#6B6A68", "#F0EFED"];
  return (
    <CPill color={c} bg={b}>
      {status.replace(/_/g, " ")}
    </CPill>
  );
}

/** Compact table (`_cTable`). Rows are arrays of cell nodes. */
export function CTable({ headers, rows }: { headers: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                textAlign: "left",
                padding: "7px 10px",
                color: "#9B9894",
                fontSize: "9px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".4px",
                borderBottom: "1px solid #E8E7E4",
                whiteSpace: "nowrap",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri} style={{ borderBottom: "0.5px solid #F0EFED" }}>
            {r.map((c, ci) => (
              <td key={ci} style={{ padding: "8px 10px", color: "#4A4945", verticalAlign: "top" }}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** White rounded card wrapper used across contract tabs. */
export function CardBox({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #E8E7E4",
        borderRadius: "8px",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Centered empty-state / info message block. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: "30px", textAlign: "center", color: "#9B9894", fontSize: "12px" }}>
      {children}
    </div>
  );
}
