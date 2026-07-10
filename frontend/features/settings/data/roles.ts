import type { SetRole } from "@/features/settings/types";

export const SET_ROLES: SetRole[] = [
  {id:'R-CEO',          name:'CEO',                 type:'system', description:'Founder/Director — full org access', userCount:1,
   perms:{bd:'approve',estimation:'approve',planning:'approve',engineering:'approve',procurement:'approve',ops:'approve',qaqc:'approve',billing:'approve',finance:'approve'}},
  {id:'R-CFO',          name:'CFO',                 type:'system', description:'Finance Head — full money flow control', userCount:1,
   perms:{bd:'view',   estimation:'view',   planning:'view',   engineering:'view',   procurement:'approve',ops:'view',   qaqc:'view',   billing:'approve',finance:'approve'}},
  {id:'R-PM',           name:'Project Manager',     type:'system', description:'End-to-end project ownership', userCount:1,
   perms:{bd:'view',   estimation:'edit',   planning:'approve',engineering:'edit',   procurement:'approve',ops:'approve',qaqc:'edit',   billing:'approve',finance:'view'}},
  {id:'R-BD',           name:'Business Dev',        type:'system', description:'Lead pipeline + quoting', userCount:1,
   perms:{bd:'approve',estimation:'edit',   planning:'view',   engineering:'view',   procurement:'none',   ops:'view',   qaqc:'none',   billing:'view',   finance:'none'}},
  {id:'R-ENGG-LEAD',    name:'Engineering Lead',    type:'system', description:'Owns drawing approval + BOM signoff', userCount:1,
   perms:{bd:'view',   estimation:'approve',planning:'edit',   engineering:'approve',procurement:'edit',   ops:'edit',   qaqc:'edit',   billing:'view',   finance:'none'}},
  {id:'R-ENGG',         name:'Engineer',            type:'system', description:'Drafter / Design / BOM creator', userCount:2,
   perms:{bd:'none',   estimation:'edit',   planning:'view',   engineering:'edit',   procurement:'view',   ops:'view',   qaqc:'view',   billing:'none',   finance:'none'}},
  {id:'R-PROC',         name:'Procurement Officer', type:'system', description:'Vendor + PO management', userCount:1,
   perms:{bd:'none',   estimation:'view',   planning:'view',   engineering:'view',   procurement:'edit',   ops:'view',   qaqc:'view',   billing:'view',   finance:'view'}},
  {id:'R-SITE-MGR',     name:'Site Manager',        type:'system', description:'Site execution lead', userCount:1,
   perms:{bd:'none',   estimation:'view',   planning:'view',   engineering:'view',   procurement:'view',   ops:'edit',   qaqc:'edit',   billing:'view',   finance:'none'}},
  {id:'R-SITE-WORKER',  name:'Site Worker',         type:'custom', description:'Welder / Labour / Foreman — DPR + Indent raise', userCount:1,
   perms:{bd:'none',   estimation:'none',   planning:'none',   engineering:'view',   procurement:'none',   ops:'edit',   qaqc:'view',   billing:'none',   finance:'none'}},
  {id:'R-QA',           name:'QA Engineer',         type:'system', description:'Inspection + NCR ownership', userCount:1,
   perms:{bd:'none',   estimation:'view',   planning:'view',   engineering:'view',   procurement:'view',   ops:'view',   qaqc:'approve',billing:'none',   finance:'none'}},
  {id:'R-BILLING',      name:'Billing Engineer',    type:'system', description:'RA bill prep + vendor bill verify', userCount:1,
   perms:{bd:'none',   estimation:'view',   planning:'view',   engineering:'view',   procurement:'view',   ops:'view',   qaqc:'view',   billing:'edit',   finance:'view'}},
  {id:'R-ACCOUNTS',     name:'Accountant',          type:'system', description:'Day-to-day accounts entries, Tally sync', userCount:1,
   perms:{bd:'none',   estimation:'none',   planning:'none',   engineering:'none',   procurement:'view',   ops:'none',   qaqc:'none',   billing:'view',   finance:'edit'}},
];
;
