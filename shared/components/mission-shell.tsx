"use client";

import * as React from "react";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppTopbar } from "@/shared/components/app-topbar";
import { PageTransition } from "@/components/PageTransition";
import { usePathname } from "next/navigation";

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
    <div className="relative min-h-screen w-screen bg-[#0F0F11] text-white flex overflow-hidden">

      <aside className="hidden md:block h-full border-r border-white/10 bg-black/20 backdrop-blur-xl"
             style={{ width: "var(--sb-w, 18rem)" }}>
        {sidebar}
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
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
