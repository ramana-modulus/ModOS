"use client";

import { useState } from "react";
import { ViewTabs } from "@/components/ui/tabs";
import { libraryApi } from "@/features/library/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import { LineItemsTab } from "./tabs/line-items-tab";
import { MaterialTab } from "./tabs/material-tab";
import { ManpowerTab } from "./tabs/manpower-tab";
import { MachineryTab } from "./tabs/machinery-tab";
import { TransportTab } from "./tabs/transport-tab";

type LibSub = "lineitems" | "material" | "manpower" | "machinery" | "transport";

const TABS: { key: LibSub; label: string }[] = [
  { key: "lineitems", label: "Line Item (BOQ)" },
  { key: "material", label: "Material Rates (BOM)" },
  { key: "manpower", label: "Manpower Rates" },
  { key: "machinery", label: "Machinery Rates" },
  { key: "transport", label: "Transport Rates" },
];

function Kpi({ label, value, sub, accent }: { label: string; value: number; sub: string; accent?: boolean }) {
  return (
    <div className="kp">
      <div className="kl">{label}</div>
      <div className={accent ? "kv cac" : "kv"}>{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

export function LibraryPage() {
  const { data, loading, error } = useQuery(() => libraryApi.getLibrary(), []);
  const [sub, setSub] = useState<LibSub>("lineitems");
  const [cat, setCat] = useState<string>("All");

  if (loading || !data) {
    return <div className="px-3.5 py-8 text-center text-t11 text-faint">{error ?? "Loading item library…"}</div>;
  }

  const { kpis, categories, items, materials, manpower, machinery, transport, history } = data;
  const showCatFilter = sub === "lineitems" || sub === "material";
  const catList = ["All", ...categories.map((c) => c.id)];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* KPIs */}
      <div className="mb-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Categories" value={kpis.categories} sub="FW, SS, RO…" />
        <Kpi label="BOQ Line Items" value={kpis.boqItems} sub="with BOM breakdowns" />
        <Kpi label="BOM Materials" value={kpis.bomMaterials} sub="[CAT]-M-[code]" accent />
        <Kpi label="Manpower Trades" value={kpis.manpowerTrades} sub="MP- rate cards" />
        <Kpi label="Machinery" value={kpis.machinery} sub="MH- rate cards" />
      </div>

      <ViewTabs items={TABS} value={sub} onChange={setSub} />

      <div className="-mx-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 pb-3">
        {/* Category filter */}
        {showCatFilter && (
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className="flex-shrink-0 text-t10 text-faint">Category:</span>
            {catList.map((c) => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className="cursor-pointer rounded-[20px] border-[0.5px] px-2 py-0.5 text-t9"
                  style={{
                    borderColor: active ? "#C84B2F" : "#D8D7D4",
                    background: active ? "#FAE9E4" : "#fff",
                    color: active ? "#C84B2F" : "#6B6A68",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {sub === "lineitems" && <LineItemsTab items={items} categories={categories} activeCat={cat} />}
        {sub === "material" && <MaterialTab materials={materials} activeCat={cat} history={history} />}
        {sub === "manpower" && <ManpowerTab manpower={manpower} />}
        {sub === "machinery" && <MachineryTab machinery={machinery} />}
        {sub === "transport" && <TransportTab transport={transport} />}
      </div>
    </div>
  );
}
