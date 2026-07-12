import "server-only";
import {
  LIB_CATEGORIES,
  LIB_ITEMS,
  LIB_BOM,
  LIB_MANPOWER,
  LIB_MACHINERY,
  LIB_TRANSPORT,
  LIB_ITEMS_HISTORY,
} from "@/features/library/data";
import { LIB_BUDGETARY } from "@/features/library/data/budgetary";
import type { LibraryPayload } from "@/features/library/api";

/** The full costing-library payload + KPI counts (static reference data). */
export function getLibrary(): LibraryPayload {
  return {
    categories: LIB_CATEGORIES,
    items: LIB_ITEMS,
    materials: LIB_BOM,
    manpower: LIB_MANPOWER,
    machinery: LIB_MACHINERY,
    transport: LIB_TRANSPORT,
    history: LIB_ITEMS_HISTORY,
    budgetary: LIB_BUDGETARY,
    kpis: {
      categories: LIB_CATEGORIES.length,
      boqItems: LIB_ITEMS.length,
      bomMaterials: LIB_BOM.length,
      manpowerTrades: LIB_MANPOWER.length,
      machinery: LIB_MACHINERY.length,
    },
  };
}
