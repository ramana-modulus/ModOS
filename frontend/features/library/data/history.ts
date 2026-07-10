import type { LibHistoryEntry } from "@/features/library/types";

export const LIB_ITEMS_HISTORY: Record<string, LibHistoryEntry[]> = {
  // ─── MATERIAL (used inside structural steel BOQs) ───
  'SS-M-104': [
    {date:'20 May 2026', by:'System (auto)', source:'procurement_po', oldRate:85,  newRate:88,   delta:+3,   note:'Auto-synced from PO MH-PO-26-001 close — Aahir Engineers ₹88/kg'},
    {date:'01 May 2026', by:'Imran',         source:'manual',         oldRate:82,  newRate:85,   delta:+3,   note:'Q2 rate revision — TSA steel index up 5.3%'},
    {date:'01 Apr 2026', by:'Imran',         source:'manual',         oldRate:80,  newRate:82,   delta:+2,   note:'Annual baseline update'},
  ],
  'SS-M-101': [
    {date:'05 May 2026', by:'System (auto)', source:'procurement_po', oldRate:85,  newRate:88,   delta:+3,   note:'PO MH-PO-26-001 closed at ₹88/kg (Aahir Engineers)'},
    {date:'01 Apr 2026', by:'Imran',         source:'manual',         oldRate:82,  newRate:85,   delta:+3,   note:'RC-2026-001 signed with Aahir — base rate revised'},
  ],
  'SS-M-102': [
    {date:'06 May 2026', by:'System (auto)', source:'procurement_po', oldRate:11,  newRate:11.5, delta:+0.5, note:'PO MH-PO-26-002 closed at ₹11.5 — Inhouse Retails (spot rate post-RC expiry)'},
  ],
  'SS-M-105': [
    {date:'07 May 2026', by:'System (auto)', source:'procurement_po', oldRate:220, newRate:215,  delta:-5,   note:'PO MH-PO-26-005 closed at ₹215 — Asian Paints (RC-2026-003 in force)'},
  ],
  'SS-M-106': [
    {date:'18 Apr 2026', by:'System (auto)', source:'procurement_po', oldRate:90,  newRate:92,   delta:+2,   note:'PO MH-PO-26-006 closed at ₹92/kg — Aahir Engineers'},
  ],
  'SS-M-108': [
    {date:'15 Apr 2026', by:'Imran',         source:'manual',         oldRate:88,  newRate:92,   delta:+4,   note:'Plate-grade premium adjustment'},
  ],
  'FN-M-401': [
    {date:'02 Apr 2026', by:'Arumugam',      source:'manual',         oldRate:1400, newRate:1450, delta:+50,  note:'RC-2026-002 signed with Aakruti — WBC shutter ₹1450/sqm'},
  ],
  // ─── MACHINERY rates (used inside multiple BOQs) ───
  'MC-5002': [
    {date:'01 Apr 2026', by:'Arumugam',      source:'manual',         oldRate:580, newRate:600,  delta:+20,  note:'Welding-machine hire rate Q2 revision'},
  ],
  // ─── MANPOWER rates ───
  'MP-3008': [
    {date:'01 Apr 2026', by:'Arumugam',      source:'manual',         oldRate:1050,newRate:1100, delta:+50,  note:'Fabricator daily rate Q2 revision'},
  ],
};
