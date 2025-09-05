"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2, Sparkles, Rocket, Zap, Globe, Video, Check, Bookmark, X,
} from "lucide-react"
import { VoicePicker } from "@/features/voices/components/voice-picker"
import { ContentSelectorModal } from "@/components/content-selector-modal"
import { 
  validateUrl, 
  fetchPreviewData, 
  findExistingMission, 
  convertVoiceProfileToBrandVoice,
  type SourceType,
  type UrlValidationResult 
} from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { InstagramPreview } from "@/components/instagram-preview"
import { YouTubePreview } from "@/components/youtube-preview"
import { ContentResults } from "@/features/missions/components/content-results"
import type { GeneratedContent } from "@/lib/types"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import { LOADING_STATES, FEATURES } from "@/lib/constants"

// Types
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

// Utility functions
const getPlatformIcon = (platform: string) => {
  const iconMap = {
    youtube: <Video className="h-4 w-4 text-red-500" />,
    instagram: <Video className="h-4 w-4 text-pink-500" />,
    tiktok: <Video className="h-4 w-4 text-black" />,
  }
  return iconMap[platform as keyof typeof iconMap] || <Video className="h-4 w-4" />
}

const useUrlValidation = (url: string) => {
  return useMemo(() => validateUrl(url), [url])
}

export default function RepurposePage() {
  const searchParams = useSearchParams()

  // State
  const [url, setUrl] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [sourceType, setSourceType] = useState<SourceType | null>(null)
  const [missionData, setMissionData] = useState<GeneratedContent | null>(null)
  const [existingMissionId, setExistingMissionId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<{ id: string; label: string; hint?: string; isDefault?: boolean } | null>(null)
  
  // Custom hooks
  const [referenceContent, setReferenceContent] = useLocalStorage<ReferenceContent | null>("referenceContent", null)
  const urlValidation = useUrlValidation(url)

  // Mutation for content processing
  const mutation = useMutation({
    mutationFn: useCallback(async (contentUrl: string): Promise<GeneratedContent> => {
      const requestBody: any = { url: contentUrl }
      if (referenceContent) requestBody.referenceContent = referenceContent
      
      const currentMissionId = localStorage.getItem("currentMissionId")
      if (currentMissionId) {
        requestBody.missionId = currentMissionId
      }

      // Include voice profile if selected
      if (selectedVoice && selectedVoice.id !== 'create-new') {
        try {
          const voiceResponse = await fetch(`/api/voice-profiles`)
          if (voiceResponse.ok) {
            const voiceData = await voiceResponse.json()
            const selectedProfile = voiceData.profiles?.find((p: any) => p.id === selectedVoice.id)
            if (selectedProfile) {
              // Convert VoiceProfile to BrandVoice format expected by the API
              requestBody.voice = {
                id: selectedProfile.id,
                name: selectedProfile.name,
                tone: selectedProfile.tone,
                style: selectedProfile.style || 'clear, actionable, value-focused',
                vocabulary: Array.isArray(selectedProfile.vocabulary) ? selectedProfile.vocabulary.join(', ') : selectedProfile.vocabulary || 'plain language, avoid jargon',
                audience: selectedProfile.audience,
                hashtags: selectedProfile.hashtags || ['#BrandVoiceAI'],
                ctaStyle: selectedProfile.cta || 'invite conversation and follows, not salesy',
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch voice profile:', error)
        }
      }

      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: ProcessResponse = await response.json().catch(() => {
        throw new Error("Server returned an invalid response. Please try again.")
      })
      
      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to process content")
      }
      
      return data.data
    }, [referenceContent, selectedVoice]),
    
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong. Please try again.")
    },
    
    onSuccess: useCallback(async (data: GeneratedContent) => {
      const currentMissionId = localStorage.getItem("currentMissionId")
      if (currentMissionId) {
        window.dispatchEvent(
          new CustomEvent("missionUpdated", {
            detail: { missionId: currentMissionId, data },
          })
        )
      }

      toast.success("Content generated successfully!")
      localStorage.removeItem("currentMissionId")
      window.dispatchEvent(new CustomEvent("missionCompleted"))
    }, []),
  })

  // Effects
  useEffect(() => {
    if (referenceContent) {
      toast.success("Reference content loaded from library!")
    }
  }, [referenceContent])

  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      handleReset()
      window.history.replaceState({}, "", "/")
    }
  }, [searchParams])

  useEffect(() => {
    if (mutation.data) {
      localStorage.removeItem("currentMissionId")
      window.dispatchEvent(new CustomEvent("missionCompleted"))
    }
  }, [mutation.data])

  // Handlers
  const handleUrlChange = useCallback(async (value: string) => {
    setUrl(value)
    const { isValid, type } = validateUrl(value)

    if (value && isValid && type) {
      setSourceType(type)
      setShowPreview(true)
      setPreviewData(null)
      
      try {
        const [previewResult, existingMission] = await Promise.all([
          fetchPreviewData(value),
          findExistingMission(value)
        ])
        
        setPreviewData(previewResult)
        
        if (existingMission?.outputs && Object.keys(existingMission.outputs).length > 0) {
          setMissionData(existingMission.outputs)
          setExistingMissionId(existingMission.id)
        } else {
          setMissionData(null)
          setExistingMissionId(null)
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
  }, [])

  const createMission = useCallback(async (url: string, sourceType: SourceType) => {
    let missionTitle = `Mission: ${url.substring(0, 50)}...`
    let missionDescription = ""
    
    if (sourceType === "youtube") {
      try {
        const previewData = await fetchPreviewData(url)
        if (previewData?.title) missionTitle = previewData.title
        if (previewData?.description) {
          missionDescription = previewData.description.substring(0, 200) + "..."
        }
      } catch {}
    }

    const response = await fetch("/api/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: missionTitle,
        platform: sourceType === "instagram" ? "instagram" : "youtube",
        sourceUrl: url,
        description: missionDescription,
      }),
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.data?.id) {
        localStorage.setItem("currentMissionId", result.data.id)
      }
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!url) return toast.error("Please enter a URL")
    if (!urlValidation.isValid) {
      return toast.error("Please enter a valid Instagram or YouTube URL")
    }
    if (missionData) {
      toast.info("This URL has already been processed. Showing existing results.")
      return
    }

    try {
      await createMission(url, urlValidation.type!)
      mutation.mutate(url)
    } catch (err) {
      console.error("Error creating mission", err)
      mutation.mutate(url) // Continue even if mission creation fails
    }
  }, [url, urlValidation, missionData, createMission, mutation])

  const handleReset = useCallback(() => {
    setUrl("")
    setSourceType(null)
    setShowPreview(false)
    setPreviewData(null)
    setReferenceContent(null)
    mutation.reset()
  }, [mutation, setReferenceContent])

  const clearReference = useCallback(() => {
    setReferenceContent(null)
    toast.success("Reference content cleared")
  }, [setReferenceContent])

  const handleSelectReference = useCallback((content: ReferenceContent) => {
    setReferenceContent(content)
  }, [setReferenceContent])

  const scrollToInput = useCallback(() => {
    const el = document.getElementById("mission-url")
    el?.focus()
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [])

  // Computed values
  const isProcessingDisabled = mutation.isPending || !previewData || !!missionData
  const hasResults = mutation.data || missionData
  const currentResults = missionData || mutation.data
  const isExistingResults = !!missionData

  return (
    <div className="relative">
      <MultiStepLoader
        loadingStates={LOADING_STATES}
        loading={mutation.isPending}
        duration={1200}
      />
  
      {/* Canvas — MissionShell provides the dark gradient background */}
      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        {/* Voice picker */}
        <div className="mb-10 flex justify-end">
          <VoicePicker
            value={selectedVoice}
            onChange={setSelectedVoice}
          />
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
          <ReferenceContentCard 
            referenceContent={referenceContent}
            onClearReference={clearReference}
            onOpenModal={() => setIsModalOpen(true)}
          />
  
          {/* Mission control */}
          <Card className="border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/10">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Mission Control Center
              </CardTitle>
              <CardDescription className="text-gray-300">
                {referenceContent
                  ? `Repurpose with "${referenceContent.title}" as inspiration`
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
  
                  <ProcessButton 
                    isPending={mutation.isPending}
                    isDisabled={isProcessingDisabled}
                    hasExistingData={isExistingResults}
                  />
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
              {hasResults && (
                <ResultsSection 
                  results={currentResults!}
                  isExisting={isExistingResults}
                  onReset={handleReset}
                />
              )}
            </CardContent>
          </Card>
  
          {/* Features */}
          <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <Card
                key={index}
                className="group border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <CardContent className="p-5 sm:p-6 text-center space-y-3">
                  <div className={`mx-auto h-12 w-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 transition-transform group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold">{feature.title}</h4>
                  <p className="text-sm text-gray-300">{feature.desc}</p>
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
              onClick={scrollToInput}
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

// Sub-components
const ReferenceContentCard = ({ 
  referenceContent, 
  onClearReference, 
  onOpenModal 
}: {
  referenceContent: ReferenceContent | null
  onClearReference: () => void
  onOpenModal: () => void
}) => (
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
            onClick={onClearReference}
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
            onClick={onOpenModal}
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
)

const ProcessButton = ({ 
  isPending, 
  isDisabled, 
  hasExistingData 
}: {
  isPending: boolean
  isDisabled: boolean
  hasExistingData: boolean
}) => (
  <Button
    type="submit"
    disabled={isDisabled}
    className="h-12 sm:w-auto w-full bg-gradient-to-r from-purple-600 to-pink-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {isPending ? (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Repurposing…
      </>
    ) : hasExistingData ? (
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
)

const ResultsSection = ({ 
  results, 
  isExisting, 
  onReset 
}: {
  results: GeneratedContent
  isExisting: boolean
  onReset: () => void
}) => (
  <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <Zap className="h-6 w-6 text-yellow-400" />
        {isExisting ? "Existing Results" : "Mission Complete"}
      </h3>
      <Button
        variant="outline"
        onClick={onReset}
        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
      >
        New Mission
      </Button>
    </div>
    <ContentResults data={results} />
  </div>
)