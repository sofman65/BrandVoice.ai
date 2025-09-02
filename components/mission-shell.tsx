"use client";

import * as React from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppTopbar } from "@/components/app-topbar";

type Props = {
  sidebar: React.ReactNode;
  detail: React.ReactNode;
};

export function MissionShell({ sidebar, detail }: Props) {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  // Initialize collapsed state from localStorage after hydration
  React.useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    setCollapsed(savedCollapsed);
  }, []);

  // keep sidebar width in a CSS var so grid is stable
  React.useEffect(() => {
    document.documentElement.style.setProperty("--sb-w", collapsed ? "5rem" : "18rem");
  }, [collapsed]);

  // listen for sidebar toggle (no polling, no storage listeners)
  React.useEffect(() => {
    const onToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail as { collapsed: boolean };
      if (typeof detail?.collapsed === "boolean") setCollapsed(detail.collapsed);
    };
    window.addEventListener("sidebarToggled", onToggle as EventListener);
    return () => window.removeEventListener("sidebarToggled", onToggle as EventListener);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Desktop: sidebar + canvas. Mobile: only canvas; sidebar appears via AppTopbar sheet. */}
      <div className="grid min-h-screen md:grid-cols-[var(--sb-w,_18rem)_1fr]">
        <aside className="hidden md:block w-[var(--sb-w,_18rem)]">{sidebar}</aside>

        <main
          aria-label="Main content"
          className="min-w-0 overflow-x-hidden scrollbar-gutter-stable"
        >
          {/* Mobile topbar (hamburger opens the same sidebar in a Sheet) */}
          <div className="md:hidden">
            <AppTopbar sidebar={sidebar} />
          </div>

          <ErrorBoundary>
            {/* Stable centered canvas; pages render their own backgrounds */}
            <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 py-6">
              {detail}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
