import type { ScWoAmendment } from "@/features/subcontracts/types";

export const SC_WO_AMENDMENTS: Record<string, ScWoAmendment[]> = {
  'P1.SP1.EL-1001': [
    {amdId:'VO-001', date:'18 May 2026', by:'Rohith (Engineering Head)', type:'extension',
     before:{'Completion date':'(per base WO)'}, after:{'Completion date':'05 Jun 2026'},
     reason:'Client hold on Block-B electrical rooms — 10-day extension of time granted.',
     approvedBy:'Gobinath', approvedOn:'18 May 2026'}
  ]
};
