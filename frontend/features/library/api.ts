import type {
  LibCategory,
  LibItem,
  LibMachinery,
  LibManpower,
  LibMaterial,
  LibTransport,
  LibHistoryEntry,
} from "./types";
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
  kpis: LibraryKpis;
}

export const libraryApi = {
  getLibrary: () => apiGet<LibraryPayload>("/library"),
};
