import type { ReactNode } from "react";

/** Dark category band used across procurement tables (`procCatBanner`). */
export function CatBanner({
  cat,
  count,
  noun,
  right,
}: {
  cat: string;
  count: number;
  noun: string;
  right?: ReactNode;
}) {
  return (
    <div className="mt-1.5 flex items-center justify-between bg-ink px-3.5 py-[7px] text-t10 font-bold uppercase tracking-[0.6px] text-white">
      <span>
        {cat}
        <span className="ml-1.5 text-t9 font-normal normal-case tracking-normal opacity-55">
          {count} {noun}
          {count === 1 ? "" : "s"}
        </span>
      </span>
      {right && (
        <span className="flex items-center gap-2.5 text-t9 font-medium normal-case tracking-[0.3px]">{right}</span>
      )}
    </div>
  );
}
