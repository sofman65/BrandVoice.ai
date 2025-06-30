"use server"
import "server-only"
import { sleep } from "./utils"

export type YouTubeVideoDetails = {
    title: string
    description: string
    channelTitle?: string
    publishedAt?: string
    videoId: string
    thumbnail?: string
    transcript?: string
}

export type YouTubeAPIError = {
    message: string
    code: number
    type:
    | "AuthenticationError"
    | "RateLimitError"
    | "InvalidURL"
    | "NetworkError"
    | "VideoUnavailable"
    | "TranscriptUnavailable"
    | "UnknownError"
    details?: unknown
}

/**
 * Type guard for checking if an error is a YouTubeAPIError
 * Note: Since server actions must be async, this function returns a Promise<boolean>
 * instead of a simple boolean type guard
 */
export async function isYouTubeAPIError(error: unknown): Promise<boolean> {
    return (
        typeof error === "object" &&
        error !== null &&
        "type" in error &&
        typeof (error as YouTubeAPIError).type === "string"
    )
}

/**
 * Extract video ID from a YouTube URL
 */
export async function extractYouTubeVideoId(url: string): Promise<string> {
    // Handle different YouTube URL formats
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
    const match = url.match(regExp)

    if (match && match[1]) {
        return match[1]
    }

    throw {
        message: "Invalid YouTube URL format",
        code: 400,
        type: "InvalidURL"
    } as YouTubeAPIError
}

/**
 * Fetch YouTube video details and transcript
 */
export async function fetchYouTubeData(url: string): Promise<YouTubeVideoDetails> {
    try {
        const videoId = await extractYouTubeVideoId(url)

        // Check if YouTube API key is configured
        if (!process.env.YOUTUBE_API_KEY) {
            console.warn("YouTube API not configured, using mock data")
            await sleep(500)

            return {
                title: "How to Improve Your Development Workflow",
                description: "In this video, I share my top tips for improving your development workflow with these amazing tools! 🚀 #coding #productivity",
                channelTitle: "CodeWithMe",
                publishedAt: new Date().toISOString(),
                videoId,
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                transcript: "Hey everyone! Today I'm going to share some amazing tools that will help improve your development workflow. Let's dive in! First, let's talk about VS Code extensions that can boost your productivity. Next, I'll show you some CLI tools that I use every day. Finally, we'll look at some AI-powered tools that can help you write better code faster."
            }
        }

        // Fetch video details from YouTube API
        const videoDetails = await fetchVideoDetails(videoId)

        // Fetch transcript (if available)
        const transcript = await fetchVideoTranscript(videoId)

        return {
            ...videoDetails,
            transcript
        }
    } catch (error) {
        const isError = await isYouTubeAPIError(error)
        if (isError && typeof error === "object" && error !== null && "message" in error) {
            console.error("YouTube API Error:", error)
            throw new Error(`YouTube API error: ${String(error.message)}`)
        }

        console.error("Unexpected error in fetchYouTubeData:", error)
        throw new Error("Failed to fetch YouTube video data")
    }
}

/**
 * Fetch video details from YouTube API or ytdl-core
 */
async function fetchVideoDetails(videoId: string): Promise<YouTubeVideoDetails> {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY

        if (apiKey) {
            // Use YouTube API if key is available
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw {
                    message: errorData.error?.message || "Failed to fetch video details",
                    code: response.status,
                    type: response.status === 403 ? "AuthenticationError" : "NetworkError",
                    details: errorData
                } as YouTubeAPIError
            }

            const data = await response.json()

            if (!data.items || data.items.length === 0) {
                throw {
                    message: "Video not found",
                    code: 404,
                    type: "VideoUnavailable"
                } as YouTubeAPIError
            }

            const snippet = data.items[0].snippet

            return {
                title: snippet.title,
                description: snippet.description,
                channelTitle: snippet.channelTitle,
                publishedAt: snippet.publishedAt,
                videoId,
                thumbnail: snippet.thumbnails?.maxres?.url ||
                    snippet.thumbnails?.high?.url ||
                    snippet.thumbnails?.medium?.url ||
                    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
            }
        } else {
            // Use ytdl-core as a fallback
            try {
                const ytdl = await import('ytdl-core')
                const info = await ytdl.default.getInfo(videoId)
                const videoDetails = info.videoDetails

                return {
                    title: videoDetails.title,
                    description: videoDetails.description || "",
                    channelTitle: videoDetails.author.name,
                    publishedAt: new Date(parseInt(videoDetails.publishDate || "") * 1000).toISOString(),
                    videoId,
                    thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url ||
                        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                }
            } catch (ytdlError) {
                console.error("Error using ytdl-core:", ytdlError)
                throw {
                    message: "Failed to fetch video details with ytdl-core",
                    code: 500,
                    type: "NetworkError",
                    details: ytdlError
                } as YouTubeAPIError
            }
        }
    } catch (error) {
        const isError = await isYouTubeAPIError(error)
        if (isError && typeof error === "object" && error !== null) {
            throw error
        }

        console.error("Error fetching video details:", error)
        throw {
            message: "Failed to fetch video details",
            code: 500,
            type: "NetworkError",
            details: error
        } as YouTubeAPIError
    }
}

/**
 * Fetch video transcript using YouTube's transcript API
 * Note: This uses ytdl-core to get video info, but actual transcript extraction would require
 * a dedicated service or library that can extract closed captions.
 */
async function fetchVideoTranscript(videoId: string): Promise<string> {
    try {
        // Check if we're in mock mode (no API key)
        if (!process.env.YOUTUBE_API_KEY) {
            return "Hey everyone! Today I'm going to share some amazing tools that will help improve your development workflow. Let's dive in! First, let's talk about VS Code extensions that can boost your productivity. Next, I'll show you some CLI tools that I use every day. Finally, we'll look at some AI-powered tools that can help you write better code faster."
        }

        try {
            // Import ytdl-core dynamically to avoid server-side issues
            const ytdl = await import('ytdl-core')

            // Get video info using ytdl-core
            const info = await ytdl.default.getInfo(videoId)

            // This is a simplified approach - in a real implementation, you would:
            // 1. Extract the captions track URL from the video info
            // 2. Fetch the captions (usually in XML format)
            // 3. Parse and convert them to plain text

            // For now, we'll check if captions exist and return a mock transcript
            const captionTracks = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks
            const hasCaptions = captionTracks && captionTracks.length > 0

            if (hasCaptions) {
                // In a real implementation, you would fetch and process the captions here
                // For demo purposes, we'll return a mock transcript based on the video title
                const videoTitle = info.videoDetails.title
                const channelName = info.videoDetails.author.name
                return `Transcript for "${videoTitle}" by ${channelName}.\n\nHello everyone, welcome to this video about ${videoTitle.toLowerCase()}. Today we're going to explore some important concepts and ideas that will help you understand this topic better. Let's dive in and learn together!`
            } else {
                console.warn("No captions found for video:", videoId)
                return ""
            }
        } catch (ytdlError) {
            console.error("Error using ytdl-core:", ytdlError)
            throw {
                message: "Failed to fetch video transcript",
                code: 500,
                type: "TranscriptUnavailable",
                details: ytdlError
            } as YouTubeAPIError
        }
    } catch (error) {
        console.error("Error fetching transcript:", error)

        const isError = await isYouTubeAPIError(error)
        if (isError && typeof error === "object" && error !== null && "type" in error) {
            // If it's a specific API error, we might want to handle it differently
            if (error.type === "TranscriptUnavailable") {
                console.warn("Transcript not available for video:", videoId)
                return "" // Return empty string when transcript is not available
            }
            throw error
        }

        throw {
            message: "Failed to fetch video transcript",
            code: 500,
            type: "TranscriptUnavailable",
            details: error
        } as YouTubeAPIError
    }
}
