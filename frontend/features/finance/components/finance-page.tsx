"use client";

import { useState, type ReactNode } from "react";
import { fmtC } from "@/lib/format";
import { financeApi, type FinanceScope } from "@/features/finance/api";
import { useQuery } from "@/features/procurement/hooks/use-query";
import type { FinanceKpis, FinProject } from "@/features/finance/types";
import { FinanceProjectBar } from "./finance-project-bar";
import { ApTab } from "./ap-tab";
import { ArTab } from "./ar-tab";
import { CashflowTab } from "./cashflow-tab";
import { PnlTab } from "./pnl-tab";

type SubTab = "ap" | "ar" | "cashflow" | "pnl";

/** `₹NN` + a small muted `L` suffix — the treasury KPI rendering. */
function Lakh({ value, cls }: { value: number; cls?: string }) {
  return (
    <div className={"kv " + (cls ?? "")}>
      ₹{fmtC(value / 100000)}
      <span className="ml-0.5 text-t10 font-normal text-faint">L</span>
    </div>
  );
}

function KpiBar({ kpis, projectName }: { kpis: FinanceKpis; projectName: string }) {
  return (
    <div className="kr mb-3 grid" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
      <div className="kp">
        <div className="kl">Bank Balance (Total)</div>
        <Lakh value={kpis.totalBank} />
        <div className="ks">across {kpis.bankCount} accounts</div>
      </div>
      <div className="kp">
        <div className="kl">Working Capital Available</div>
        <Lakh value={kpis.wcAvailable} cls="cg" />
        <div className="ks">CC limit unused</div>
      </div>
      <div className="kp">
        <div className="kl">AP Inbox ({projectName})</div>
        <Lakh value={kpis.apInboxValue} cls={kpis.apInboxValue > 0 ? "ca" : "cg"} />
        <div className="ks">
          {kpis.apInboxCount} bill{kpis.apInboxCount === 1 ? "" : "s"} awaiting payment
        </div>
      </div>
      <div className="kp">
        <div className="kl">AR Outstanding</div>
        <Lakh value={kpis.arOutstandingValue} cls={kpis.arOutstandingValue > 0 ? "ca" : "cg"} />
        <div className="ks">
          {kpis.arOutstandingCount} invoice{kpis.arOutstandingCount === 1 ? "" : "s"} pending receipt
        </div>
      </div>
      <div className="kp">
        <div className="kl">This Week Net</div>
        <div className={"kv " + (kpis.weekNet >= 0 ? "cg" : "cr")}>
          ₹{fmtC(Math.abs(kpis.weekNet) / 100000)}
          <span className="ml-0.5 text-t10 font-normal text-faint">L {kpis.weekNet >= 0 ? "+" : "−"}</span>
        </div>
        <div className="ks">
          in ₹{fmtC(kpis.weekIn / 100000)} · out ₹{fmtC(kpis.weekOut / 100000)} L
        </div>
      </div>
    </div>
  );
}

function TabBadge({ count, color }: { count: number; color: string }) {
  if (count <= 0) return null;
  return (
    <span
      className="ml-1 rounded-lg px-1.5 py-px text-t9 font-semibold text-white"
      style={{ background: color }}
    >
      {count}
    </span>
  );
}

export function FinancePage() {
  const [scope, setScope] = useState<FinanceScope>({ project: "P1", subProject: "SP1" });
  const [tab, setTab] = useState<SubTab>("ap");

  const query = useQuery(() => financeApi.getFinance(scope), [scope.project, scope.subProject]);
  const data = query.data;

  const projects: FinProject[] = data?.projects ?? [];
  const project = projects.find((p) => p.id === scope.project);
  const projectName = project?.name ?? "Project";

  const tabs: { key: SubTab; label: ReactNode; badge?: ReactNode }[] = [
    {
      key: "ap",
      label: "AP — Vendor Payments",
      badge: <TabBadge count={data?.kpis.apInboxCount ?? 0} color="var(--ac)" />,
    },
    {
      key: "ar",
      label: "AR — Client Receivables",
      badge: <TabBadge count={data?.kpis.arOutstandingCount ?? 0} color="#A32D2D" />,
    },
    { key: "cashflow", label: "Cashflow Forecast" },
    { key: "pnl", label: "P&L" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FinanceProjectBar
        projects={projects}
        scope={scope}
        meta={data?.meta ?? null}
        onChange={setScope}
      />

      {query.loading && !data && (
        <div className="rounded-lg bg-canvas p-8 text-center text-t11 text-faint">Loading finance…</div>
      )}
      {query.error && (
        <div className="rounded-lg bg-danger-soft p-4 text-t11 text-danger">{query.error}</div>
      )}

      {data && (
        <>
          <KpiBar kpis={data.kpis} projectName={projectName} />

          {/* Sub-tabs */}
          <div className="vtabs mb-3">
            {tabs.map((t) => (
              <div
                key={t.key}
                className={"vt" + (tab === t.key ? " active" : "")}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.badge}
              </div>
            ))}
          </div>

          <div className="-mx-3.5 min-h-0 flex-1 overflow-y-auto px-3.5 pb-3">
            {tab === "ap" && <ApTab ap={data.ap} />}
            {tab === "ar" && <ArTab ar={data.ar} />}
            {tab === "cashflow" && <CashflowTab cashflow={data.cashflow} />}
            {tab === "pnl" && <PnlTab pnl={data.pnl} />}
          </div>
        </>
      )}
    </div>
  );
}
