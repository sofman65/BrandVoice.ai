import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { missions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";


export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("API: User ID from Clerk:", userId);

    // Get all missions for debugging
    const allMissions = await db.select().from(missions);
    console.log("API: All missions in DB:", allMissions);

    // Get missions for current user
    const userMissions = await db
      .select({
        id: missions.id,
        title: missions.title,
        platform: missions.platform,
        sourceUrl: missions.sourceUrl,
        description: missions.description,
        pinned: missions.pinned,
        createdAt: missions.createdAt,
      })
      .from(missions)
      .where(eq(missions.userId, userId))
      .orderBy(desc(missions.pinned), desc(missions.createdAt));

    console.log("API: Missions for user", userId, ":", userMissions);
    return NextResponse.json({ data: userMissions }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/missions] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    
    const record = {
      id: json.id || crypto.randomUUID(),
      userId,
      title: json.title,
      platform: json.platform ?? "",
      sourceUrl: json.sourceUrl ?? "",
      description: json.description ?? null,
      pinned: Boolean(json.pinned ?? false),
      outputs: json.outputs || {
        linkedin: "",
        carousel: [],
        threads: "",
        videoScript: ""
      },
    };

    const inserted = await db.insert(missions).values(record).returning({
      id: missions.id,
      title: missions.title,
      platform: missions.platform,
      sourceUrl: missions.sourceUrl,
      description: missions.description,
      pinned: missions.pinned,
      createdAt: missions.createdAt,
    });

    return NextResponse.json({ ok: true, data: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/missions] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE
  export async function DELETE(req: Request) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const json = await req.json();
      const { id } = json;

      await db.delete(missions).where(eq(missions.id, id));
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    catch (error) {
      console.error("[DELETE /api/missions] Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }



