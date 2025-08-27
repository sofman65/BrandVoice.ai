"use client"
import * as React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatDate, truncate } from "@/lib/utils"
import { useEffect } from "react"
import type { MissionListItem } from "@/lib/types"
import { PlatformIcon } from "@/lib/platform"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Plus, Search, Pin, Pencil, Trash2, Link, Bookmark, Sparkles } from "lucide-react"
import { useRouter, usePathname, useParams } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { brandVoiceClerkAppearance } from "@/components/clerk-appearance"
import { ErrorBoundary } from "./error-boundary"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
// import { clearSelectedMission } from "@/lib/store"


export function MissionSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const [missions, setMissions] = useState<MissionListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentMissionId')
    }
    return null
  })

  // Debug: log current pathname and button state
  useEffect(() => {
    console.log("🔍 Current pathname:", pathname)
    console.log("🔘 Button should be disabled:", isLoading || currentMissionId, "isLoading:", isLoading, "currentMissionId:", currentMissionId)
  }, [pathname, isLoading, currentMissionId])

  // Reset currentMissionId when user navigates to main page
  useEffect(() => {
    if (pathname === "/") {
      setCurrentMissionId(null)
      localStorage.removeItem('currentMissionId')
    }
  }, [pathname])

  // Sync selected mission with current route
  useEffect(() => {
    if (pathname.startsWith("/mission/") && params.id) {
      setSelectedId(params.id as string)
      // When viewing a past mission, clear the current mission ID
      setCurrentMissionId(null)
      localStorage.removeItem('currentMissionId')
    } else if (pathname === "/") {
      setSelectedId(null)
    }
  }, [pathname, params.id])

  // Listen for localStorage changes and mission completion events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentMissionId') {
        setCurrentMissionId(e.newValue)
      }
    }

                    const handleMissionCompleted = () => {
                  console.log("📡 Received missionCompleted event, clearing currentMissionId")
                  setCurrentMissionId(null)
                }

                const handleMissionUpdated = (event: CustomEvent) => {
                  console.log("📡 Received missionUpdated event:", event.detail)
                  // Refresh the missions list to show the updated mission
                  loadMissions()
                }

                window.addEventListener('storage', handleStorageChange)
                window.addEventListener('missionCompleted', handleMissionCompleted)
                window.addEventListener('missionUpdated', handleMissionUpdated as EventListener)
    
                    return () => {
                  window.removeEventListener('storage', handleStorageChange)
                  window.removeEventListener('missionCompleted', handleMissionCompleted)
                  window.removeEventListener('missionUpdated', handleMissionUpdated as EventListener)
                }
  }, [])
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const list = [...missions].sort((a, b) => {
      // Sort by pinned first, then by creation date
      const pinnedDiff = Number(b.pinned) - Number(a.pinned)
      if (pinnedDiff !== 0) return pinnedDiff
      
      // Handle cases where createdAt might be undefined/null
      const aDate = a.createdAt || ""
      const bDate = b.createdAt || ""
      return bDate.localeCompare(aDate)
    })
    if (!q) return list
    return list.filter((m) => m.title?.toLowerCase().includes(q))
  }, [missions, filter])

  // Persist sidebar collapsed state via store (already persisted by zustand persist)
  const toggle = () => setSidebarCollapsed(!sidebarCollapsed)

  const startRename = (m: MissionListItem) => {
    setRenameId(m.id)
    setRenameValue(m.title)
  }
  const commitRename = async () => {
    if (!renameId) return
    
    try {
      const res = await fetch(`/api/missions/${renameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: renameValue.trim() || "Untitled Mission" })
      })
      
      if (res.ok) {
        const updatedMission = await res.json()
        setMissions(missions.map(m => m.id === renameId ? { ...m, title: updatedMission.data.title } : m))
        toast.success("Mission renamed successfully")
      } else {
        toast.error("Failed to rename mission")
      }
    } catch (err) {
      console.error("Error renaming mission:", err)
      toast.error("Failed to rename mission")
    }
    
    setRenameId(null)
  }

                const onCreate = async () => {
                setError(null)
                setIsLoading(true)
                try {
                  // Just redirect to the repurpose page - don't create a mission yet
                  setCurrentMissionId(null) // Clear any current mission
                  localStorage.removeItem('currentMissionId')
                  router.push('/?reset=true')
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'An unknown error occurred')
                } finally {
                  setIsLoading(false)
                }
              }

  // Load missions from API
  const loadMissions = async () => {
    try {
      console.log("🔍 Starting to fetch missions...")
      const res = await fetch("/api/missions", { 
        cache: "no-store",
        credentials: "include" // Include cookies for authentication
      })
      console.log("📡 Response status:", res.status, res.statusText)
      console.log("📡 Response headers:", Object.fromEntries(res.headers.entries()))
      
      if (!res.ok) {
        console.log("❌ Failed to fetch missions:", res.status, res.statusText)
        return
      }
      
      const json = await res.json()
      console.log("📦 Response JSON:", json)
      
      if (Array.isArray(json.data)) {
        // Normalize createdAt to ISO string
                  const items: MissionListItem[] = json.data.map((m: any) => ({
            id: m.id,
            title: m.title,
            platform: m.platform,
            sourceUrl: m.sourceUrl,
            description: m.description,
            pinned: Boolean(m.pinned),
            createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
          }))
        setMissions(items)
        console.log(`✅ Loaded ${items.length} missions:`, items)
      } else {
        console.log("⚠️ Response data is not an array:", json.data)
      }
    } catch (error) {
      console.error("❌ Error loading missions:", error)
    }
  }

  // Load missions from API on mount
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!cancelled) {
        await loadMissions()
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-white/10 bg-white/5 backdrop-blur",
        sidebarCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
        <button
          className="p-2 rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          onClick={toggle}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
        >
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        {!sidebarCollapsed && (
          <div className="text-sm font-semibold">Mission Log</div>
        )}
      </div>

      {/* Navigation */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2">
          
          <div className="space-y-1">
            <button
              onClick={() => router.push('/')}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors",
                pathname === "/" ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Repurpose
            </button>
            <button
              onClick={() => router.push('/library')}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors",
                pathname === "/content-bank" ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Bookmark className="h-4 w-4" />
              Content Bank
            </button>
          </div>
        </div>
      )}

      {/* Collapsed Navigation */}
      {sidebarCollapsed && (
        <div className="px-2 py-2">
          <div className="space-y-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => router.push('/')}
                    className={cn(
                      "w-full p-2 rounded-lg transition-colors",
                      pathname === "/" ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Repurpose</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => router.push('/content-bank')}
                    className={cn(
                      "w-full p-2 rounded-lg transition-colors",
                      pathname === "/content-bank" ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Content Bank</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Actions */}
      {!sidebarCollapsed && (
        <div className="p-3 flex flex-col gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onCreate} 
                  disabled={isLoading || (!!currentMissionId && pathname === "/")}
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" /> 
                  {isLoading ? "Creating..." : "New Mission"}
                </Button>
              </TooltipTrigger>
              {currentMissionId && pathname === "/" && (
                <TooltipContent>
                  <p>Complete your current mission first</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          

          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search missions"
              className="pl-8 bg-white/5 border-white/10"
              aria-label="Search missions"
            />
          </div>
        </div>
      )}

      {/* List - GET THE MISSIONS FROM THE API*/}
      <div className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1 py-2">
          {filtered.filter(m => m && m.id && m.title).map((m) => (
            <li key={m.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedId(m.id)
                  router.push(`/mission/${m.id}`)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedId(m.id)
                    router.push(`/mission/${m.id}`)
                  }
                }}
                className={cn(
                  "cursor-pointer",
                  "group w-full rounded-lg px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                  selectedId === m.id ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={m.platform} className="h-4 w-4 text-purple-300" />
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      {renameId === m.id ? (
                        <input
                          className="w-full bg-transparent border-b border-white/20 focus-visible:outline-none"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => e.key === "Enter" && commitRename()}
                          aria-label="Rename mission"
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm text-white truncate">{truncate(m.title, 36)}</div>
                      )}
                      {m.description && (
                        <div className="text-xs text-white/50 truncate">{truncate(m.description, 50)}</div>
                      )}
                      <div className="text-xs text-white/60 flex items-center gap-2">
                        <span>{formatDate(m.createdAt)}</span>
                      </div>
                    </div>
                  )}
                  {!sidebarCollapsed && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer">
                      <button
                        className="p-1 rounded hover:bg-white/10"
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          try {
                            const res = await fetch(`/api/missions/${m.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ pinned: !m.pinned })
                            })
                            
                            if (res.ok) {
                              const updatedMission = await res.json()
                              setMissions(missions.map(mission => mission.id === m.id ? { ...mission, pinned: updatedMission.data.pinned } : mission))
                              toast.success(m.pinned ? "Mission unpinned" : "Mission pinned")
                            } else {
                              toast.error("Failed to update mission")
                            }
                          } catch (err) {
                            console.error("Error updating mission:", err)
                            toast.error("Failed to update mission")
                          }
                        }}
                        aria-label="Pin mission"
                      >
                        <Pin className={cn("h-4 w-4", m.pinned ? "text-yellow-400" : "")} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-white/10"
                        onClick={(e) => { e.stopPropagation(); startRename(m) }}
                        aria-label="Rename mission"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-white/10"
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          if (confirm("Are you sure you want to delete this mission?")) {
                            try {
                              const res = await fetch(`/api/missions/${m.id}`, {
                                method: 'DELETE'
                              })
                              
                              if (res.ok) {
                                setMissions(missions.filter(mission => mission.id !== m.id))
                                toast.success("Mission deleted successfully")
                                
                                // If this was the selected mission, clear selection
                                if (selectedId === m.id) {
                                  setSelectedId(null)
                                  router.push('/')
                                }
                                
                                // If this was the current mission, clear it
                                if (currentMissionId === m.id) {
                                  setCurrentMissionId(null)
                                  localStorage.removeItem('currentMissionId')
                                }
                              } else {
                                toast.error("Failed to delete mission")
                              }
                            } catch (err) {
                              console.error("Error deleting mission:", err)
                              toast.error("Failed to delete mission")
                            }
                          }
                        }}
                        aria-label="Delete mission"
                      >
                        <Trash2 className="h-4 w-4 text-red-400 cursor-pointer" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <SignedIn>
            <UserButton appearance={brandVoiceClerkAppearance} />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white">Sign in</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </aside>
  )
}


