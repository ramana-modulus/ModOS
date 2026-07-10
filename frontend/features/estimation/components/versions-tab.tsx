"use client";

import { Pill } from "@/components/ui/badge";
import type { EstVersion } from "@/features/estimation/types";

export interface VersionsTabProps {
  versions: EstVersion[];
}

/**
 * The Versions tab — costing version history. Only the active version is
 * editable in the prototype; older versions are locked (read-only). Faithful
 * port of `renderEstVersions` (action buttons are decorative here).
 */
export function VersionsTab({ versions }: VersionsTabProps) {
  return (
    <div style={{ maxWidth: "600px" }}>
      {versions.map((v) => (
        <div
          key={v.v}
          style={{
            padding: "12px 14px",
            border: `0.5px solid ${v.active ? "var(--ac)" : "#E8E7E4"}`,
            borderRadius: "8px",
            marginBottom: "8px",
            background: v.active ? "var(--ac-lt)" : "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: v.active ? "var(--ac)" : "#1A1917" }}>{v.label}</div>
            {v.active ? <Pill cls="pg">Active · Editable</Pill> : <Pill cls="pgr">Locked · Read-only</Pill>}
          </div>
          <div style={{ fontSize: "10px", color: "#9B9894", marginBottom: "4px" }}>{v.date} · Created by {v.by}</div>
          <div style={{ fontSize: "11px", color: "#6B6A68" }}>{v.note}</div>
        </div>
      ))}
      <div style={{ fontSize: "10px", color: "#9B9894", marginTop: "8px" }}>
        Old versions are locked (read-only). Create a new version for scope changes, spec revisions, or re-pricing.
      </div>
    </div>
  );
}
