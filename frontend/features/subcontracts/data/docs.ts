import type { ScDoc } from "@/features/subcontracts/types";

export const SC_DOCS: Record<string, ScDoc[]> = {
  // Sub-project transactional docs: work orders, comparative statements, subbie quotes, RA abstracts.
  'P1.SP1': [
    {name:'WO_0041_SS-1001_SriVenkateswara.pdf',         type:'Work Order',  uploaded:'20 May 2026', by:'Aarumugam', size:'0.5 MB', status:'Released'},
    {name:'WO_0043_WC-1001_KovaiCladding.pdf',           type:'Work Order',  uploaded:'21 May 2026', by:'Gobinath',  size:'0.5 MB', status:'Released'},
    {name:'WO_0045_EL-1001_AnnaiMEP.pdf',                type:'Work Order',  uploaded:'22 May 2026', by:'Aarumugam', size:'0.5 MB', status:'Released'},
    {name:'WO_0047_PL-1001_AnnaiMEP.pdf',                type:'Work Order',  uploaded:'20 May 2026', by:'Aarumugam', size:'0.5 MB', status:'Released'},
    {name:'Comparative_Statement_SS-1001.pdf',           type:'Comparative', uploaded:'19 May 2026', by:'Aarumugam', size:'0.3 MB', status:'Active'},
    {name:'Comparative_Statement_EL-1001.pdf',           type:'Comparative', uploaded:'21 May 2026', by:'Aarumugam', size:'0.3 MB', status:'Active'},
    {name:'AnnaiMEP_EL_Turnkey_Quote.pdf',               type:'Subbie Quote',uploaded:'20 May 2026', by:'Aarumugam', size:'0.4 MB', status:'Received'},
    {name:'RA-07_Measurement_Abstract_MSC-002.pdf',      type:'RA Bill',     uploaded:'22 May 2026', by:'Tharun',    size:'0.4 MB', status:'Certified'},
  ],
  'P1.SP2': [],
};
