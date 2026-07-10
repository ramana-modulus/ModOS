import "server-only";
import {
  BILL_CONFIG,
  BILL_PROJECTS,
  BILL_MEAS,
  BILL_VENDOR,
  SC_BILLS,
  MEAS_APPROVER,
  MEAS_ENGINEER,
  BILL_TODAY,
} from "@/features/billing/data";
import {
  billMeasClientValue,
  billMeasExecCost,
  billMeasReconcile,
  billMeasCat,
  measScType,
  measMode,
  measModeMeta,
  measStatusMeta,
  clientTax,
  subcTax,
  isPrelim,
  qcCodeIsMaterial,
  cabinArRollup,
  cabinRows,
  regKeyAR,
  regKeyAP,
} from "@/features/billing/domain";
import type {
  BillProject,
  BillSubProject,
  BillingView,
  BillMeas,
  MeasCardView,
  MeasurementGroup,
  RaClientGroup,
  RaClientLine,
  RaSubcGroup,
  RaSubcSubbie,
  RegAgeingBucket,
  RegCycleRow,
  RegisterView,
} from "@/features/billing/types";

export function listProjects(): BillProject[] {
  return BILL_PROJECTS;
}

function findProject(projId: string): BillProject {
  return BILL_PROJECTS.find((p) => p.id === projId) ?? BILL_PROJECTS[0]!;
}

function findSub(project: BillProject, spId: string): BillSubProject {
  return project.subProjects.find((s) => s.id === spId) ?? project.subProjects[0]!;
}

function spineFor(key: string): BillMeas[] {
  return BILL_MEAS[key] ?? [];
}

/* ─────────────────────────── Measurement Book ─────────────────────────── */

function measCard(m: BillMeas): MeasCardView {
  const mode = measMode(m.uom);
  return {
    meas: m,
    clientValue: billMeasClientValue(m),
    execCost: billMeasExecCost(m),
    category: billMeasCat(m),
    scType: measScType(m),
    mode,
    modeMeta: measModeMeta(mode),
    reconcileIssues: billMeasReconcile(m),
    statusMeta: measStatusMeta(m.status),
  };
}

function measurementGroups(spine: BillMeas[]): MeasurementGroup[] {
  const byCycle = new Map<string, BillMeas[]>();
  for (const m of spine) {
    const arr = byCycle.get(m.cycle) ?? [];
    arr.push(m);
    byCycle.set(m.cycle, arr);
  }
  return [...byCycle.keys()]
    .sort()
    .map((cycle) => {
      const list = byCycle.get(cycle)!;
      const statusCounts: Record<string, number> = {};
      for (const m of list) statusCounts[m.status] = (statusCounts[m.status] ?? 0) + 1;
      return {
        cycle,
        upcoming: list.every((m) => m.status !== "billed"),
        cards: list.map(measCard),
        statusCounts,
      };
    });
}

/* ─────────────────────────── Client RA projection (AR) ─────────────────────────── */

function raClientGroups(_key: string, spine: BillMeas[], units: number): RaClientGroup[] {
  const prelimClient = units > 1; // cabinized → sub-project client RAs carry prelims only
  const fwdAll = spine;
  const all = fwdAll.filter(
    (m) => (m.status === "approved" || m.status === "billed") && !(prelimClient && !isPrelim(m))
  );
  const cycles = [...new Set(all.map((m) => m.cycle))].filter(Boolean).sort();

  return cycles.map((cy) => {
    const lines = all.filter((m) => m.cycle === cy && !qcCodeIsMaterial(m.code));
    const fwdClient = fwdAll.filter((m) => m.cycle === cy && !qcCodeIsMaterial(m.code));
    const pending = fwdClient.filter((m) => !(m.status === "approved" || m.status === "billed")).length;
    const gross = lines.reduce((s, m) => s + billMeasClientValue(m), 0);
    const { retention, gst, net } = clientTax(gross);
    const billed = lines.length > 0 && lines.every((m) => m.status === "billed");

    let statusLabel: string;
    let pill: RaClientGroup["pill"];
    let accent: string;
    if (billed) {
      statusLabel = "Billed";
      pill = "pb";
      accent = "#185FA5";
    } else if (pending > 0) {
      statusLabel = `Upcoming RA — ${pending} line${pending > 1 ? "s" : ""} pending approval`;
      pill = "pgr";
      accent = "#9B9894";
    } else if (lines.length) {
      statusLabel = "Upcoming RA — claimable";
      pill = "pgr";
      accent = "#854F0B";
    } else {
      statusLabel = "Awaiting measurement";
      pill = "pgr";
      accent = "#9B9894";
    }

    const raLines: RaClientLine[] = lines.map((m) => ({
      code: m.code,
      name: m.name,
      uom: m.uom,
      measuredQty: m.measuredQty,
      clientRate: m.clientRate,
      value: billMeasClientValue(m),
      isMilestone: !(m.clientRate && m.measuredQty),
    }));

    return { cycle: cy, statusLabel, pill, accent, lines: raLines, pending, gross, retention, gst, net, billed };
  });
}

/* ─────────────────────────── Subcontractor RA projection (AP) ─────────────────────────── */

function scStatusSets(key: string): { paid: Set<string>; cert: Set<string> } {
  const paid = new Set<string>();
  const cert = new Set<string>();
  for (const b of SC_BILLS) {
    if (!b.key.startsWith(key + ".")) continue;
    if (b.status === "paid") paid.add(b.cycle);
    if (b.status === "forwarded_to_finance" || b.status === "matched" || b.status === "paid") cert.add(b.cycle);
  }
  return { paid, cert };
}

function raSubcGroups(key: string, spine: BillMeas[]): RaSubcGroup[] {
  const all = spine.filter((m) => m.status === "approved" || m.status === "billed");
  const cycles = [...new Set(all.map((m) => m.cycle))].filter(Boolean).sort();
  const scForKey = SC_BILLS.filter((b) => b.key.startsWith(key + "."));

  return cycles.map((cy) => {
    const list = all.filter((m) => m.cycle === cy);
    const bySub = new Map<string, RaSubcSubbie>();
    for (const m of list) {
      for (const e of m.execution || []) {
        if (e.mode !== "lineitem" && e.mode !== "manpower") continue;
        const k = e.subbie || "?";
        const rec = bySub.get(k) ?? { subbie: k, name: e.subbieName || k, lineGross: 0, manGross: 0, scopes: [] };
        rec.scopes.push({
          code: m.code,
          scope: e.scope,
          mode: e.mode,
          value: e.value || 0,
          qty: e.qty,
          rate: e.rate,
          uom: m.uom,
        });
        if (e.mode === "manpower") rec.manGross += e.value || 0;
        else rec.lineGross += e.value || 0;
        bySub.set(k, rec);
      }
    }
    const subbies = [...bySub.values()];
    const lineSubs = subbies.filter((b) => b.lineGross > 0);
    const manTotal = subbies.reduce((s, b) => s + b.manGross, 0);
    const manCount = subbies.filter((b) => b.manGross > 0).length;
    const gross = lineSubs.reduce((s, b) => s + b.lineGross, 0);
    const { retention, tds, gst, net } = subcTax(gross);

    const scForCy = scForKey.filter((b) => b.cycle === cy);
    const anyPaid = scForCy.length > 0 && scForCy.every((b) => b.status === "paid");
    const anyFwd = scForCy.some((b) => b.status === "forwarded_to_finance" || b.status === "paid");
    let statusLabel: string;
    let pill: RaSubcGroup["pill"];
    let accent: string;
    if (anyPaid) {
      statusLabel = "Paid";
      pill = "pg";
      accent = "#3B6D11";
    } else if (anyFwd) {
      statusLabel = "Forwarded to Finance";
      pill = "pb";
      accent = "#185FA5";
    } else if (scForCy.length) {
      statusLabel = "Certified — 3-way matched";
      pill = "pa";
      accent = "#185FA5";
    } else {
      statusLabel = "Awaiting certification";
      pill = "pgr";
      accent = "#9B9894";
    }

    return { cycle: cy, statusLabel, pill, accent, subbies: lineSubs, manTotal, manCount, gross, retention, tds, gst, net };
  });
}

/* ─────────────────────────── Bill Register (AR/AP by cycle + ageing) ─────────────────────────── */

const MS_PER_DAY = 864e5;

function parseBillDate(s: string | null | undefined): number | null {
  if (!s) return null;
  const t = Date.parse(s.replace("·", " "));
  return Number.isNaN(t) ? null : t;
}

function ageing(items: { value: number; date: string | null }[]): RegAgeingBucket[] {
  const today = Date.parse(BILL_TODAY);
  const buckets = BILL_CONFIG.agingBuckets.map((b) => ({ ...b, value: 0 }));
  let current = 0;
  for (const it of items) {
    const t = parseBillDate(it.date);
    if (t == null) {
      current += it.value;
      continue;
    }
    const days = Math.floor((today - t) / MS_PER_DAY);
    const bk = buckets.find((b) => days >= b.min && days <= b.max);
    if (bk) bk.value += it.value;
    else current += it.value;
  }
  const out: RegAgeingBucket[] = buckets
    .filter((b) => b.value > 0)
    .map((b) => ({ label: b.label, color: b.color, value: b.value }));
  if (current > 0) out.push({ label: "current", color: "#9B9894", value: current });
  return out;
}

function buildRegister(keys: string[]): RegisterView {
  const cycleAcc = new Map<
    string,
    { cycle: string; arGross: number; arNet: number; apGross: number; apNet: number; arStatus: RegCycleRow["arStatus"]; apStatus: RegCycleRow["apStatus"] }
  >();
  const T = {
    arGross: 0,
    arNet: 0,
    arBilled: 0,
    arClaimable: 0,
    arCertified: 0,
    arReceived: 0,
    apGross: 0,
    apNet: 0,
    apPaid: 0,
    apCert: 0,
    apManpower: 0,
  };
  const arAge: { value: number; date: string | null }[] = [];
  const apAge: { value: number; date: string | null }[] = [];

  for (const key of keys) {
    const spine = spineFor(key);
    const projId = key.split(".")[0] ?? "";
    const spId = key.split(".")[1] ?? "";
    const project = findProject(projId);
    const units = findSub(project, spId).units;
    const ar = regKeyAR(key, spine, units);
    const { paid, cert } = scStatusSets(key);
    const ap = regKeyAP(key, spine, paid, cert);

    const allCy = new Set([...Object.keys(ar), ...Object.keys(ap)]);
    for (const cy of allCy) {
      const a = ar[cy];
      const p = ap[cy];
      const acc =
        cycleAcc.get(cy) ??
        ({ cycle: cy, arGross: 0, arNet: 0, apGross: 0, apNet: 0, arStatus: "none", apStatus: "none" } as const);
      const next = { ...acc };
      if (a) {
        next.arGross += a.gross;
        next.arNet += a.net;
        next.arStatus = a.status === "billed" ? "billed" : a.status === "partial" ? "partial" : "claimable";
        T.arGross += a.gross;
        T.arNet += a.net;
        T.arCertified += a.certified;
        T.arReceived += a.received;
        if (a.status === "billed") {
          T.arBilled += a.net;
          arAge.push({ value: Math.max(0, a.net - a.received), date: a.billedOn });
        } else T.arClaimable += a.net;
      }
      if (p) {
        next.apGross += p.gross;
        next.apNet += p.net;
        next.apStatus = p.status;
        T.apGross += p.gross;
        T.apNet += p.net;
        T.apManpower += p.manGross;
        if (p.status === "paid") T.apPaid += p.net;
        else if (p.status === "certified") {
          T.apCert += p.net;
          apAge.push({ value: p.net, date: null });
        }
      }
      cycleAcc.set(cy, next);
    }

    // Inject per-cabin RA roll-up as a single "Cabin RAs" cycle (cabin-scope AR).
    const car = cabinArRollup(spine, units);
    if (car && car.totalAr > 0) {
      const billedNet = car.billed.net + car.certified.net + car.paid.net;
      const certNet = car.certified.net + car.paid.net;
      const recvNet = car.paid.net;
      const claimNet = car.unbilled.net;
      const grossAll = car.billed.gross + car.certified.gross + car.paid.gross + car.unbilled.gross;
      const netAll = billedNet + claimNet;
      const acc =
        cycleAcc.get("Cabin RAs") ??
        ({ cycle: "Cabin RAs", arGross: 0, arNet: 0, apGross: 0, apNet: 0, arStatus: "none", apStatus: "none" } as const);
      const next = { ...acc };
      next.arGross += grossAll;
      next.arNet += netAll;
      next.arStatus = billedNet > 0 ? "billed" : "claimable";
      cycleAcc.set("Cabin RAs", next);
      T.arGross += grossAll;
      T.arNet += netAll;
      T.arBilled += billedNet;
      T.arClaimable += claimNet;
      T.arCertified += certNet;
      T.arReceived += recvNet;
      if (billedNet > 0) arAge.push({ value: Math.max(0, billedNet - recvNet), date: null });
    }
  }

  const cycles: RegCycleRow[] = [...cycleAcc.keys()]
    .sort()
    .map((cy) => {
      const c = cycleAcc.get(cy)!;
      return {
        cycle: c.cycle,
        arNet: c.arNet,
        arGross: c.arGross,
        apNet: c.apNet,
        apGross: c.apGross,
        margin: c.arGross - c.apGross,
        arStatus: c.arStatus,
        apStatus: c.apStatus,
      };
    });

  const arOutstanding = Math.max(0, T.arBilled - T.arReceived);
  const apOutstanding = Math.max(0, T.apNet - T.apPaid);
  const margin = T.arGross - T.apGross;
  const marginPct = T.arGross > 0 ? Math.round((margin / T.arGross) * 100) : 0;

  return {
    arGross: T.arGross,
    arNet: T.arNet,
    arClaimable: T.arClaimable,
    arBilled: T.arBilled,
    arCertified: T.arCertified,
    arReceived: T.arReceived,
    arOutstanding,
    apGross: T.apGross,
    apNet: T.apNet,
    apCert: T.apCert,
    apPaid: T.apPaid,
    apOutstanding,
    apManpower: T.apManpower,
    margin,
    marginPct,
    cycles,
    arAgeing: ageing(arAge),
    apAgeing: ageing(apAge),
  };
}

/* ─────────────────────────── KPI header ─────────────────────────── */

function raLabel(register: RegisterView, cabinized: boolean, cabinRollup: ReturnType<typeof cabinArRollup>): string {
  if (cabinized && cabinRollup) {
    const cabinRAn = cabinRollup.billed.n + cabinRollup.certified.n + cabinRollup.paid.n;
    const prelimRAn = register.cycles.filter((c) => c.cycle !== "Cabin RAs" && c.arGross > 0).length;
    return `${prelimRAn} prelim RA${prelimRAn === 1 ? "" : "s"} · ${cabinRAn} cabin RA${cabinRAn === 1 ? "" : "s"}`;
  }
  const n = register.cycles.length;
  return `${n} RA bill${n === 1 ? "" : "s"}`;
}

/* ─────────────────────────── Public entry ─────────────────────────── */

export function getBilling(projId: string, spId: string): BillingView {
  const project = findProject(projId);
  const subProject = findSub(project, spId);
  const key = `${project.id}.${subProject.id}`;
  const spine = spineFor(key);
  const units = subProject.units;
  const cabinized = units > 1;

  const register = buildRegister([key]);
  const rollup = cabinArRollup(spine, units);
  const cabins = cabinized ? cabinRows(spine, units) : [];

  const contractValue = subProject.contractValue ?? project.estimate ?? 0;
  const kpis = {
    contractValue,
    arGross: register.arGross,
    arCertified: register.arCertified,
    arReceived: register.arReceived,
    apOutstanding: register.apOutstanding,
    apManpower: register.apManpower,
    margin: register.margin,
    marginPct: register.marginPct,
    raLabel: raLabel(register, cabinized, rollup),
  };

  const measurement = measurementGroups(spine);
  const measurementPending = spine.filter((m) => m.status === "submitted").length;
  const measurementFlagged = spine.filter((m) => billMeasReconcile(m).length > 0).length;

  return {
    scope: key,
    project,
    subProject,
    subProjects: project.subProjects,
    units,
    config: BILL_CONFIG,
    measEngineer: MEAS_ENGINEER,
    measApprover: MEAS_APPROVER,
    kpis,
    measurement,
    measurementPending,
    measurementFlagged,
    raClient: raClientGroups(key, spine, units),
    cabinRollup: rollup,
    cabins,
    vendorBills: BILL_VENDOR[key] ?? [],
    raSubc: raSubcGroups(key, spine),
    scBills: SC_BILLS.filter((b) => b.key.startsWith(key + ".")),
    register,
  };
}
