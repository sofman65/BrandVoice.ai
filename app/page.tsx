"use client"

import type React from "react"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Rocket, Zap, Globe, Video, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { isValidInstagramUrl, isValidYouTubeUrl } from "@/lib/utils"
import { InstagramPreview } from "@/components/instagram-preview"
import { YouTubePreview } from "@/components/youtube-preview"
import { ContentResults } from "@/components/content-results"
import { ThemeToggle } from "@/components/theme-toggle"
import type { GeneratedContent } from "@/lib/types"
import Image from "next/image"

interface ProcessResponse {
  success: boolean
  data?: GeneratedContent
  error?: string
}

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [sourceType, setSourceType] = useState<"instagram" | "youtube" | null>(null)

  const mutation = useMutation({
    mutationFn: async (contentUrl: string): Promise<GeneratedContent> => {
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
    onSuccess: () => {
      toast.success("Content generated successfully!")
    },
  })

  const handleUrlChange = (value: string) => {
    setUrl(value)

    // Determine URL type
    const isInstagram = isValidInstagramUrl(value)
    const isYouTube = isValidYouTubeUrl(value)

    if (value && isInstagram) {
      setSourceType("instagram")
      setShowPreview(true)
      setTimeout(() => {
        setPreviewData({
          username: "edhonour",
          postId: "DJwl7IiNuO1",
          mediaType: "image",
          caption: "Improve your development workflow with these amazing tools! 🚀 #coding #productivity",
          timestamp: new Date().toISOString(),
        })
      }, 500)
    } else if (value && isYouTube) {
      setSourceType("youtube")
      setShowPreview(true)
      setTimeout(() => {
        setPreviewData({
          title: "How to Improve Your Development Workflow",
          channelTitle: "CodeWithMe",
          thumbnail: `https://i.ytimg.com/vi/${value.split("v=")[1] || "dQw4w9WgXcQ"}/maxresdefault.jpg`,
          description: "In this video, I share my top tips for improving your development workflow with these amazing tools! 🚀 #coding #productivity",
          publishedAt: new Date().toISOString(),
        })
      }, 500)
    } else {
      setSourceType(null)
      setShowPreview(false)
      setPreviewData(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      toast.error("Please enter a URL")
      return
    }

    if (!isValidInstagramUrl(url) && !isValidYouTubeUrl(url)) {
      toast.error("Please enter a valid Instagram or YouTube URL")
      return
    }

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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">

            {/* Brand Hierarchy */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                {/* Spaceslam Logo */}
                <div className="relative">
                  <Image
                    src="./spaceslamlogo.png"
                    alt="Spaceslam Logo"
                    width={140}
                    height={140}
                    className="pb-3"
                  />
                </div>
                <div className="h-12 w-px bg-white/30"></div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-purple-300">BrandVoice.ai</span>
                  <span className="text-sm text-gray-400">Content Repurposer</span>
                </div>
              </div>

            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          {/* Hero Section */}
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

          {/* Main Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-white mb-2">Mission Control Center</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Enter Instagram or YouTube URL to begin content transformation
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="instagram-url" className="text-white font-medium text-lg">
                    URL
                  </Label>
                  <div className="flex gap-4">
                    <Input
                      id="instagram-url"
                      type="url"
                      placeholder="https://www.instagram.com/p/... or https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="flex-1 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                      disabled={mutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={mutation.isPending || !previewData}
                      className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Launching...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-5 w-5" />
                          Launch Content
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Instagram/YouTube Preview */}
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

              {/* Results */}
              {mutation.data && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Zap className="h-6 w-6 text-yellow-400" />
                      Mission Complete
                    </h3>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      New Mission
                    </Button>
                  </div>
                  <ContentResults data={mutation.data} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Grid */}
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

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-gray-400">
              Powered by <span className="text-purple-400 font-semibold">Spaceslam</span> •
              <span className="text-pink-400 font-semibold"> BrandVoice.ai</span> • Built with{" "}
              <span className="text-pink-400">❤️</span> for content creators
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
