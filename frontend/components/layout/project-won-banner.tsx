"use client";

import { useRouter } from "next/navigation";
import { useProjectWon } from "./project-won-provider";

/**
 * Global "Project Won 🎉" banner — pinned to the top across every department.
 * Unlike the prototype (which auto-dismisses after a few seconds) this stays up
 * until a user acknowledges it (✕) or opens the new project.
 */
export function ProjectWonBanner() {
  const { won, dismiss } = useProjectWon();
  const router = useRouter();

  if (!won) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        padding: "14px 20px",
        background: "#1A1917",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,.3)",
      }}
    >
      <span style={{ fontSize: 20 }}>🎉</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Project Won — {won.name}</div>
        <div style={{ fontSize: 10, color: "#9B9894" }}>
          New project created · {won.code} · All departments notified · WBS to be built by PM
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          className="tbb"
          style={{ fontSize: 10, background: "#C84B2F", color: "#fff", borderColor: "#C84B2F" }}
          onClick={() => {
            dismiss();
            router.push("/projects");
          }}
        >
          Open Project →
        </button>
        <button
          type="button"
          className="tbb"
          style={{ fontSize: 10, background: "transparent", color: "#9B9894", borderColor: "#6B6A68" }}
          onClick={dismiss}
        >
          ✕ Acknowledge
        </button>
      </div>
    </div>
  );
}
