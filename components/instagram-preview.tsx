"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Instagram, ImageIcon, Video, ExternalLink, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstagramPreviewProps {
  url: string
  data?: {
    username: string
    postId: string
    mediaType: "image" | "video"
    caption: string
    timestamp: string
  }
  isLoading?: boolean
}

export function InstagramPreview({ url, data, isLoading }: InstagramPreviewProps) {
  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-3 w-24 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-20 w-full bg-white/10" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/20 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white flex items-center gap-2">
                @{data.username}
                <Badge variant="secondary" className="bg-white/10 text-purple-300 border-purple-500/30">
                  {data.mediaType === "video" ? (
                    <>
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Image
                    </>
                  )}
                </Badge>
              </h4>
              <p className="text-sm text-gray-300 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(data.timestamp)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-purple-300 hover:text-white hover:bg-white/10">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-gray-300 line-clamp-3 leading-relaxed">{data.caption}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Post ID:</span>
            <code className="bg-white/10 px-2 py-1 rounded text-purple-300 font-mono">{data.postId}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
