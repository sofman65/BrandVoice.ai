"use client";

import * as React from "react";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppTopbar } from "@/shared/components/app-topbar";
import { PageTransition } from "@/components/PageTransition";
import { usePathname } from "next/navigation";

const SIDEBAR_WIDTH = "var(--sb-w, 18rem)";

export function MissionShell({ sidebar, detail }: { sidebar: React.ReactNode; detail: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  React.useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed") === "true";
    setCollapsed(saved);
  }, []);

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--sb-w",
      collapsed ? "5rem" : "18rem"
    );
  }, [collapsed]);

  return (
    <div className="relative min-h-screen w-full bg-[#0F0F11] text-white overflow-hidden">
      {/* Fixed desktop sidebar so it stays visible on scroll */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 border-r border-white/10 bg-black/20 backdrop-blur-xl"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {sidebar}
      </aside>

      <main className="min-h-screen min-w-0 md:pl-[var(--sb-w,18rem)]">
        <div className="md:hidden">
          <AppTopbar sidebar={sidebar} />
        </div>

        <ErrorBoundary>
          <PageTransition keyRoute={pathname}>
            <div className="w-full h-full px-8 py-8">
              {detail}
            </div>
          </PageTransition>
        </ErrorBoundary>
      </main>
    </div>
  );
}
