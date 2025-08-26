"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Rocket, Zap, Globe, Video, Check } from "lucide-react"
import { toast } from "sonner"
import { isValidInstagramUrl, isValidYouTubeUrl } from "@/lib/utils"
import { InstagramPreview } from "@/components/instagram-preview"
import { YouTubePreview } from "@/components/youtube-preview"
import { ContentResults } from "@/components/content-results"
import type { GeneratedContent } from "@/lib/types"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import Link from "next/link"

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



  const mutation = useMutation({
    mutationFn: async (contentUrl: string): Promise<GeneratedContent> => {
      console.log("🚀 Starting content generation for:", contentUrl)
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: contentUrl }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      let data: ProcessResponse
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error("Server returned an invalid response. Please try again.")
      }

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to process content")
      }

      return data.data
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error.message)
      toast.error(error.message || "Something went wrong. Please try again.")
    },
    onSuccess: async (data) => {
      console.log("🎉 Mission completed successfully!", data)
      console.log("📊 Generated data structure:", JSON.stringify(data, null, 2))
      
      // Update the mission with the generated outputs
      try {
        const currentMissionId = localStorage.getItem('currentMissionId')
        console.log("🔍 Current mission ID from localStorage:", currentMissionId)
        
        if (currentMissionId) {
          console.log("📤 Sending update request with outputs:", JSON.stringify(data, null, 2))
          
          const updateRes = await fetch(`/api/missions/${currentMissionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ outputs: data })
          })
          
          console.log("📡 Update response status:", updateRes.status)
          
          if (updateRes.ok) {
            const updatedMission = await updateRes.json()
            console.log("✅ Mission updated with outputs:", updatedMission.data)
            
            // Dispatch a custom event to notify the sidebar to refresh
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('missionUpdated', { 
                detail: { missionId: currentMissionId, outputs: data }
              }))
              console.log("📡 Dispatched missionUpdated event")
            }
          } else {
            const errorData = await updateRes.json()
            console.error("❌ Failed to update mission with outputs:", errorData)
          }
        } else {
          console.warn("⚠️ No current mission ID found in localStorage")
        }
      } catch (err) {
        console.error("Error updating mission with outputs:", err)
      }
      
      toast.success("Content generated successfully!")
      // Clear the current mission ID from localStorage so user can create new missions
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentMissionId')
        // Dispatch a custom event to notify the sidebar
        window.dispatchEvent(new CustomEvent('missionCompleted'))
        console.log("📡 Dispatched missionCompleted event")
      }
    },
  })

  // Reset state when reset parameter is present
  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      setUrl("")
      setShowPreview(false)
      setPreviewData(null)
      setSourceType(null)
      mutation.reset()
      // Clear the URL parameter
      window.history.replaceState({}, "", "/")
    }
  }, [searchParams, mutation])

  // Trigger mission completed event when data is available
  useEffect(() => {
    if (mutation.data) {
      console.log("📊 Mutation data available, triggering mission completed")
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentMissionId')
        window.dispatchEvent(new CustomEvent('missionCompleted'))
      }
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
        
        // Check if this URL has already been processed
        const missionsRes = await fetch("/api/missions", { credentials: "include" })
        if (missionsRes.ok) {
          const missionsData = await missionsRes.json()
          const existingMission = missionsData.data?.find((m: any) => m.sourceUrl === value)
          if (existingMission && existingMission.outputs && Object.keys(existingMission.outputs).length > 0) {
            // Mission already exists with outputs - show the results
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

    if (!url) {
      toast.error("Please enter a URL")
      return
    }

    if (!isValidInstagramUrl(url) && !isValidYouTubeUrl(url)) {
      toast.error("Please enter a valid Instagram or YouTube URL")
      return
    }

    // If we already have mission data, just show it (don't create new mission)
    if (missionData) {
      toast.info("This URL has already been processed. Showing existing results.")
      return
    }

    // Fetch YouTube data first to get title and description
    let missionTitle = `Mission: ${url.substring(0, 50)}...`
    let missionDescription = ""
    
    if (isValidYouTubeUrl(url)) {
      try {
        const previewRes = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url }),
        })
        
        if (previewRes.ok) {
          const previewData = await previewRes.json()
          if (previewData.success && previewData.data?.title) {
            // Use the YouTube title as the mission title
            missionTitle = previewData.data.title
          }
          if (previewData.success && previewData.data?.description) {
            // Use the YouTube description as the mission description
            missionDescription = previewData.data.description.substring(0, 200) + "..."
          }
        }
      } catch (err) {
        console.error("Error fetching preview for mission title:", err)
      }
    }

    // Create a new mission with the fetched title
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: missionTitle,
          platform: isValidInstagramUrl(url) ? "instagram" : "youtube",
          sourceUrl: url,
          description: missionDescription
        }),
      })
      
      if (res.ok) {
        const result = await res.json()
        // Store the mission ID for later use
        if (result.data?.id) {
          localStorage.setItem('currentMissionId', result.data.id)
          console.log("🎯 Created mission with ID:", result.data.id)
        }
      }
    }
    catch (err) {
      console.error("Error creating mission", err)
    }

    // Then start the content generation
    mutation.mutate(url)
  }

  const handleReset = () => {
    setUrl("")
    setSourceType(null)
    setShowPreview(false)
    setPreviewData(null)
    mutation.reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <MultiStepLoader loadingStates={loadingStates} loading={mutation.isPending} duration={1200} />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-purple-300 hover:text-purple-200 text-sm">Back to Mission Log</Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Powered by Spaceslam Technology
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Social Content
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Launch your content into the stratosphere with BrandVoice.ai. Convert any Instagram post or YouTube video into
              multi-platform content that reaches every corner of the digital universe.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-white mb-2">Mission Control Center</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Enter Instagram or YouTube URL to begin content transformation
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="mission-url" className="text-white font-medium text-lg">URL</Label>
                  <div className="flex gap-4">
                    <Input
                      id="mission-url"
                      type="url"
                      placeholder="https://www.instagram.com/p/... or https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="flex-1 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                      disabled={mutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={mutation.isPending || !previewData || !!missionData}
                      className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold text-white">
                      {sourceType === "instagram" ? "Instagram Preview" : "YouTube Preview"}
                    </h4>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
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
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Zap className="h-6 w-6 text-yellow-400" />
                      {missionData ? "Existing Results" : "Mission Complete"}
                    </h3>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      New Mission
                    </Button>
                  </div>
                  <ContentResults data={missionData || mutation.data!} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-r ${feature.color} p-3 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-lg">{feature.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


