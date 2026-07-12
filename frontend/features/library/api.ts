import type {
  LibCategory,
  LibItem,
  LibMachinery,
  LibManpower,
  LibMaterial,
  LibTransport,
  LibHistoryEntry,
} from "./types";
import type { BudgetaryLineItem } from "./data/budgetary";
import { apiGet } from "@/lib/http";

export interface LibraryKpis {
  categories: number;
  boqItems: number;
  bomMaterials: number;
  manpowerTrades: number;
  machinery: number;
}

export interface LibraryPayload {
  categories: LibCategory[];
  items: LibItem[];
  materials: LibMaterial[];
  manpower: LibManpower[];
  machinery: LibMachinery[];
  transport: LibTransport[];
  history: Record<string, LibHistoryEntry[]>;
  /** Per-technology budgetary (enquiry-stage) rate cards. */
  budgetary: Record<string, BudgetaryLineItem[]>;
  kpis: LibraryKpis;
}

export const libraryApi = {
  getLibrary: () => apiGet<LibraryPayload>("/library"),
};
