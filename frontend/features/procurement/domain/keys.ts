import type { ProcKey, ScopeKey } from "@/types/procurement";

/** Build the sub-project scope key, e.g. `("P1","SP1") → "P1.SP1"`. */
export function scopeKey(projId: string, spId: string): ScopeKey {
  return `${projId}.${spId}`;
}

/** Build a full line key, e.g. `("P1","SP1","SS-M-101") → "P1.SP1.SS-M-101"`. */
export function procKey(projId: string, spId: string, code: string): ProcKey {
  return `${projId}.${spId}.${code}`;
}

/** Split a full key into its parts. */
export function parseKey(key: ProcKey): { projId: string; spId: string; code: string } {
  const [projId = "", spId = "", ...rest] = key.split(".");
  return { projId, spId, code: rest.join(".") };
}

/** The material code portion of a full key. */
export function codeFromKey(key: ProcKey): string {
  return key.split(".").slice(2).join(".");
}

/** The scope (`"P1.SP1"`) portion of a full key. */
export function scopeFromKey(key: ProcKey): ScopeKey {
  return key.split(".").slice(0, 2).join(".");
}
