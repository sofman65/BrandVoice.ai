import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { voiceProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

// GET /api/voice-profiles - Get user's voice profiles
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profiles = await db
      .select()
      .from(voiceProfiles)
      .where(eq(voiceProfiles.userId, userId))
      .orderBy(voiceProfiles.createdAt)

    return NextResponse.json({ profiles }, { status: 200 })
  } catch (error) {
    console.error("[GET /api/voice-profiles] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/voice-profiles - Create a new voice profile
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, tone, audience, keywords, vocabulary, cta, hashtags, style } = body

    if (!tone || !audience) {
      return NextResponse.json(
        { error: "Tone and audience are required" },
        { status: 400 }
      )
    }

    // Check if user already has a voice profile
    const existingProfiles = await db
      .select()
      .from(voiceProfiles)
      .where(eq(voiceProfiles.userId, userId))

    const isFirstProfile = existingProfiles.length === 0

    const voiceProfile = {
      id: crypto.randomUUID(),
      userId,
      name: name || "Default",
      tone,
      audience,
      keywords: keywords ? (Array.isArray(keywords) ? keywords : keywords.split(',').map((k: string) => k.trim())) : null,
      vocabulary: vocabulary ? (Array.isArray(vocabulary) ? vocabulary : vocabulary.split(',').map((v: string) => v.trim())) : null,
      cta: cta || null,
      hashtags: hashtags ? (Array.isArray(hashtags) ? hashtags : hashtags.split(',').map((h: string) => h.trim())) : null,
      style: style || null,
      isDefault: isFirstProfile, // First profile is default
    }

    const inserted = await db
      .insert(voiceProfiles)
      .values(voiceProfile)
      .returning()

    return NextResponse.json(
      { voiceProfile: inserted[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/voice-profiles] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
