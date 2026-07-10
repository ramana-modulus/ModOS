"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  active?: boolean;
  count?: number;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

/** Rounded filter chip with optional count (`.fchip` / `.fc`). */
export function FilterChip({ active = false, count, onClick, children, className }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[14px] border-[0.5px] px-[11px] py-[5px] text-t11 transition-colors",
        active
          ? "border-accent bg-accent font-medium text-white"
          : "border-[#e5e4e0] bg-[#f4f3f0] text-muted hover:bg-[#ecebe7]",
        className
      )}
    >
      {children}
      {count != null && (
        <span
          className={cn(
            "rounded-lg px-1.5 text-t9 font-semibold",
            active ? "bg-white/20 text-white" : "bg-black/[0.07]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** Filter chip row wrapper (`.fr`). */
export function FilterRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-2.5 flex flex-wrap items-center gap-1.5", className)}>{children}</div>;
}
