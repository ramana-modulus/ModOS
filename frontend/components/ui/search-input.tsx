"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Compact search field with a clear button. */
export function SearchInput({ value, onChange, placeholder = "Search…", className }: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border-[0.5px] border-input bg-surface px-2 py-[5px]",
        className
      )}
    >
      <IconSearch size={13} className="text-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full min-w-0 bg-transparent text-t11 text-ink outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="text-faint hover:text-ink">
          <IconX size={13} />
        </button>
      )}
    </div>
  );
}
