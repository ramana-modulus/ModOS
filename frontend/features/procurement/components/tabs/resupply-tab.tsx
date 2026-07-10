"use client";

import { IconRotateClockwise } from "@tabler/icons-react";

/** Resupply / RTV — materials rejected at incoming inspection. Empty in the seed. */
export function ResupplyTab() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-[0.5px] border-line bg-canvas px-8 py-12 text-center">
      <IconRotateClockwise size={22} className="mb-3 text-faint" aria-hidden />
      <div className="text-t11 font-medium text-ink">No open resupply requirements</div>
      <p className="mt-1 max-w-sm text-t10 text-muted">
        When Ops rejects material at incoming inspection (IMIR), the RTV resupply requirement appears
        here to coordinate a replacement PO with the vendor.
      </p>
    </div>
  );
}
