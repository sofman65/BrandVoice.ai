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
  Loader2, Sparkles, Rocket, Zap, Globe, Video, Check, Bookmark, X,
} from "lucide-react"
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
    <div className="relative overflow-hidden">
      <MultiStepLoader loadingStates={loadingStates} loading={mutation.isPending} duration={1200} />


      {/* canvas */}
      <div className="relative z-10 py-8 px-4 md:px-6">
        {/* header row */}
        <div className="mb-6 mr-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-sm text-purple-300 hover:text-purple-200">
              Back to Mission Log
            </Link>
          </div>
        </div>

        {/* STABLE CENTERED WIDTH (independent of sidebar) */}
        <div className="mx-auto w-full max-w-[1100px] space-y-12 transition-all duration-300">
          {/* hero */}
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-300">
              <Sparkles className="h-4 w-4" />
              Powered by Spaceslam Technology
            </div>
            <h2 className="text-5xl font-bold leading-tight text-white md:text-6xl">
              Transform Your
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Social Content
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-300">
              Launch your content into the stratosphere with BrandVoice.ai. Convert any Instagram post
              or YouTube video into multi-platform content that reaches every corner of the digital universe.
            </p>
          </div>

          {/* reference content */}
          <Card className="mb-6 border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-300" />
                  <CardTitle className="text-lg font-bold text-white">Reference Content (Optional)</CardTitle>
                </div>
                {referenceContent && (
                  <Button variant="ghost" size="sm" onClick={clearReference} className="text-gray-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription className="text-gray-300">
                Choose content from your library to use as inspiration for your new repurpose
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {referenceContent ? (
                <div className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{getPlatformIcon(referenceContent.platform)}</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="mb-1 line-clamp-1 font-semibold text-white">{referenceContent.title}</h4>
                      <p className="mb-2 line-clamp-2 text-sm text-gray-300">{referenceContent.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {referenceContent.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-4 text-gray-400">No reference content selected</div>
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

          {/* mission control */}
          <Card className="border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="pb-8 text-center">
              <CardTitle className="mb-2 text-2xl font-bold text-white">Mission Control Center</CardTitle>
              <CardDescription className="text-lg text-gray-300">
                {referenceContent
                  ? `Enter Instagram or YouTube URL to repurpose with "${referenceContent.title}" as inspiration`
                  : "Enter Instagram or YouTube URL to begin content transformation"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="mission-url" className="text-lg font-medium text-white">
                    URL
                  </Label>
                  <div className="flex gap-4">
                    <Input
                      id="mission-url"
                      type="url"
                      placeholder="https://www.instagram.com/p/... or https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="h-14 flex-1 border-white/20 bg-white/10 text-lg text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                      disabled={mutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={mutation.isPending || !previewData || !!missionData}
                      className="h-14 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r from-purple-600 to-pink-700 hover:shadow-purple-500/25"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Repurposing...
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
                </div>
              </form>

              {showPreview && (
                <div className="rounded-lg bg-white/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xl font-bold text-white">
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

              {(mutation.data || missionData) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
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

          {/* features */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Globe,
                title: "LinkedIn Posts",
                desc: "Professional networking content optimized for business audiences",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Sparkles,
                title: "Instagram Carousels",
                desc: "Multi-slide storytelling that captivates and engages",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: Zap,
                title: "Threads Posts",
                desc: "Conversational content that sparks meaningful discussions",
                color: "from-purple-500 to-indigo-500",
              },
              {
                icon: Video,
                title: "Video Scripts",
                desc: "Ready-to-film scripts for Reels and TikTok content",
                color: "from-green-500 to-emerald-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group w-full border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
              >
                <CardContent className="space-y-4 p-6 text-center">
                  <div className={`mx-auto h-12 w-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{feature.title}</h4>
                  <p className="text-sm leading-relaxed text-gray-300">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
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
  )
}
