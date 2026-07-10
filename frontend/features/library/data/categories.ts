import type { LibCategory } from "@/features/library/types";

export const LIB_CATEGORIES: LibCategory[] = [
  {id:'FW',label:'Foundation Works',discipline:'Civil/Structure'},
  {id:'SS',label:'Superstructure',discipline:'Civil/Structure'},
  {id:'RO',label:'Roof Cladding',discipline:'Structure'},
  {id:'WC',label:'Wall Cladding',discipline:'Structure'},
  {id:'FN',label:'Fenestrations',discipline:'Structure'},
  {id:'FL',label:'Flooring',discipline:'Finishes'},
  {id:'FC',label:'False Ceiling',discipline:'Finishes'},
  {id:'FX',label:'MEP Fixtures',discipline:'MEP'},
  {id:'EL',label:'Electrical',discipline:'MEP'},
  {id:'HV',label:'HVAC & Ventilation',discipline:'MEP'},
  {id:'PL',label:'Plumbing & Sanitary',discipline:'MEP'},
  {id:'FI',label:'Fire Protection',discipline:'MEP'},
  {id:'EX',label:'External Development',discipline:'Civil'},
  {id:'FU',label:'Furniture, Fixtures & Equipment',discipline:'FF&E'},
];
