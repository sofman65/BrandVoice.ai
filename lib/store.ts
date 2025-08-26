"use client"
import { isValidInstagramUrl, isValidYouTubeUrl } from "@/lib/utils"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type Platform = "youtube" | "instagram"

export type MissionCarouselSlide = {
  slide: number
  text: string
  imagePrompt: string
}

export type MissionOutputs = {
  linkedin: string
  carousel: MissionCarouselSlide[]
  threads: string
  videoScript: string
}

export type Mission = {
  id: string
  title: string
  platform: Platform
  sourceUrl: string
  createdAt: string // ISO
  pinned?: boolean
  outputs: MissionOutputs
}

type MissionState = {
  missions: Mission[]
  selectedId?: string
  sidebarCollapsed: boolean
  filter: string
  selectMission: (id: string) => void
  renameMission: (id: string, title: string) => void
  deleteMission: (id: string) => void
  togglePin: (id: string) => void
  createMissionFromUrl: (url: string) => Mission
  setFilter: (q: string) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

function generateId(): string {
  try {
    // @ts-expect-error crypto may be unavailable in some runtimes
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      // @ts-expect-error browser crypto
      return crypto.randomUUID()
    }
  } catch {
    // ignore
  }
  return Math.random().toString(36).slice(2)
}

function platformFromUrl(url: string): Platform {
  if (isValidYouTubeUrl(url) || url.includes("youtu")) return "youtube"
  if (isValidInstagramUrl(url) || url.includes("instagram")) return "instagram"
  return url.includes("youtu") ? "youtube" : "instagram"
}

function stubOutputs(title: string, platform: Platform): MissionOutputs {
  const base = title || (platform === "youtube" ? "YouTube Mission" : "Instagram Mission")
  return {
    linkedin: `🚀 ${base}\n\nHere are the key insights and takeaways tailored for LinkedIn readers. Add your POV and invite discussion. #BrandVoiceAI`,
    carousel: Array.from({ length: 5 }, (_, i) => ({
      slide: i + 1,
      text: `${base} – Slide ${i + 1}: concise, value-focused point for Instagram carousel.`,
      imagePrompt: `Futuristic space-tech visualization for slide ${i + 1} with purple neon glow`,
    })),
    threads: `${base} — quick takeaway in <= 500 chars. Keep it conversational and actionable. #BrandVoiceAI`,
    videoScript: `00:00 Intro — Hook with the core promise\n00:10 Point 1 — Practical value for the audience\n00:25 Point 2 — Supporting example\n00:40 CTA — Invite comments and follows`,
  }
}

function seedMissions(): Mission[] {
  const now = new Date()
  const iso = (d: Date) => d.toISOString()
  const s = (title: string, platform: Platform, url: string, date: Date, pinned?: boolean): Mission => ({
    id: generateId(),
    title,
    platform,
    sourceUrl: url,
    createdAt: iso(date),
    pinned,
    outputs: stubOutputs(title, platform),
  })
  return [
    s("16 Cool GitHub Repos", "youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", new Date(now.getTime() - 3600_000 * 6), true),
    s("Creator Mindset Tips", "instagram", "https://www.instagram.com/p/ABC123/", new Date(now.getTime() - 3600_000 * 12)),
    s("Batch Like a Pro", "youtube", "https://youtu.be/abcdefghijk", new Date(now.getTime() - 3600_000 * 24)),
    s("Hooks That Convert", "instagram", "https://www.instagram.com/reel/XYZ987/", new Date(now.getTime() - 3600_000 * 48)),
    s("Automation Playbook", "youtube", "https://www.youtube.com/watch?v=12345678901", new Date(now.getTime() - 3600_000 * 72)),
    s("Carousel Storytelling", "instagram", "https://www.instagram.com/p/QWE456/", new Date(now.getTime() - 3600_000 * 96)),
  ]
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: seedMissions(),
      selectedId: undefined,
      sidebarCollapsed: false,
      filter: "",
      selectMission: (id) => set({ selectedId: id }),
      renameMission: (id, title) =>
        set((state) => ({
          missions: state.missions.map((m) => (m.id === id ? { ...m, title } : m)),
        })),
      deleteMission: (id) =>
        set((state) => {
          const missions = state.missions.filter((m) => m.id !== id)
          const selectedId = state.selectedId === id ? missions[0]?.id : state.selectedId
          return { missions, selectedId }
        }),
      togglePin: (id) =>
        set((state) => ({
          missions: state.missions.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)),
        })),
      createMissionFromUrl: (url) => {
        const platform = platformFromUrl(url)
        const id = generateId()
        const title = platform === "youtube" ? "New YouTube Mission" : "New Instagram Mission"
        const mission: Mission = {
          id,
          title,
          platform,
          sourceUrl: url,
          createdAt: new Date().toISOString(),
          outputs: stubOutputs(title, platform),
        }
        set((state) => ({ missions: [mission, ...state.missions], selectedId: id }))
        return mission
      },
      setFilter: (q) => set({ filter: q }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "bv_mission_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        missions: state.missions,
        selectedId: state.selectedId,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)


