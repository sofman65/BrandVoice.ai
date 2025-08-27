"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/error-boundary"

export function MissionShell({ sidebar, detail }: { sidebar: React.ReactNode; detail: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true'
    }
    return false
  })
  return (
    <div className={cn("min-h-screen w-full bg-gradient-to-b from-[#1d0b2e] via-[#2a0f46] to-[#0c0616]")}> 
      <div
        className={cn(
          "grid transition-[grid-template-columns]",
          sidebarCollapsed ? "grid-cols-[80px_1fr]" : "grid-cols-[280px_1fr]"
        )}
      >
        {sidebar}
        <main className="min-h-screen overflow-hidden"><ErrorBoundary>{detail}</ErrorBoundary></main>
      </div>
    </div>
  )
}


