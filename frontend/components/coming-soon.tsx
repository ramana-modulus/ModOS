import type { Icon } from "@tabler/icons-react";
import { IconTool } from "@tabler/icons-react";

interface ComingSoonProps {
  label: string;
  sublabel?: string;
  icon?: Icon;
}

/** Placeholder surface for modules not yet ported from the prototype. */
export function ComingSoon({ label, sublabel, icon: IconCmp = IconTool }: ComingSoonProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-sm rounded-lg border-[0.5px] border-line bg-surface px-8 py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <IconCmp size={24} aria-hidden />
        </div>
        <h2 className="text-t14 font-semibold text-ink">{label}</h2>
        <p className="mt-1.5 text-t11 leading-relaxed text-muted">
          {sublabel ?? "This module is being ported from the prototype. Check back soon."}
        </p>
      </div>
    </div>
  );
}
