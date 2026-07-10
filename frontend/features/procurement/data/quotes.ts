import type { ProcKey, Quote } from "@/types/procurement";

/**
 * `PROC_QUOTES` — vendor quotes per `"{proj}.{sub}.{bomCode}"`.
 * `selected: true` marks the L1 vendor chosen by procurement.
 */
export const PROC_QUOTES: Record<ProcKey, Quote[]> = {
  "P1.SP1.SS-M-101": [
    { id: "Q001", vCode: "MVDR052", vendor: "Aahir Engineers", rate: 88, qty: 38000, leadTime: 14, payTerms: "30 days credit", file: "Aahir_MSSteel_RFQ_29Apr.pdf", date: "29 Apr 2026", l: 1, selected: true, note: "L1 — established vendor, best rate" },
    { id: "Q002", vCode: "MVDR056", vendor: "Jay Ambe Constructions", rate: 92, qty: 38000, leadTime: 10, payTerms: "50% advance, balance on delivery", file: "JayAmbe_Quote_30Apr.pdf", date: "30 Apr 2026", l: 2, selected: false, note: "Faster lead time, +₹4/kg" },
    { id: "Q003", vCode: "MVDR054", vendor: "Cubicle India", rate: 95, qty: 38000, leadTime: 12, payTerms: "Against delivery", file: "Cubicle_Steel_01May.pdf", date: "01 May 2026", l: 3, selected: false, note: "" },
  ],
  "P1.SP1.SS-M-102": [
    { id: "Q004", vCode: "MVDR055b", name: "Inhouse Retails", vendor: "Inhouse Retails", rate: 11.5, qty: 300, leadTime: 5, file: "Inhouse_Bolts_30Apr.pdf", date: "30 Apr 2026", l: 1, selected: true, note: "Local supplier, fast turn" },
    { id: "Q005", vCode: "MVDR052", vendor: "Aahir Engineers", rate: 13, qty: 300, leadTime: 7, file: "Aahir_Hardware_30Apr.pdf", date: "30 Apr 2026", l: 2, selected: false, note: "" },
  ],
  "P1.SP1.SS-M-103": [
    { id: "Q006", vCode: "MVDR055b", vendor: "Inhouse Retails", rate: 17, qty: 120, leadTime: 5, file: "Inhouse_M20Bolts_30Apr.pdf", date: "30 Apr 2026", l: 1, selected: true, note: "" },
    { id: "Q007", vCode: "MVDR052", vendor: "Aahir Engineers", rate: 19, qty: 120, leadTime: 7, file: "Aahir_M20_30Apr.pdf", date: "30 Apr 2026", l: 2, selected: false, note: "" },
  ],
  "P1.SP1.SS-M-109": [
    { id: "Q008", vCode: "MVDR058", vendor: "Industrial Welders Pvt Ltd", rate: 275, qty: 65, leadTime: 7, file: "IndWelders_E7018_03May.pdf", date: "03 May 2026", l: 1, selected: true, note: "New vendor onboarded for this item" },
    { id: "Q009", vCode: "MVDR052", vendor: "Aahir Engineers", rate: 295, qty: 65, leadTime: 10, file: "Aahir_Electrodes_03May.pdf", date: "03 May 2026", l: 2, selected: false, note: "" },
  ],
  "P1.SP1.SS-M-105": [
    { id: "Q010", vCode: "MVDR057", vendor: "Asian Paints Industrial", rate: 215, qty: 100, leadTime: 5, file: "AsianPaints_Primer_02May.pdf", date: "02 May 2026", l: 1, selected: true, note: "" },
    { id: "Q011", vCode: "MVDR052", vendor: "Aahir Engineers", rate: 225, qty: 100, leadTime: 8, file: "Aahir_Primer_02May.pdf", date: "02 May 2026", l: 2, selected: false, note: "" },
  ],
  "P1.SP1.SS-M-106": [
    { id: "Q012", vCode: "MVDR052", vendor: "Aahir Engineers", rate: 92, qty: 380, leadTime: 14, file: "Aahir_MSPlate_05May.pdf", date: "05 May 2026", l: 1, selected: true, note: "L1 — awarded, PO raised" },
    { id: "Q012b", vCode: "MVDR056", vendor: "Jay Ambe Constructions", rate: 96, qty: 380, leadTime: 10, file: "JayAmbe_MSPlate_05May.pdf", date: "05 May 2026", l: 2, selected: false, note: "+₹4/kg, faster lead" },
  ],
  "P1.SP1.SS-M-107": [
    { id: "Q012c", vCode: "MVDR052", vendor: "Aahir Engineers", rate: 115, qty: 25, leadTime: 12, file: "Aahir_HDGSections_05May.pdf", date: "05 May 2026", l: 1, selected: true, note: "L1 — HDG sections, awarded" },
    { id: "Q012d", vCode: "MVDR054", vendor: "Cubicle India", rate: 122, qty: 25, leadTime: 14, file: "Cubicle_HDG_05May.pdf", date: "05 May 2026", l: 2, selected: false, note: "+₹7/kg" },
  ],
  "P1.SP1.FN-M-401": [
    { id: "Q013", vCode: "MVDR053", vendor: "Aakruti Enterprises", rate: 1450, qty: 2.1, leadTime: 14, file: "Aakruti_WBCShutter_06May.pdf", date: "06 May 2026", l: 1, selected: false, note: "RC-2026-002 covers this — direct PO possible" },
  ],
};
