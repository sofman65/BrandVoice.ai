"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { brandVoiceClerkAppearance } from "@/shared/components/clerk-appearance";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Plus, Search, Pin, Pencil, Trash2,
  Sparkles, Bookmark,
} from "lucide-react";
import { cn, formatDate, truncate } from "@/lib/utils";
import type { MissionListItem } from "@/lib/types";
import { PlatformIcon } from "@/lib/platform";
import { Logo } from "@/components/brand/logo"; 

const LIB_ROUTE = "/library";

type Props = { className?: string };

export function MissionSidebar({ className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Initialize collapsed state from localStorage after hydration
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    setCollapsed(savedCollapsed);
  }, []);

  // expose width to layout
  useEffect(() => {
    document.documentElement.style.setProperty("--sb-w", collapsed ? "5rem" : "18rem");
  }, [collapsed]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
    window.dispatchEvent(new CustomEvent("sidebarToggled", { detail: { collapsed: next } }));
  };

  const [isLoading, setIsLoading] = useState(false);
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);

  // Initialize currentMissionId from localStorage after hydration
  useEffect(() => {
    const savedMissionId = localStorage.getItem("currentMissionId");
    setCurrentMissionId(savedMissionId);
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      setCurrentMissionId(null);
      localStorage.removeItem("currentMissionId");
    }
  }, [pathname]);

  // Missions
  const [missions, setMissions] = useState<MissionListItem[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // sync by route
  useEffect(() => {
    if (pathname.startsWith("/mission/") && params?.id) {
      setSelectedId(params.id as string);
      setCurrentMissionId(null);
      localStorage.removeItem("currentMissionId");
    } else if (pathname === "/") {
      setSelectedId(null);
    }
  }, [pathname, params?.id]);

  const loadMissions = async () => {
    try {
      const res = await fetch("/api/missions", { cache: "no-store", credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.data)) {
        const items: MissionListItem[] = json.data.map((m: any) => ({
          id: m.id,
          title: m.title,
          platform: m.platform,
          sourceUrl: m.sourceUrl,
          description: m.description,
          pinned: Boolean(m.pinned),
          createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
        }));
        setMissions(items);
      }
    } catch (e) {
      console.error("Failed to load missions", e);
    }
  };

  useEffect(() => {
    loadMissions();
    const onUpdated = () => loadMissions();
    const onCompleted = () => {
      setCurrentMissionId(null);
      localStorage.removeItem("currentMissionId");
    };
    window.addEventListener("missionUpdated", onUpdated as EventListener);
    window.addEventListener("missionCompleted", onCompleted as EventListener);
    return () => {
      window.removeEventListener("missionUpdated", onUpdated as EventListener);
      window.removeEventListener("missionCompleted", onCompleted as EventListener);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = [...missions].sort((a, b) => {
      const pin = Number(b.pinned) - Number(a.pinned);
      if (pin !== 0) return pin;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
    if (!q) return list;
    return list.filter((m) => m.title?.toLowerCase().includes(q));
  }, [missions, filter]);

  const startRename = (m: MissionListItem) => {
    setRenameId(m.id);
    setRenameValue(m.title || "");
  };
  const commitRename = async () => {
    if (!renameId) return;
    try {
      const res = await fetch(`/api/missions/${renameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() || "Untitled Mission" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMissions((prev) => prev.map((x) => (x.id === renameId ? { ...x, title: updated.data.title } : x)));
        toast.success("Mission renamed");
      } else toast.error("Rename failed");
    } catch {
      toast.error("Rename failed");
    }
    setRenameId(null);
  };

  const onCreate = async () => {
    setIsLoading(true);
    try {
      setCurrentMissionId(null);
      localStorage.removeItem("currentMissionId");
      router.push("/?reset=true");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "sticky top-0 h-screen w-[var(--sb-w,_18rem)] border-r border-white/10 bg-white/5 backdrop-blur",
        "flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
        <button
          className="rounded-md p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        {!collapsed && <Logo size="sm" />}
      </div>

      {/* Nav (expanded) */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                pathname === "/" ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Repurpose
            </button>
            <button
              onClick={() => router.push(LIB_ROUTE)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                pathname === LIB_ROUTE ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Bookmark className="h-4 w-4" />
              Content Bank
            </button>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <Button
              onClick={onCreate}
              disabled={isLoading || (!!currentMissionId && pathname === "/")}
              className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isLoading ? "Creating..." : "New Mission"}
            </Button>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search missions"
                className="bg-white/5 pl-8 text-white placeholder:text-white/50"
                aria-label="Search missions"
              />
            </div>
          </div>
        </div>
      )}

      {/* Nav (collapsed) */}
      {collapsed && (
        <div className="px-2 py-2">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/")}
              className={cn(
                "w-full rounded-lg p-2 transition-colors",
                pathname === "/" ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
              title="Repurpose"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push(LIB_ROUTE)}
              className={cn(
                "w-full rounded-lg p-2 transition-colors",
                pathname === LIB_ROUTE ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
              title="Content Bank"
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overscroll-contain overflow-y-auto px-2">
        <ul className="space-y-1 py-2">
          {useMemo(
            () =>
              filtered.map((m) => (
                <li key={m.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedId(m.id);
                      router.push(`/mission/${m.id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedId(m.id);
                        router.push(`/mission/${m.id}`);
                      }
                    }}
                    className={cn(
                      "group w-full cursor-pointer rounded-lg px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                      m.id === selectedId ? "bg-white/10" : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={m.platform} className="h-4 w-4 text-purple-300" />
                      {!collapsed && (
                        <div className="min-w-0 flex-1">
                          {renameId === m.id ? (
                            <input
                              className="w-full bg-transparent text-white outline-none ring-0"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={commitRename}
                              onKeyDown={(e) => e.key === "Enter" && commitRename()}
                              aria-label="Rename mission"
                              autoFocus
                            />
                          ) : (
                            <div className="truncate text-sm text-white">{truncate(m.title, 36)}</div>
                          )}
                          {m.description && (
                            <div className="truncate text-xs text-white/50">{truncate(m.description, 50)}</div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span>{formatDate(m.createdAt)}</span>
                          </div>
                        </div>
                      )}
                      {!collapsed && (
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            className="rounded p-1 hover:bg-white/10"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await fetch(`/api/missions/${m.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ pinned: !m.pinned }),
                                });
                                if (res.ok) {
                                  const updated = await res.json();
                                  setMissions((prev) =>
                                    prev.map((x) => (x.id === m.id ? { ...x, pinned: updated.data.pinned } : x))
                                  );
                                  toast.success(m.pinned ? "Unpinned" : "Pinned");
                                } else toast.error("Failed to update");
                              } catch {
                                toast.error("Failed to update");
                              }
                            }}
                            aria-label="Pin mission"
                          >
                            <Pin className={cn("h-4 w-4", m.pinned ? "text-yellow-400" : "")} />
                          </button>
                          <button
                            className="rounded p-1 hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameId(m.id);
                              setRenameValue(m.title || "");
                            }}
                            aria-label="Rename mission"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded p-1 hover:bg-white/10"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!confirm("Delete mission?")) return;
                              try {
                                const res = await fetch(`/api/missions/${m.id}`, { method: "DELETE" });
                                if (res.ok) {
                                  setMissions((prev) => prev.filter((x) => x.id !== m.id));
                                  toast.success("Deleted");
                                  if (m.id === selectedId) router.push("/");
                                  if (currentMissionId === m.id) {
                                    setCurrentMissionId(null);
                                    localStorage.removeItem("currentMissionId");
                                  }
                                } else toast.error("Delete failed");
                              } catch {
                                toast.error("Delete failed");
                              }
                            }}
                            aria-label="Delete mission"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [filtered, collapsed, renameId, renameValue, selectedId, currentMissionId]
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          <SignedIn>
            <UserButton appearance={brandVoiceClerkAppearance} />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="w-full bg-white/10 text-white">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </aside>
  );
}
