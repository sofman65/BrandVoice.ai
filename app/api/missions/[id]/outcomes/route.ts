import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { missions, missionOutcomes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/missions/[id]/outcomes - Get all outcomes for a mission
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!params.id) {
      return NextResponse.json({ error: "Mission ID is required" }, { status: 400 });
    }

    // First verify the mission belongs to the user
    const mission = await db
      .select({ id: missions.id })
      .from(missions)
      .where(
        and(
          eq(missions.id, params.id),
          eq(missions.userId, userId)
        )
      )
      .limit(1);

    if (mission.length === 0) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Get all outcomes for this mission
    const outcomes = await db
      .select()
      .from(missionOutcomes)
      .where(eq(missionOutcomes.missionId, params.id))
      .orderBy(missionOutcomes.createdAt);

    return NextResponse.json({ data: outcomes }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/missions/[id]/outcomes] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/missions/[id]/outcomes - Create new outcome for a mission
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!params.id) {
      return NextResponse.json({ error: "Mission ID is required" }, { status: 400 });
    }

    // First verify the mission belongs to the user
    const mission = await db
      .select({ id: missions.id })
      .from(missions)
      .where(
        and(
          eq(missions.id, params.id),
          eq(missions.userId, userId)
        )
      )
      .limit(1);

    if (mission.length === 0) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    const json = await req.json();
    
    const record = {
      id: json.id || crypto.randomUUID(),
      missionId: params.id,
      type: json.type, // 'threads', 'linkedin_post', 'instagram_carousel', 'video_script'
      title: json.title || null,
      content: json.content,
      metadata: json.metadata || null,
      status: json.status || 'draft',
    };

    const inserted = await db.insert(missionOutcomes).values(record).returning();

    return NextResponse.json({ ok: true, data: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/missions/[id]/outcomes] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
