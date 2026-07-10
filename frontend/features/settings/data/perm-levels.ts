import type { SetPermLevel } from "@/features/settings/types";

export const SET_PERM_LEVELS: SetPermLevel[] = [
  {id:'none',    label:'No Access',   color:'#9B9894', bg:'#F5F4F2'},
  {id:'view',    label:'View',        color:'#185FA5', bg:'#E6F1FB'},
  {id:'edit',    label:'View + Edit', color:'#854F0B', bg:'#FAEEDA'},
  {id:'approve', label:'Edit + Approve', color:'#3B6D11', bg:'#EAF3DE'},
];
