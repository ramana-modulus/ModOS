"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PanelProvider } from "./panel-provider";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { SlideOverPanel } from "./slide-over-panel";

/**
 * App shell: persistent sidebar + top bar + scrollable content + slide-over.
 * The sidebar is inline on md+ and an off-canvas drawer on mobile.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <PanelProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile off-canvas sidebar */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-ink/30"
              aria-hidden
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 shadow-xl">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex flex-1 flex-col overflow-auto px-3.5 py-3">{children}</main>
          <SlideOverPanel />
        </div>
      </div>
    </PanelProvider>
  );
}
