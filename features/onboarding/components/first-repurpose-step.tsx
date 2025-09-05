"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ContentResults } from "@/features/missions/components/content-results"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import { LOADING_STATES } from "@/lib/constants"
import { isValidYouTubeUrl, isValidInstagramUrl } from "@/lib/utils"
import { Rocket, Upload, Sparkles, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { GeneratedContent } from "@/lib/types"

interface FirstRepurposeStepProps {
  onComplete: (data: any) => void
  platform?: string | null
  voiceProfileId?: string | null
}

export function FirstRepurposeStep({ onComplete, platform, voiceProfileId }: FirstRepurposeStepProps) {
  const [url, setUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [showVoiceAlert, setShowVoiceAlert] = useState(!voiceProfileId)

  const validateInput = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL or upload a file")
      return false
    }

    if (platform === "youtube" && !isValidYouTubeUrl(url)) {
      toast.error("Please enter a valid YouTube URL")
      return false
    }

    if (platform === "instagram" && !isValidInstagramUrl(url)) {
      toast.error("Please enter a valid Instagram URL") 
      return false
    }

    return true
  }

  const handleGenerate = async () => {
    if (!validateInput()) return

    setIsGenerating(true)

    try {
      // First create a mission
      const missionResponse = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `First Mission: ${url.substring(0, 50)}...`,
          platform: platform === "youtube" ? "youtube" : "instagram",
          sourceUrl: url,
          description: "Your first repurposed content!",
        }),
        credentials: "include",
      })

      if (!missionResponse.ok) {
        throw new Error("Failed to create mission")
      }

      const missionData = await missionResponse.json()
      const missionId = missionData.data.id

      // Store mission ID for process API
      localStorage.setItem("currentMissionId", missionId)

      // Generate content
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          missionId, // This will save outcomes automatically
          voiceProfileId, // Use the onboarding voice profile
        }),
        credentials: "include",
      })

      if (!processResponse.ok) {
        throw new Error("Failed to generate content")
      }

      const processData = await processResponse.json()
      
      if (!processData.success) {
        throw new Error(processData.error || "Content generation failed")
      }

      setGeneratedContent(processData.data)
      toast.success("Content generated successfully! 🎉")
      
      // Clean up
      localStorage.removeItem("currentMissionId")
      
    } catch (error) {
      console.error("Error generating content:", error)
      toast.error("Failed to generate content. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = () => {
    onComplete({
      generatedContent,
      firstMissionCompleted: true,
    })
  }

  const getInputPlaceholder = () => {
    switch (platform) {
      case "youtube":
        return "https://www.youtube.com/watch?v=..."
      case "instagram":
        return "https://www.instagram.com/p/..."
      case "upload":
        return "Upload your video file..."
      default:
        return "Enter your content URL..."
    }
  }

  const getInputLabel = () => {
    switch (platform) {
      case "youtube":
        return "YouTube URL"
      case "instagram":
        return "Instagram URL"
      case "upload":
        return "Upload File"
      default:
        return "Content URL"
    }
  }

  return (
    <div className="space-y-8">
      <MultiStepLoader
        loadingStates={LOADING_STATES}
        loading={isGenerating}
        duration={1200}
      />

      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Let's try your first transformation</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          {platform === "upload" 
            ? "Upload a video file and watch the magic happen."
            : "Paste a link and watch the magic happen."
          }
        </p>
      </div>

      {/* Voice Alert */}
      {showVoiceAlert && (
        <Alert className="max-w-2xl mx-auto bg-amber-500/10 border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            This content will be generated in our default AI voice. 
            <button 
              onClick={() => setShowVoiceAlert(false)}
              className="ml-1 underline hover:no-underline"
            >
              That's okay for now
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Input Section */}
      {!generatedContent && (
        <Card className="max-w-2xl mx-auto bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              {platform === "upload" ? "Upload Your Content" : "Enter Your Content URL"}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {platform === "upload" 
                ? "Select a video or audio file to transform into multi-platform content"
                : "We'll automatically fetch the content and transform it into multiple formats"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content-input" className="text-white">
                {getInputLabel()}
              </Label>
              {platform === "upload" ? (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/30 transition-colors cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-300 mb-1">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">MP4, MP3, MOV up to 100MB</p>
                </div>
              ) : (
                <Input
                  id="content-input"
                  type="url"
                  placeholder={getInputPlaceholder()}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                  disabled={isGenerating}
                />
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !url.trim()}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Generate My First Content
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {generatedContent && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              Your Content is Ready!
            </h3>
            <p className="text-gray-300">
              Here's your content transformed into multiple formats
            </p>
          </div>

          <ContentResults data={generatedContent} />

          <div className="text-center">
            <Button
              onClick={handleComplete}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 text-lg"
            >
              Complete Onboarding
            </Button>
          </div>
        </div>
      )}

      {/* Tips */}
      {!generatedContent && (
        <div className="max-w-2xl mx-auto">
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Pro Tips for Better Results
              </h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Choose content with clear audio and good engagement</li>
                <li>• Longer content (5+ minutes) gives more material to work with</li>
                <li>• Educational or storytelling content works best</li>
                <li>• Make sure the content aligns with your brand voice</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
