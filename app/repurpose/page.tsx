"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2, Sparkles, Rocket, Zap, Globe, Video, Check, Bookmark, X, ChevronDown,
} from "lucide-react"
import { VoicePicker } from "@/components/voice-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ContentSelectorModal } from "@/components/content-selector-modal"
import { isValidInstagramUrl, isValidYouTubeUrl } from "@/lib/utils"
import { InstagramPreview } from "@/components/instagram-preview"
import { YouTubePreview } from "@/components/youtube-preview"
import { ContentResults } from "@/components/content-results"
import type { GeneratedContent } from "@/lib/types"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"

interface ReferenceContent {
  id: string
  title: string
  description: string
  link: string
  platform: "youtube" | "instagram" | "tiktok"
  savedAt: string
  thumbnail?: string
  duration?: string
  views?: string
  tags: string[]
}

interface ProcessResponse {
  success: boolean
  data?: GeneratedContent
  error?: string
}

export default function RepurposePage() {
  const searchParams = useSearchParams()

  const [url, setUrl] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [sourceType, setSourceType] = useState<"instagram" | "youtube" | null>(null)
  const [missionData, setMissionData] = useState<GeneratedContent | null>(null)
  const [existingMissionId, setExistingMissionId] = useState<string | null>(null)
  const [referenceContent, setReferenceContent] = useState<ReferenceContent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<{ id: string; label: string; hint?: string } | null>(null)
  const [mode, setMode] = useState<"auto" | "speed" | "quality">("auto")

  const mutation = useMutation({
    mutationFn: async (contentUrl: string): Promise<GeneratedContent> => {
      const requestBody: any = { url: contentUrl }
      if (referenceContent) requestBody.referenceContent = referenceContent

      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      let data: ProcessResponse
      try {
        data = await response.json()
      } catch {
        throw new Error("Server returned an invalid response. Please try again.")
      }
      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to process content")
      }
      return data.data
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong. Please try again.")
    },
    onSuccess: async (data) => {
      try {
        const currentMissionId = localStorage.getItem("currentMissionId")
        if (currentMissionId) {
          const updateRes = await fetch(`/api/missions/${currentMissionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ outputs: data }),
          })
          if (updateRes.ok) {
            // Notify sidebar to refresh
            window.dispatchEvent(
              new CustomEvent("missionUpdated", {
                detail: { missionId: currentMissionId, outputs: data },
              })
            )
          }
        }
      } catch (err) {
        console.error("Error updating mission with outputs:", err)
      }

      toast.success("Content generated successfully!")
      localStorage.removeItem("currentMissionId")
      window.dispatchEvent(new CustomEvent("missionCompleted"))
    },
  })

  // Load reference content from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("referenceContent")
    if (saved) {
      try {
        setReferenceContent(JSON.parse(saved))
        toast.success("Reference content loaded from library!")
      } catch {
        localStorage.removeItem("referenceContent")
      }
    }
  }, [])

  // Reset state when reset parameter is present
  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      setUrl("")
      setShowPreview(false)
      setPreviewData(null)
      setSourceType(null)
      setReferenceContent(null)
      localStorage.removeItem("referenceContent")
      mutation.reset()
      window.history.replaceState({}, "", "/")
    }
  }, [searchParams, mutation])

  // Trigger mission completed event when data is available
  useEffect(() => {
    if (mutation.data) {
      localStorage.removeItem("currentMissionId")
      window.dispatchEvent(new CustomEvent("missionCompleted"))
    }
  }, [mutation.data])

  const loadingStates = [
    { text: "Validating URL" },
    { text: "Fetching source data" },
    { text: "Transcribing (if video)" },
    { text: "Generating copy" },
    { text: "Creating image prompts" },
  ]

  const handleUrlChange = async (value: string) => {
    setUrl(value)

    const isInstagram = isValidInstagramUrl(value)
    const isYouTube = isValidYouTubeUrl(value)

    if (value && (isInstagram || isYouTube)) {
      setSourceType(isInstagram ? "instagram" : "youtube")
      setShowPreview(true)
      setPreviewData(null)
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const payload = await res.json()
        if (!payload.success) throw new Error(payload.error || "Failed to fetch preview")
        setPreviewData(payload.data)

        // Check if this URL has existing mission
        const missionsRes = await fetch("/api/missions", { credentials: "include" })
        if (missionsRes.ok) {
          const missionsData = await missionsRes.json()
          const existingMission = missionsData.data?.find((m: any) => m.sourceUrl === value)
          if (existingMission && existingMission.outputs && Object.keys(existingMission.outputs).length > 0) {
            setMissionData(existingMission.outputs)
            setExistingMissionId(existingMission.id)
          } else {
            setMissionData(null)
            setExistingMissionId(null)
          }
        }
      } catch (err) {
        console.error("Preview error", err)
        setPreviewData(null)
      }
    } else {
      setSourceType(null)
      setShowPreview(false)
      setPreviewData(null)
      setMissionData(null)
      setExistingMissionId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!url) return toast.error("Please enter a URL")
    if (!isValidInstagramUrl(url) && !isValidYouTubeUrl(url)) {
      return toast.error("Please enter a valid Instagram or YouTube URL")
    }
    if (missionData) {
      toast.info("This URL has already been processed. Showing existing results.")
      return
    }

    // Prepare mission title/description from preview (YouTube)
    let missionTitle = `Mission: ${url.substring(0, 50)}...`
    let missionDescription = ""
    if (isValidYouTubeUrl(url)) {
      try {
        const previewRes = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        if (previewRes.ok) {
          const pd = await previewRes.json()
          if (pd.success && pd.data?.title) missionTitle = pd.data.title
          if (pd.success && pd.data?.description) {
            missionDescription = pd.data.description.substring(0, 200) + "..."
          }
        }
      } catch {}
    }

    // Create mission
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: missionTitle,
          platform: isValidInstagramUrl(url) ? "instagram" : "youtube",
          sourceUrl: url,
          description: missionDescription,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        if (result.data?.id) localStorage.setItem("currentMissionId", result.data.id)
      }
    } catch (err) {
      console.error("Error creating mission", err)
    }

    mutation.mutate(url)
  }

  const handleReset = () => {
    setUrl("")
    setSourceType(null)
    setShowPreview(false)
    setPreviewData(null)
    setReferenceContent(null)
    localStorage.removeItem("referenceContent")
    mutation.reset()
  }

  const clearReference = () => {
    setReferenceContent(null)
    localStorage.removeItem("referenceContent")
    toast.success("Reference content cleared")
  }

  const handleSelectReference = (content: ReferenceContent) => {
    setReferenceContent(content)
    localStorage.setItem("referenceContent", JSON.stringify(content))
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube":
        return <Video className="h-4 w-4 text-red-500" />
      case "instagram":
        return <Video className="h-4 w-4 text-pink-500" />
      case "tiktok":
        return <Video className="h-4 w-4 text-black" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  return (
    <div className="relative">
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={mutation.isPending}
        duration={1200}
      />
  
      {/* Canvas — MissionShell provides the dark gradient background */}
      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        {/* Top breadcrumb / link */}
        <div className="mb-10">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-purple-300 hover:text-purple-200"
            >
              Back to Mission Log
            </Link>

            {/* Controls placed next to sidebar (ChatGPT-style) */}
            <div className="ml-2 flex items-center gap-2">
              <VoicePicker
                value={selectedVoice}
                onChange={setSelectedVoice}
                options={[
                  { id: "default", label: "Default", hint: "Clear, friendly" },
                  { id: "direct",  label: "Direct",  hint: "Punchy, concise" },
                  { id: "warm",    label: "Warm",    hint: "Approachable" },
                  { id: "bold",    label: "Bold",    hint: "High-energy" },
                ]}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 gap-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    Repurpose Mode
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 border-white/10 bg-[#0b0b15] text-white"
                >
                  <DropdownMenuLabel className="text-xs text-white/70">
                    Select mode
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuRadioGroup
                    value={mode}
                    onValueChange={(v) => setMode(v as typeof mode)}
                  >
                    <DropdownMenuRadioItem value="auto">Auto (balanced)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="speed">Fast draft</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="quality">Polished</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
  
        {/* Stable centered width */}
        <div className="mx-auto w-full max-w-screen-lg space-y-10">
          {/* Hero */}
          <section className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1.5 text-xs sm:text-sm font-medium text-purple-300">
              <Sparkles className="h-4 w-4" />
              Powered by Spaceslam Technology
            </div>
  
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight [text-wrap:balance]">
              Transform Your
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Social Content
              </span>
            </h1>
  
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-300">
              Paste a YouTube or Instagram link and get platform-ready content in your brand voice.
            </p>
          </section>
  
          {/* Reference content */}
          <Card className="border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-300" />
                  <CardTitle className="text-white text-base sm:text-lg">
                    Reference Content (Optional)
                  </CardTitle>
                </div>
                {referenceContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearReference}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription className="text-gray-300">
                Pick items from your Content Bank to influence tone/structure.
              </CardDescription>
            </CardHeader>
  
            <CardContent className="pt-0">
              {referenceContent ? (
                <div className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">{getPlatformIcon(referenceContent.platform)}</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="mb-1 line-clamp-1 font-semibold text-white">
                        {referenceContent.title}
                      </h4>
                      <p className="mb-2 line-clamp-2 text-sm text-gray-300">
                        {referenceContent.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {referenceContent.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="mb-3 text-sm text-gray-400">
                    No reference content selected
                  </div>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Browse Content Library
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
  
          {/* Mission control */}
          <Card className="border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/10">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Mission Control Center
              </CardTitle>
              <CardDescription className="text-gray-300">
                {referenceContent
                  ? `Repurpose with “${referenceContent.title}” as inspiration`
                  : "Enter Instagram or YouTube URL to begin"}
              </CardDescription>
            </CardHeader>
  
            <CardContent className="space-y-6">
              {/* URL form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <Label htmlFor="mission-url" className="text-white text-sm sm:text-base">
                  URL
                </Label>
  
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="mission-url"
                    inputMode="url"
                    type="url"
                    placeholder="https://www.instagram.com/p/... or https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="h-12 flex-1 border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                    disabled={mutation.isPending}
                  />
  
                  <Button
                    type="submit"
                    disabled={mutation.isPending || !previewData || !!missionData}
                    className="h-12 sm:w-auto w-full bg-gradient-to-r from-purple-600 to-pink-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Repurposing…
                      </>
                    ) : missionData ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Already Processed
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Repurpose
                      </>
                    )}
                  </Button>
                </div>
              </form>
  
              {/* Preview */}
              {showPreview && (
                <div className="rounded-lg bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">
                      {sourceType === "instagram" ? "Instagram Preview" : "YouTube Preview"}
                    </h4>
                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                      {sourceType === "instagram" ? "Instagram Post" : "YouTube Video"}
                    </span>
                  </div>
  
                  {sourceType === "instagram" ? (
                    <InstagramPreview url={url} data={previewData} isLoading={!previewData} />
                  ) : (
                    <YouTubePreview url={url} data={previewData} isLoading={!previewData} />
                  )}
                </div>
              )}
  
              {/* Results */}
              {(mutation.data || missionData) && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Zap className="h-6 w-6 text-yellow-400" />
                      {missionData ? "Existing Results" : "Mission Complete"}
                    </h3>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      New Mission
                    </Button>
                  </div>
  
                  <ContentResults data={missionData || mutation.data!} />
                </div>
              )}
            </CardContent>
          </Card>
  
          {/* Features */}
          <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Globe, title: "LinkedIn Posts", desc: "Professional, long-form insights", color: "from-blue-500 to-cyan-500" },
              { icon: Sparkles, title: "Instagram Carousels", desc: "5 slides with story flow", color: "from-pink-500 to-rose-500" },
              { icon: Zap, title: "Threads Posts", desc: "Short conversational hooks", color: "from-purple-500 to-indigo-500" },
              { icon: Video, title: "Video Scripts", desc: "Ready to film in minutes", color: "from-green-500 to-emerald-500" },
            ].map((f, i) => (
              <Card
                key={i}
                className="group border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <CardContent className="p-5 sm:p-6 text-center space-y-3">
                  <div className={`mx-auto h-12 w-12 rounded-xl bg-gradient-to-r ${f.color} p-3 transition-transform group-hover:scale-110`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold">{f.title}</h4>
                  <p className="text-sm text-gray-300">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </div>
  
      {/* Mobile sticky CTA (helps conversion on small screens) */}
      <div className="md:hidden sticky bottom-3 inset-x-0 z-20 px-4">
        <div className="mx-auto max-w-screen-sm rounded-xl border border-white/10 bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/20 p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-300" />
            <p className="text-sm text-white/90 flex-1">Paste a link to start repurposing.</p>
            <Button
              onClick={() => {
                const el = document.getElementById("mission-url");
                el?.focus();
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="h-8 px-3 bg-gradient-to-r from-purple-600 to-pink-700"
            >
              Start
            </Button>
          </div>
        </div>
      </div>
  
      {/* Content Selector Modal */}
      <ContentSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectReference}
      />
    </div>
  );
}
