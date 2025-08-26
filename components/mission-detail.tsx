"use client"
import * as React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/copy-button"
import { cn, copyToClipboard, truncate } from "@/lib/utils"
import { useMissionStore, type Mission } from "@/lib/store"
import { ExternalLink, Pencil, Video, Instagram } from "lucide-react"

function useSelectedMission(): Mission | undefined {
  const { missions, selectedId } = useMissionStore()
  return useMemo(() => missions.find((m) => m.id === selectedId) ?? missions[0], [missions, selectedId])
}

export function MissionDetail() {
  const mission = useSelectedMission()
  const { renameMission, createMissionFromUrl, selectMission } = useMissionStore()
  const [editing, setEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(mission?.title ?? "")
  const [showRepurpose, setShowRepurpose] = useState(false)
  const [urlDraft, setUrlDraft] = useState("")

  if (!mission) {
    return (
      <div className="p-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center text-white/80">
            <div className="text-lg">No missions yet.</div>
            <div className="text-sm text-white/60">Paste a URL to create your first mission.</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onSaveTitle = () => {
    renameMission(mission.id, titleDraft.trim() || "Untitled Mission")
    setEditing(false)
  }

  const onRepurpose = () => {
    if (!urlDraft.trim()) return
    const newMission = createMissionFromUrl(urlDraft.trim())
    selectMission(newMission.id)
    setShowRepurpose(false)
    setUrlDraft("")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-white/70">
            {mission.platform === "youtube" ? <Video className="h-5 w-5" /> : <Instagram className="h-5 w-5" />}
          </div>
          {editing ? (
            <input
              className="bg-transparent text-white text-xl md:text-2xl font-semibold border-b border-white/20 focus-visible:outline-none"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={onSaveTitle}
              onKeyDown={(e) => e.key === "Enter" && onSaveTitle()}
              aria-label="Edit mission title"
              autoFocus
            />
          ) : (
            <div className="text-white text-xl md:text-2xl font-semibold flex items-center gap-2">
              {truncate(mission.title, 64)}
              <button
                className="p-1 rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                onClick={() => { setTitleDraft(mission.title); setEditing(true) }}
                aria-label="Rename mission"
              >
                <Pencil className="h-4 w-4 text-white/70" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            className="inline-flex items-center gap-1 text-sm text-purple-300 hover:text-purple-200"
            href={mission.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open Source <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href="/repurpose"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white hover:opacity-90"
          >
            Repurpose Again
          </a>
        </div>
      </div>


      {/* Tabs */}
      <Tabs defaultValue="linkedin">
        <TabsList className="bg-white/10 border border-white/10">
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>

        {/* LinkedIn */}
        <TabsContent value="linkedin">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">LinkedIn Post</div>
                <CopyButton text={mission.outputs.linkedin} />
              </div>
              <Textarea value={mission.outputs.linkedin} readOnly className="min-h-[200px] bg-white/5 border-white/10 text-white" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carousel */}
        <TabsContent value="carousel">
          <div className="space-y-3">
            {mission.outputs.carousel.map((s) => (
              <Card key={s.slide} className="bg-white/5 border-white/10">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-medium">Slide {s.slide}</div>
                    <div className="flex items-center gap-1">
                      <CopyButton text={s.text} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Textarea value={s.text} readOnly className="bg-white/5 border-white/10 text-white min-h-[120px]" />
                    <div className="space-y-2">
                      <div className="text-xs text-white/70">Image Prompt</div>
                      <Textarea value={s.imagePrompt} readOnly className="bg-white/5 border-white/10 text-white min-h-[120px]" />
                      <Button disabled className="w-fit bg-white/10 text-white/60">Generate Image</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Threads */}
        <TabsContent value="threads">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">Threads</div>
                <CopyButton text={mission.outputs.threads} />
              </div>
              <div className="text-right text-xs text-white/60">{mission.outputs.threads.length}/500</div>
              <Textarea value={mission.outputs.threads} readOnly className="min-h-[120px] bg-white/5 border-white/10 text-white" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video */}
        <TabsContent value="video">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">Video Script</div>
                <CopyButton text={mission.outputs.videoScript} />
              </div>
              <Textarea value={mission.outputs.videoScript} readOnly className="min-h-[220px] bg-white/5 border-white/10 text-white font-mono" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


