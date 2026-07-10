import type { AggregatedBomItem, EngBomLine, Project } from "@/types/procurement";

/** Units for a sub-project — drives per-unit → sub-project material scaling. */
export function spUnits(project: Project | undefined, spId: string): number {
  const sp = project?.subProjects?.find((s) => s.id === spId);
  return sp?.units ?? 1;
}

export interface AggregateOptions {
  /** Line basis resolver. Defaults to "lot" (components already at sub-project totals). */
  lineBasis?: (code: string) => "lot" | "per_unit";
  /** Kickoff routing gate — return false to divert a line away from Procurement. */
  routesToProc?: (code: string) => boolean;
  /** Sub-project unit count (only used for per_unit lines). */
  units?: number;
}

/**
 * Aggregate `ENG_BOM` components for a sub-project into procurement demand,
 * rolling the same material up across every consuming BOQ line.
 *
 * Gates (faithful to the prototype):
 *  1. Only `engStatus === "approved"` and not `released === false` lines flow in.
 *  2. Only lines that route to Procurement (default: all) are included.
 *
 * Per-unit lines scale their components by `units`; "lot" lines pass through.
 */
export function aggregateBOM(
  engLines: EngBomLine[],
  options: AggregateOptions = {}
): AggregatedBomItem[] {
  const { lineBasis = () => "lot", routesToProc = () => true, units = 1 } = options;

  interface Acc {
    code: string;
    name: string;
    uom: string;
    rate: number;
    totalQty: number;
    cat: string;
    sourceBOQs: string[];
    sources: { boq: string; qty: number; basis: string }[];
    bases: Set<string>;
  }
  const map = new Map<string, Acc>();

  engLines
    .filter((p) => p.engStatus === "approved" && p.released !== false && routesToProc(p.code))
    .forEach((parent) => {
      const basis = lineBasis(parent.code);
      (parent.components || []).forEach((c) => {
        let acc = map.get(c.code);
        if (!acc) {
          acc = {
            code: c.code,
            name: c.name,
            uom: c.uom,
            rate: c.rate,
            totalQty: 0,
            cat: parent.cat || "Other",
            sourceBOQs: [],
            sources: [],
            bases: new Set<string>(),
          };
          map.set(c.code, acc);
        }
        const compTotal = basis === "per_unit" ? c.engQty * units : c.engQty;
        acc.totalQty += compTotal;
        acc.bases.add(basis);
        if (!acc.sourceBOQs.includes(parent.code)) acc.sourceBOQs.push(parent.code);
        acc.sources.push({ boq: parent.code, qty: compTotal, basis });
      });
    });

  return [...map.values()]
    .map((m) => ({
      code: m.code,
      name: m.name,
      uom: m.uom,
      rate: m.rate,
      totalQty: m.totalQty,
      cat: m.cat,
      sourceBOQs: m.sourceBOQs,
      sources: m.sources,
      basis: m.bases.size > 1 ? "mixed" : [...m.bases][0] || "lot",
      units,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}
