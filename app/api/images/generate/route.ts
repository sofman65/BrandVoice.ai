import { NextRequest, NextResponse } from "next/server"
import { generateImagesForSlides } from "@/lib/image-generator"
import type { CarouselSlide } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || !Array.isArray(body.slides)) {
      return NextResponse.json(
        { success: false, error: "Invalid body. Expect { slides: CarouselSlide[] }" },
        { status: 400 },
      )
    }

    const slides: CarouselSlide[] = body.slides

    // Prefer data URLs on Vercel (ephemeral FS). Allow explicit override via body.storage
    const storage = body.storage === "fs" || body.storage === "data"
      ? body.storage
      : (process.env.VERCEL ? "data" : "fs")

    const updated = await generateImagesForSlides(slides, {
      storage,
      concurrency: 2,
      timeoutMs: 45_000,
    })

    return NextResponse.json({ success: true, slides: updated })
  } catch (error) {
    console.error("/api/images/generate error", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}


