"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ImageIcon, Video, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstagramPreviewProps {
  url: string
  onPreviewReady?: (isReady: boolean) => void
}

interface PreviewData {
  postId: string
  postType: "post" | "reel"
  username: string
  caption: string
  mediaType: "image" | "video"
  timestamp: string
  isValid: boolean
}

export function InstagramPreview({ url, onPreviewReady }: InstagramPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setPreviewData(null)
      onPreviewReady?.(false)
      return
    }

    const fetchPreview = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Extract post ID and type from URL
        const urlMatch = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/)
        if (!urlMatch) {
          throw new Error("Invalid Instagram URL format")
        }

        const [, postType, postId] = urlMatch

        // In a real implementation, you would call Instagram's API here
        // For now, we'll simulate the API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 800))

        const mockPreviewData: PreviewData = {
          postId,
          postType: postType as "post" | "reel",
          username: "edhonour", // Extracted from the URL you provided
          caption:
            "🚀 Improve your development workflow with AI-powered tools! As a software engineer, I've seen how the right tools can make a huge difference in productivity and code quality. What's your favorite development tool? #SoftwareEngineering #AI #Productivity #TechTips",
          mediaType: postType === "reel" ? "video" : "image",
          timestamp: "2024-01-15T10:30:00Z",
          isValid: true,
        }

        setPreviewData(mockPreviewData)
        onPreviewReady?.(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load preview")
        onPreviewReady?.(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreview()
  }, [url, onPreviewReady])

  if (!url) return null

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-3/4 bg-muted rounded"></div>
            <div className="h-20 w-full bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-destructive">
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!previewData) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            <span>Instagram Preview</span>
          </div>
          <Badge variant={previewData.postType === "reel" ? "default" : "secondary"}>
            {previewData.postType === "reel" ? "Reel" : "Post"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">@{previewData.username}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(previewData.timestamp).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {previewData.mediaType === "video" ? (
            <Video className="h-4 w-4 text-blue-500" />
          ) : (
            <ImageIcon className="h-4 w-4 text-green-500" />
          )}
          <span className="text-sm capitalize">{previewData.mediaType} Content</span>
          <Badge variant="outline" className="text-xs">
            ID: {previewData.postId}
          </Badge>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Caption Preview:</p>
          <p className="text-sm line-clamp-3">{previewData.caption}</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">Ready for content generation</div>
          <Button variant="ghost" size="sm" onClick={() => window.open(url, "_blank")} className="text-xs">
            View Original
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
