"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { brandVoiceClerkAppearance, brandVoiceUserButtonAppearance } from "@/shared/components/clerk-appearance";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Pin,
  Pencil,
  Trash2,
  Sparkles,
  Bookmark,
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
  const { user } = useUser();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed") === "true";
    setCollapsed(saved);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sb-w",
      collapsed ? "5rem" : "18rem"
    );
  }, [collapsed]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
    window.dispatchEvent(
      new CustomEvent("sidebarToggled", { detail: { collapsed: next } })
    );
  };

  // ===== Missions =====
  const [missions, setMissions] = useState<MissionListItem[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // load
  useEffect(() => {
    loadMissions();
    const onUpdated = () => loadMissions();
    window.addEventListener("missionUpdated", onUpdated as EventListener);
    return () =>
      window.removeEventListener("missionUpdated", onUpdated as EventListener);
  }, []);

  const loadMissions = async () => {
    try {
      const res = await fetch("/api/missions", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;

      const json = await res.json();
      const items = json.data?.map((m: any) => ({
        id: m.id,
        title: m.title,
        platform: m.platform,
        sourceUrl: m.sourceUrl,
        description: m.description,
        pinned: !!m.pinned,
        createdAt:
          typeof m.createdAt === "string"
            ? m.createdAt
            : new Date(m.createdAt).toISOString(),
      }));

      setMissions(items || []);
    } catch (err) {
      console.error(err);
    }
  };

  // sync route → selection
  useEffect(() => {
    if (pathname.startsWith("/mission/") && params?.id) {
      setSelectedId(params.id as string);
    } else if (pathname === "/") {
      setSelectedId(null);
    }
  }, [pathname, params?.id]);

  // filter missions
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    let list = [...missions].sort((a, b) => {
      const p = Number(b.pinned) - Number(a.pinned);
      if (p !== 0) return p;
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
        body: JSON.stringify({
          title: renameValue.trim() || "Untitled Mission",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setMissions((prev) =>
          prev.map((x) =>
            x.id === renameId ? { ...x, title: updated.data.title } : x
          )
        );
        toast.success("Renamed");
      } else toast.error("Rename failed");
    } catch {
      toast.error("Rename failed");
    }
    setRenameId(null);
  };

  const createMission = async () => {
    router.push("/?reset=true");
  };

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        // === NEW VISUAL STYLE ===
        "sticky top-0 h-screen w-[var(--sb-w,_18rem)] border-r border-white/10",
        "bg-black/20 backdrop-blur-md",
        "flex flex-col select-none shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      {/* HEADER */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
        <button
          onClick={toggle}
          className="rounded-md p-2 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-white/70" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white/70" />
          )}
        </button>

        {!collapsed && <Logo size="sm" />}
      </div>

      {/* NAV (full) */}
      {!collapsed && (
        <div className="px-3 py-3 space-y-3">
          <button
            onClick={() => router.push("/")}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm",
              pathname === "/"
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5"
            )}
          >
            <Sparkles className="h-4 w-4 text-white/70" />
            Repurpose
          </button>

          <button
            onClick={() => router.push(LIB_ROUTE)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm",
              pathname === LIB_ROUTE
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5"
            )}
          >
            <Bookmark className="h-4 w-4 text-white/70" />
            Content Bank
          </button>

          <Button
            onClick={createMission}
            className="w-full bg-white/10 text-white hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
            New Mission
          </Button>

          {/* SEARCH */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search…"
              className="bg-black/20 border-white/10 pl-8 text-white placeholder:text-white/40"
            />
          </div>
        </div>
      )}

      {/* NAV (collapsed) */}
      {collapsed && (
        <div className="px-2 py-3 space-y-2">
          <button
            onClick={() => router.push("/")}
            className={cn(
              "w-full rounded-md p-2",
              pathname === "/" ? "bg-white/10" : "hover:bg-white/5"
            )}
            title="Repurpose"
          >
            <Sparkles className="h-4 w-4 text-white/70" />
          </button>
          <button
            onClick={() => router.push(LIB_ROUTE)}
            className={cn(
              "w-full rounded-md p-2",
              pathname === LIB_ROUTE ? "bg-white/10" : "hover:bg-white/5"
            )}
            title="Content Bank"
          >
            <Bookmark className="h-4 w-4 text-white/70" />
          </button>
        </div>
      )}

      {/* MISSION LIST */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-1">
          {filtered.map((m) => (
            <li key={m.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedId(m.id);
                  router.push(`/mission/${m.id}`);
                }}
                className={cn(
                  "group rounded-lg px-2 py-2 cursor-pointer",
                  m.id === selectedId ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <PlatformIcon
                    platform={m.platform}
                    className="h-4 w-4 text-white/60"
                  />

                  {!collapsed && (
                    <div className="min-w-0 flex-1 text-white">
                      {renameId === m.id ? (
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) =>
                            e.key === "Enter" && commitRename()
                          }
                          className="w-full bg-transparent text-white outline-none"
                          autoFocus
                        />
                      ) : (
                        <div className="truncate text-sm">
                          {truncate(m.title, 36)}
                        </div>
                      )}

                      {m.description && (
                        <div className="truncate text-xs text-white/40">
                          {truncate(m.description, 50)}
                        </div>
                      )}

                      <div className="text-xs text-white/40">
                        {formatDate(m.createdAt)}
                      </div>
                    </div>
                  )}

                  {/* ACTION ICONS */}
                  {!collapsed && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await fetch(`/api/missions/${m.id}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ pinned: !m.pinned }),
                          });

                          if (res.ok) {
                            setMissions((prev) =>
                              prev.map((x) =>
                                x.id === m.id
                                  ? { ...x, pinned: !m.pinned }
                                  : x
                              )
                            );
                          }
                        }}
                        className="rounded p-1 hover:bg-white/10"
                      >
                        <Pin
                          className={cn(
                            "h-4 w-4",
                            m.pinned ? "text-amber-300" : "text-white/60"
                          )}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(m);
                        }}
                        className="rounded p-1 hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4 text-white/60" />
                      </button>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Delete this mission?")) return;
                          const res = await fetch(`/api/missions/${m.id}`, {
                            method: "DELETE",
                          });
                          if (res.ok)
                            setMissions((prev) =>
                              prev.filter((x) => x.id !== m.id)
                            );
                        }}
                        className="rounded p-1 hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/10 px-3 py-3">
        <SignedIn>
          <div className="flex items-center gap-3">
            <UserButton appearance={brandVoiceUserButtonAppearance as any} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "Account"}
              </div>
              {user?.primaryEmailAddress?.emailAddress && (
                <div className="text-xs text-white/60 truncate">
                  {user.primaryEmailAddress.emailAddress}
                </div>
              )}
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton>
            <Button className="w-full bg-white/10 text-white hover:bg-white/20">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </aside>
  );
}
