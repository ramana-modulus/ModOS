import type { BomHistoryEntry } from "@/types/procurement";

export const ENG_BOM_HISTORY: Record<string, BomHistoryEntry[]> = {
  'P1.SP1.SS-1001': [
    {ver:'v3', date:'22 Apr 2026 · 14:20', by:'Vigneshwaran',  changes:'Added 2 BOM lines (E7018 electrodes, Red Oxide primer) per Rohith review', released:true,  releasedAt:'22 Apr 2026 · 16:00'},
    {ver:'v2', date:'12 Apr 2026 · 11:30', by:'Vigneshwaran',  changes:'Reworked qty +6.67% (36,000 → 38,400 kg) based on detailed frame layout', released:false},
    {ver:'v1', date:'01 Apr 2026 · 09:00', by:'System (auto)', changes:'Initial from Estimation V3 BOQ handoff', released:false},
  ],
  'P1.SP1.SS-1004': [
    {ver:'v3', date:'20 May 2026 · 09:30', by:'Vigneshwaran',  changes:'Post-PO rework: increased plate qty +5% (380 → 399 kg) after revised connection details. ⚠ Procurement to review impact on PO-001.', released:false},
    {ver:'v2', date:'18 Apr 2026 · 10:15', by:'Vigneshwaran',  changes:'Reworked qty +8.57% (350 → 380 kg). Added MS Plate 12mm as primary material.', released:true, releasedAt:'19 Apr 2026 · 11:00'},
    {ver:'v1', date:'01 Apr 2026 · 09:00', by:'System (auto)', changes:'Initial from Estimation V3 BOQ handoff', released:false},
  ],
  'P1.SP1.FN-4001': [
    {ver:'v2', date:'20 Apr 2026 · 15:40', by:'Dushyanth K',   changes:'Components added — flush shutter core, lipping, ironmongery set (WBC door)', released:false},
    {ver:'v1', date:'01 Apr 2026 · 09:00', by:'System (auto)', changes:'Initial from Estimation V3 BOQ handoff', released:false},
  ],
  'P1.SP1.WC-1001': [
    {ver:'v2', date:'21 Apr 2026 · 09:00', by:'Dushyanth K',   changes:'BOM components drafted; awaits Rohith review', released:false},
    {ver:'v1', date:'01 Apr 2026 · 09:00', by:'System (auto)', changes:'Initial from Estimation V3 BOQ handoff', released:false},
  ],
};
