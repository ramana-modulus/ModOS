import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The prototype's micro type scale is exposed as custom `text-t*` utilities
 * (see the `@theme` block in app/globals.css). tailwind-merge has no way to
 * know these are font-sizes, so out of the box it lumps e.g. `text-t12` in with
 * text-*color* classes and, when a class like `text-accent` / `text-muted`
 * appears in the same `cn()` call, silently drops the size — leaving the
 * element at the inherited 16px. Registering the scale in the `font-size` group
 * keeps size and color in separate buckets so both survive the merge.
 */
const TEXT_SIZES = [
  "t8", "t85", "t9", "t10", "t105", "t11", "t12", "t13", "t14", "t15", "t16", "t18", "t20",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: TEXT_SIZES }],
    },
  },
});

/**
 * Merge conditional class names, resolving Tailwind conflicts.
 * `cn("px-2", cond && "px-4")` → "px-4".
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
