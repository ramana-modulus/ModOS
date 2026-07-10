"use client";

import { useState } from "react";
import { contractsApi } from "@/features/contracts/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { PreSalesView } from "./pre-sales";
import { PostSalesView } from "./post-sales";

type Mode = "presales" | "postsales";
type PreSub = "pipeline" | "submittals" | "rfi" | "bid" | "emd" | "similar";
type PostSub = "docs" | "legal" | "fininstr" | "obligations" | "arbitration" | "workflow";

export function ContractsPage() {
  const { data, loading, error } = useQuery(() => contractsApi.getContracts(), []);
  const [mode, setMode] = useState<Mode>("presales");
  const [tender, setTender] = useState<string>("L9");
  const [project, setProject] = useState<string>("P1");
  const [preSub, setPreSub] = useState<PreSub>("pipeline");
  const [postSub, setPostSub] = useState<PostSub>("docs");

  if (loading || !data) {
    return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading contracts…"}</div>;
  }

  const modeBtn = (m: Mode, label: string, note: string) => {
    const active = mode === m;
    return (
      <div
        onClick={() => setMode(m)}
        className="cursor-pointer rounded-md px-[18px] py-1.5 text-t11"
        style={{
          fontWeight: active ? 600 : 400,
          background: active ? "#fff" : "transparent",
          color: active ? "#7B1FA2" : "#6B6A68",
          boxShadow: active ? "0 1px 3px rgba(0,0,0,.08)" : "none",
        }}
      >
        {label} <span style={{ opacity: 0.6, fontWeight: 400 }}>· {note}</span>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Mode switch */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex w-fit gap-0 rounded-lg p-[3px]" style={{ background: "#F0EFED" }}>
          {modeBtn("presales", "Pre-Sales", "Tendering")}
          {modeBtn("postsales", "Post-Sales", "Awarded Projects")}
        </div>
        {mode === "presales" && (
          <button
            type="button"
            disabled
            className="tbb p ml-auto"
            style={{ fontSize: "11px", opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }}
            title="Read-only demo"
          >
            + New Tender
          </button>
        )}
      </div>

      {mode === "presales" ? (
        <PreSalesView data={data} tender={tender} setTender={setTender} preSub={preSub} setPreSub={setPreSub} />
      ) : (
        <PostSalesView data={data} project={project} setProject={setProject} postSub={postSub} setPostSub={setPostSub} />
      )}
    </div>
  );
}
