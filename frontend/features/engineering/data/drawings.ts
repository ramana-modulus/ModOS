/**
 * `ENG_DRAWING_LIST` — individual drawings per sub-project (drilldown from the
 * stage cells). Ported from `modos_v436.html`, with the v17 per-drawing state
 * seed (`seedDrawingStates`) baked directly into the data: the MEP prelim
 * rework pins (D011/D012) and the Architecture·Detailed mixed-state set
 * (D200–D204). Drawings without explicit `drwStatus` are migrated from their
 * legacy `status` field in the domain layer (`migrateDrawing`).
 */
import type { EngDrawingList } from "@/features/engineering/types";

export const ENG_DRAWING_LIST: EngDrawingList = {
  "P1.SP1": [
    // Structure — Preliminary (approved)
    { id: "D001", name: "SS-PCA-Frame-Layout-001", disc: "structure", stage: "preliminary", status: "approved", by: "Vigneshwaran", date: "25 Mar 2026", rev: "Rev 2", size: "1.2 MB", comments: [] },
    { id: "D002", name: "SS-PCA-Foundation-Scheme-001", disc: "structure", stage: "preliminary", status: "approved", by: "Vigneshwaran", date: "26 Mar 2026", rev: "Rev 2", size: "2.1 MB", comments: [] },
    { id: "D003", name: "SS-PCA-Column-Setout-001", disc: "structure", stage: "preliminary", status: "approved", by: "Vigneshwaran", date: "27 Mar 2026", rev: "Rev 1", size: "1.5 MB", comments: [] },
    { id: "D004", name: "SS-PCA-Roof-Truss-Concept", disc: "structure", stage: "preliminary", status: "approved", by: "Vigneshwaran", date: "28 Mar 2026", rev: "Rev 1", size: "1.8 MB", comments: [] },
    // Structure — GFC (in review)
    { id: "D005", name: "SS-PCA-Foundation-GFC", disc: "structure", stage: "gfc", status: "approved", by: "Vigneshwaran", date: "16 Apr 2026", rev: "Rev 1", size: "2.3 MB", comments: [
      { id: "c5_1", by: "Rohith R", role: "Engg. Head", text: "Approved with note: ensure anchor bolt M20 grade 8.8 per spec. Vetting pending.", x: 32, y: 48, date: "18 Apr 2026", resolved: true, rfi: null },
    ] },
    { id: "D006", name: "SS-PCA-Column-Schedule-GFC", disc: "structure", stage: "gfc", status: "approved", by: "Vigneshwaran", date: "17 Apr 2026", rev: "Rev 1", size: "1.1 MB", comments: [
      { id: "c6_1", by: "Vikram Shetty", role: "Ops Lead", text: "Column C-1 and C-7 base plates seem heavier than required. Please verify against site wind loads.", x: 18, y: 35, date: "19 Apr 2026", resolved: true, rfi: null },
      { id: "c6_2", by: "Rohith R", role: "Engg. Head", text: "Resolved — IIT proof check will validate base plate sizing.", x: 85, y: 35, date: "20 Apr 2026", resolved: true, rfi: null },
    ] },
    { id: "D007", name: "SS-PCA-Bolt-Schedule-GFC", disc: "structure", stage: "gfc", status: "in_review", by: "Vigneshwaran", date: "18 Apr 2026", rev: "Rev 1", size: "0.9 MB", comments: [
      { id: "c7_1", by: "Vikram Shetty", role: "Ops Lead", text: "Bolt grade for SS-1004 connections — please clarify M16 grade 8.8 vs grade 10.9. Site team needs this to proceed with procurement.", x: 42, y: 38, date: "21 May 2026", resolved: false, rfi: "RFI-002" },
      { id: "c7_2", by: "Tharun Kumar", role: "PM", text: "Anchor bolt spacing at grid intersection 4-A — verify against foundation drawing.", x: 71, y: 55, date: "22 May 2026", resolved: false, rfi: "RFI-003" },
    ] },
    // Architecture — Preliminary (approved)
    { id: "D008", name: "AR-PCA-Floor-Plan", disc: "architecture", stage: "preliminary", status: "approved", by: "Dushyanth K", date: "31 Mar 2026", rev: "Rev 2", size: "1.4 MB", comments: [] },
    { id: "D009", name: "AR-PCA-Elevations", disc: "architecture", stage: "preliminary", status: "approved", by: "Dushyanth K", date: "02 Apr 2026", rev: "Rev 1", size: "1.7 MB", comments: [] },
    // Architecture — GFC (in review)
    { id: "D010", name: "AR-PCA-Door-Window-GFC", disc: "architecture", stage: "gfc", status: "in_review", by: "Dushyanth K", date: "22 Apr 2026", rev: "Rev 1", size: "1.3 MB", comments: [
      { id: "c10_1", by: "Vikram Shetty", role: "Ops Lead", text: "Door swing direction at entry needs confirmation — outward swing creates issue with adjacent unit clearance. Please review.", x: 28, y: 62, date: "18 May 2026", resolved: false, rfi: "RFI-001" },
    ] },
    // MEP — Preliminary (seeded to rework with pins)
    { id: "D011", name: "MEP-PCA-Electrical-SLD", disc: "mep", stage: "preliminary", status: "rework", by: "Hariharan", date: "10 Apr 2026", rev: "Rev 1", size: "0.8 MB",
      drwStatus: "rework", drwVersion: "v1",
      drwVersionHistory: [{ v: "v1", submittedAt: "10 Apr 2026 · 11:00", submittedBy: "Hariharan", sentForApprovalAt: "10 Apr 2026 · 14:30", sentForApprovalBy: "Hariharan", batchId: "BATCH-SEED-DRW-001", reviewedAt: "12 Apr 2026 · 10:30", reviewedBy: "Rohith R", decision: "rejected", comments: "2 issues — see pins on drawing. Re-confirm DG sizing + circuit separation.", pinCount: 2 }],
      comments: [
        { id: "r_d011_1", by: "Rohith R", role: "Engg. Head", text: "DG sized at 62kVA but load calc on Sheet 2 shows 80kVA demand. Resize to 90kVA min (with 12% margin).", x: 38, y: 42, date: "12 Apr 2026", resolved: false, rfi: null },
        { id: "r_d011_2", by: "Rohith R", role: "Engg. Head", text: "Emergency lighting circuit not on a separate breaker — move to dedicated MCB. NBC requirement.", x: 67, y: 58, date: "12 Apr 2026", resolved: false, rfi: null },
      ] },
    { id: "D012", name: "MEP-PCA-Plumbing-Layout", disc: "mep", stage: "preliminary", status: "rework", by: "Hariharan", date: "12 Apr 2026", rev: "Rev 1", size: "0.9 MB",
      drwStatus: "rework", drwVersion: "v1",
      drwVersionHistory: [{ v: "v1", submittedAt: "10 Apr 2026 · 11:00", submittedBy: "Hariharan", sentForApprovalAt: "10 Apr 2026 · 14:30", sentForApprovalBy: "Hariharan", batchId: "BATCH-SEED-DRW-001", reviewedAt: "12 Apr 2026 · 10:30", reviewedBy: "Rohith R", decision: "rejected", comments: "1 issue — see pin on drawing.", pinCount: 1 }],
      comments: [
        { id: "r_d012_1", by: "Rohith R", role: "Engg. Head", text: "Plumbing not coordinated with electrical conduit — looks like clash at column C-3 area. Verify routing.", x: 45, y: 35, date: "12 Apr 2026", resolved: false, rfi: null },
      ] },
    // GFC (Good-For-Construction) — approved + released to Ops for execution
    { id: "D020", name: "SS-PCA-Frame-Layout-GFC", disc: "structure", stage: "gfc", status: "approved", by: "Vigneshwaran", apprBy: "Rohith R (Engg. Head)", date: "15 Apr 2026", rev: "Rev 3", size: "1.6 MB", comments: [] },
    { id: "D021", name: "SS-PCA-Roof-Truss-GFC", disc: "structure", stage: "gfc", status: "approved", by: "Vigneshwaran", apprBy: "Rohith R (Engg. Head)", date: "18 Apr 2026", rev: "Rev 2", size: "1.9 MB", comments: [] },
    { id: "D022", name: "AR-PCA-Floor-Plan-GFC", disc: "architecture", stage: "gfc", status: "approved", by: "Dushyanth K", apprBy: "Rohith R (Engg. Head)", date: "19 Apr 2026", rev: "Rev 3", size: "1.5 MB", comments: [] },
    { id: "D023", name: "MEP-PCA-Electrical-SLD-GFC", disc: "mep", stage: "gfc", status: "approved", by: "Hariharan", apprBy: "Rohith R (Engg. Head)", date: "24 Apr 2026", rev: "Rev 2", size: "1.0 MB", comments: [] },
    { id: "D024", name: "MEP-PCA-Plumbing-Layout-GFC", disc: "mep", stage: "gfc", status: "approved", by: "Hariharan", apprBy: "Rohith R (Engg. Head)", date: "25 Apr 2026", rev: "Rev 2", size: "1.1 MB", comments: [] },
    // Architecture — Detailed (v17 per-drawing seed: mixed states)
    { id: "D200", name: "DWG-ARCH-DET-01_FloorPlan", disc: "architecture", stage: "detailed", status: "approved", by: "Dushyanth K", date: "18 May 2026", rev: "Rev 1", size: "1.2 MB",
      drwStatus: "approved", drwVersion: "v1",
      drwVersionHistory: [{ v: "v1", submittedAt: "15 May 2026 · 10:00", submittedBy: "Dushyanth K", sentForApprovalAt: "15 May 2026 · 14:00", sentForApprovalBy: "Dushyanth K", batchId: "BATCH-SEED-DRW-OLD", reviewedAt: "18 May 2026 · 11:20", reviewedBy: "Rohith R", decision: "approved", comments: "Layout dimensions consistent with structural grid. Approved." }],
      comments: [] },
    { id: "D201", name: "DWG-ARCH-DET-02_DoorSchedule", disc: "architecture", stage: "detailed", status: "submitted", by: "Dushyanth K", date: "22 May 2026", rev: "Rev 1", size: "1.2 MB",
      drwStatus: "submitted", drwVersion: "v1",
      drwVersionHistory: [{ v: "v1", submittedAt: "22 May 2026 · 17:15", submittedBy: "Dushyanth K" }],
      comments: [] },
    { id: "D202", name: "DWG-ARCH-DET-03_WindowDetails", disc: "architecture", stage: "detailed", status: "submitted", by: "Dushyanth K", date: "22 May 2026", rev: "Rev 1", size: "1.2 MB",
      drwStatus: "submitted", drwVersion: "v1",
      drwVersionHistory: [{ v: "v1", submittedAt: "22 May 2026 · 17:18", submittedBy: "Dushyanth K" }],
      comments: [] },
    { id: "D203", name: "DWG-ARCH-DET-04_CabinLayout-Fab", disc: "architecture", stage: "detailed", status: "in_approval", by: "Dushyanth K", date: "20 May 2026", rev: "Rev 1", size: "1.2 MB",
      drwStatus: "in_approval", drwVersion: "v1",
      drwVersionHistory: [{ v: "v1", submittedAt: "20 May 2026 · 09:00", submittedBy: "Dushyanth K", sentForApprovalAt: "20 May 2026 · 16:30", sentForApprovalBy: "Dushyanth K", batchId: "BATCH-SEED-DRW-002" }],
      comments: [] },
    { id: "D204", name: "DWG-ARCH-DET-05_RoofPenetrations", disc: "architecture", stage: "detailed", status: "rework", by: "Dushyanth K", date: "24 May 2026", rev: "Rev 1", size: "1.2 MB",
      drwStatus: "rework", drwVersion: "v1",
      drwVersionHistory: [{ v: "v1", submittedAt: "19 May 2026 · 14:00", submittedBy: "Dushyanth K", sentForApprovalAt: "19 May 2026 · 15:30", sentForApprovalBy: "Dushyanth K", batchId: "BATCH-SEED-DRW-OLDER", reviewedAt: "21 May 2026 · 10:15", reviewedBy: "Rohith R", decision: "rejected", comments: "Penetration locations clash with truss centerlines — see pins. Verify against SS-GFC-Roof-Truss drawing.", pinCount: 2 }],
      comments: [
        { id: "r_d204_1", by: "Rohith R", role: "Engg. Head", text: "Penetration at grid B-3 hits truss top chord — relocate by 300mm or coordinate alternative routing.", x: 42, y: 38, date: "21 May 2026", resolved: false, rfi: null },
        { id: "r_d204_2", by: "Rohith R", role: "Engg. Head", text: "AC condensate drain penetration size — 50mm shown, but Plumbing layout calls for 75mm. Reconcile.", x: 71, y: 62, date: "21 May 2026", resolved: false, rfi: null },
      ] },
  ],
  "P1.SP2": [
    { id: "D101", name: "SS-PCB-Frame-Layout-001", disc: "structure", stage: "preliminary", status: "in_review", by: "Yogalakshmi", date: "13 Apr 2026", rev: "Rev 1", size: "1.2 MB", comments: [] },
    { id: "D102", name: "SS-PCB-Foundation-Scheme", disc: "structure", stage: "preliminary", status: "in_review", by: "Yogalakshmi", date: "14 Apr 2026", rev: "Rev 1", size: "2.0 MB", comments: [] },
    { id: "D103", name: "SS-PCB-Column-Setout", disc: "structure", stage: "preliminary", status: "in_review", by: "Yogalakshmi", date: "15 Apr 2026", rev: "Rev 1", size: "1.4 MB", comments: [] },
    { id: "D104", name: "AR-PCB-Floor-Plan", disc: "architecture", stage: "preliminary", status: "in_review", by: "Hariharan", date: "17 Apr 2026", rev: "Rev 1", size: "1.5 MB", comments: [] },
    { id: "D105", name: "AR-PCB-Elevations", disc: "architecture", stage: "preliminary", status: "in_review", by: "Hariharan", date: "18 Apr 2026", rev: "Rev 1", size: "1.6 MB", comments: [] },
  ],
};
