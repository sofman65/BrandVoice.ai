"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface YouTubePreviewProps {
    url: string
    data?: {
        title?: string
        channelTitle?: string
        thumbnail?: string
        description?: string
        publishedAt?: string
    }
    isLoading?: boolean
}

export function YouTubePreview({ url, data, isLoading = false }: YouTubePreviewProps) {
    // Extract video ID for embed preview
    const getVideoId = (youtubeUrl: string) => {
        const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
        const match = youtubeUrl.match(regExp)
        return match && match[1] ? match[1] : null
    }

    const videoId = getVideoId(url)

    return (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-72">
                        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                    </div>
                ) : data ? (
                    <div className="flex flex-col">
                        <div className="aspect-video relative">
                            {videoId && (
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoId}?controls=0`}
                                    title={data.title || "YouTube Video"}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                />
                            )}
                        </div>
                        <div className="p-4 space-y-3">
                            <h3 className="text-xl font-bold text-white">{data.title}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">{data.channelTitle}</span>
                                {data.publishedAt && (
                                    <span className="text-gray-400 text-sm">
                                        {new Date(data.publishedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            {data.description && (
                                <p className="text-gray-300 text-sm line-clamp-3">{data.description}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-72 text-gray-400">
                        No preview available
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
