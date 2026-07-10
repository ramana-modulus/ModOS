"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const activeKey = pathname.split("/").filter(Boolean)[0] ?? "projects";

  return (
    <aside className="flex w-sidebar flex-shrink-0 flex-col border-r-[0.5px] border-line bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b-[0.5px] border-line px-[13px] py-[11px]">
        <div className="flex h-[27px] w-[27px] items-center justify-center rounded-[5px] bg-accent text-t12 font-semibold text-white">
          M
        </div>
        <div>
          <div className="text-t13 font-semibold text-ink">MOD OS</div>
          <div className="text-t9 uppercase tracking-[1px] text-faint">Modulus Housing</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1.5" aria-label="Primary">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-[13px] pb-[3px] pt-2 text-t9 uppercase tracking-[1.2px] text-faint">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = item.key === activeKey;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-2 px-[13px] py-1.5 text-t12 transition-colors",
                    active
                      ? "bg-accent-soft font-medium text-accent"
                      : "text-muted hover:bg-accent/[0.06] hover:text-ink"
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute bottom-0.5 left-0 top-0.5 w-[2.5px] rounded-r-[2px] bg-accent"
                    />
                  )}
                  <Icon size={14} className="w-4 flex-shrink-0 text-center" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-2 border-t-[0.5px] border-line px-[13px] py-2.5">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-info-soft text-t10 font-medium text-info">
          SR
        </div>
        <div>
          <div className="text-t11 font-medium text-ink">Shreeram R</div>
          <div className="text-t9 text-faint">Admin</div>
        </div>
      </div>
    </aside>
  );
}
