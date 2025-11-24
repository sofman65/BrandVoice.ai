import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { onboardingProgress } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

// GET /api/onboarding/progress - Get user's onboarding progress
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const progress = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, userId))
      .limit(1)

    return NextResponse.json(
      { progress: progress[0] || null },
      { status: 200 }
    )
  } catch (error) {
    console.error("[GET /api/onboarding/progress] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/onboarding/progress - Create or update onboarding progress
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { currentStep, platformConnected, voiceProfileId, isCompleted } = body

    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, userId))
      .limit(1)

    if (existingProgress.length > 0) {
      // Update existing progress
      const updated = await db
        .update(onboardingProgress)
        .set({
          currentStep: currentStep ?? existingProgress[0].currentStep,
          platformConnected: platformConnected ?? existingProgress[0].platformConnected,
          voiceProfileId: voiceProfileId ?? existingProgress[0].voiceProfileId,
          isCompleted: isCompleted ?? existingProgress[0].isCompleted,
          updatedAt: new Date(),
        })
        .where(eq(onboardingProgress.userId, userId))
        .returning()

      return NextResponse.json(
        { progress: updated[0] },
        { status: 200 }
      )
    } else {
      // Create new progress
      const newProgress = {
        id: crypto.randomUUID(),
        userId,
        currentStep: currentStep || 1,
        platformConnected: platformConnected || null,
        voiceProfileId: voiceProfileId || null,
        isCompleted: isCompleted || false,
      }

      const inserted = await db
        .insert(onboardingProgress)
        .values(newProgress)
        .returning()

      return NextResponse.json(
        { progress: inserted[0] },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error("[POST /api/onboarding/progress] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
