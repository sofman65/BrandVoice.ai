"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ContentResults } from "@/components/content-results"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { isValidInstagramUrl } from "@/lib/utils"
import type { ProcessResponse } from "@/lib/types"
import toast from "react-hot-toast"
import { Loader2, Rocket } from "lucide-react"
import { InstagramPreview } from "@/components/instagram-preview"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (url && isValidInstagramUrl(url)) {
      setShowPreview(true)
    } else {
      setShowPreview(false)
      setIsPreviewReady(false)
    }
  }, [url])

  const mutation = useMutation({
    mutationFn: async (instagramUrl: string): Promise<ProcessResponse> => {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: instagramUrl }),
      })

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      return data
    },
    onError: (error) => {
      console.error("Mutation error:", error)
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      toast.error("Please enter an Instagram URL")
      return
    }

    if (!isValidInstagramUrl(url)) {
      toast.error("Please enter a valid Instagram post or reel URL")
      return
    }

    if (!isPreviewReady) {
      toast.error("Please wait for the preview to load")
      return
    }

    mutation.mutate(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>

        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Spaceslam
            </h1>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Instagram → Multichannel Generator</h2>
          <p className="text-muted-foreground text-lg">Turn any IG post into cross-platform content in seconds.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!mutation.data && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Get Started</CardTitle>
                <CardDescription>
                  Paste an Instagram post or reel URL to generate content for LinkedIn, Carousel, Threads, and Video
                  Scripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      type="url"
                      placeholder="https://instagram.com/p/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={mutation.isPending}
                      className="flex-1"
                      aria-label="Instagram URL"
                    />
                    <Button type="submit" disabled={mutation.isPending || !isPreviewReady} className="px-8">
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Generate"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {showPreview && !mutation.data && (
            <div className="mb-6">
              <InstagramPreview url={url} onPreviewReady={setIsPreviewReady} />
            </div>
          )}

          {mutation.isPending && (
            <Card>
              <CardHeader>
                <CardTitle>Generating Content...</CardTitle>
                <CardDescription>Analyzing your Instagram post and creating multi-channel content</CardDescription>
              </CardHeader>
              <CardContent>
                <LoadingSkeleton />
              </CardContent>
            </Card>
          )}

          {mutation.data?.success && mutation.data.data && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">Content Generated! 🚀</h3>
                <p className="text-muted-foreground">
                  Your multi-channel content is ready. Click the copy buttons to use them.
                </p>
              </div>
              <ContentResults content={mutation.data.data} />
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUrl("")
                    mutation.reset()
                  }}
                >
                  Generate Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
