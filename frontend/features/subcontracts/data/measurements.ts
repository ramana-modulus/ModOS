import type { ScMeasurement } from "@/features/subcontracts/types";

export const SC_MEASUREMENTS: Record<string, ScMeasurement[]> = {
  'P1.SP1.SS-1001': [
    {ra:6, periodTo:'12 May 2026', qtyThis:8000,  cumQty:8000,  certBy:'Site Engineer (Tharun)'},
    {ra:7, periodTo:'19 May 2026', qtyThis:12000, cumQty:20000, certBy:'Site Engineer (Tharun)'},
  ],
  'P1.SP1.EL-1001': [
    {ra:6, periodTo:'12 May 2026', qtyThis:40, cumQty:40, certBy:'Site Engineer (Tharun)'},
    {ra:7, periodTo:'19 May 2026', qtyThis:24, cumQty:64, certBy:'Site Engineer (Tharun)'},
  ],
  'P1.SP1.PL-1001': [
    {ra:7, periodTo:'19 May 2026', qtyThis:100, cumQty:100, certBy:'Site Engineer (Tharun)'},
  ],
  'P1.SP1.WC-1001': [
    {ra:7, periodTo:'19 May 2026', qtyThis:1200, cumQty:1200, certBy:'Site Engineer (Imran)'},
  ],
};
