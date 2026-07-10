import type { ScExecEntry } from "@/features/subcontracts/types";

export const SC_EXEC_LOG: Record<string, ScExecEntry[]> = {
  'P1.SP1.SS-1001': [
    {date:'08 May 2026', qty:3000, by:'Site Engineer (Tharun)'},
    {date:'12 May 2026', qty:5000, by:'Site Engineer (Tharun)'},
    {date:'15 May 2026', qty:7000, by:'Site Engineer (Tharun)'},
    {date:'19 May 2026', qty:5000, by:'Site Engineer (Tharun)'},
    {date:'21 May 2026', qty:4000, by:'Site Engineer (Tharun)'},
    {date:'23 May 2026', qty:2000, by:'Site Engineer (Tharun)'},
  ],
  'P1.SP1.EL-1001': [
    {date:'12 May 2026', qty:40, by:'Site Engineer (Tharun)'},
    {date:'19 May 2026', qty:24, by:'Site Engineer (Tharun)'},
    {date:'22 May 2026', qty:8,  by:'Site Engineer (Tharun)'},
  ],
  'P1.SP1.PL-1001': [
    {date:'19 May 2026', qty:100, by:'Site Engineer (Tharun)'},
    {date:'23 May 2026', qty:30,  by:'Site Engineer (Tharun)'},
  ],
  'P1.SP1.WC-1001': [
    {date:'19 May 2026', qty:1200, by:'Site Engineer (Imran)'},
    {date:'22 May 2026', qty:400,  by:'Site Engineer (Imran)'},
  ],
};
