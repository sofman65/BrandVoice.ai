import { NextRequest, NextResponse } from "next/server"
import { isValidInstagramUrl, isValidYouTubeUrl } from "@/lib/utils"
// import { fetchInstagram } from "@/lib/instagram"
import { fetchYouTubeData } from "@/lib/youtube"

export const runtime = "nodejs"
export const maxDuration = 20

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const url: string | undefined = body?.url
    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
    }

    const isInsta = isValidInstagramUrl(url)
    const isYT = isValidYouTubeUrl(url)
    if (!isInsta && !isYT) {
      return NextResponse.json({ success: false, error: "Invalid URL" }, { status: 400 })
    }

    if (isInsta) {
      // Instagram fetching not yet implemented
      return NextResponse.json({
        success: false,
        error: "Instagram preview not yet implemented"
      }, { status: 501 })
    }

    const yt = await fetchYouTubeData(url)
    return NextResponse.json({
      success: true,
      type: "youtube",
      data: {
        title: yt.title,
        channelTitle: yt.channelTitle,
        description: yt.description,
        publishedAt: yt.publishedAt,
        thumbnail: yt.thumbnail,
      },
    })
  } catch (error) {
    console.error("/api/preview error", error)
    return NextResponse.json({ success: false, error: "Failed to fetch preview" }, { status: 500 })
  }
}


