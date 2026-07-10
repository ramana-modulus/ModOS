import type { EstCategory } from "@/features/estimation/types";

/** Line-item grouping — the 14 estimation categories (mirrors `LIB_CATEGORIES`). */
export const EST_CATEGORIES: EstCategory[] = [
  { id: "SS", label: "Superstructure", discipline: "Structure" },
  { id: "FW", label: "Foundation / Substructure", discipline: "Structure" },
  { id: "WS", label: "Wall System / Cladding", discipline: "Structure" },
  { id: "RF", label: "Roof", discipline: "Structure" },
  { id: "FN", label: "Fenestrations", discipline: "Structure" },
  { id: "FL", label: "Finishes & Flooring", discipline: "Structure" },
  { id: "FC", label: "False Ceiling", discipline: "Structure" },
  { id: "FU", label: "Furniture & FF&E", discipline: "Structure" },
  { id: "RD", label: "Roadworks & External Dev.", discipline: "Structure" },
  { id: "LN", label: "Landscaping & Signage", discipline: "Structure" },
  { id: "EL", label: "Electrical", discipline: "MEP" },
  { id: "AC", label: "Air Conditioning / HVAC", discipline: "MEP" },
  { id: "PL", label: "Plumbing & Sanitary", discipline: "MEP" },
  { id: "FF", label: "Fire Fighting & Safety", discipline: "MEP" },
];
