import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { missions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

    console.log("API: Fetching mission", params.id, "for user", userId);

    const mission = await db
      .select()
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

    console.log("API: Found mission:", mission[0]);
    return NextResponse.json({ data: mission[0] }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/missions/[id]] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(
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

    const json = await req.json();
    console.log("API: Updating mission", params.id, "with data:", json);

    const updateData: any = {};
    if (json.title !== undefined) updateData.title = json.title;
    if (json.pinned !== undefined) updateData.pinned = Boolean(json.pinned);

    const updated = await db
      .update(missions)
      .set(updateData)
      .where(
        and(
          eq(missions.id, params.id),
          eq(missions.userId, userId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    console.log("API: Updated mission:", updated[0]);
    return NextResponse.json({ data: updated[0] }, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/missions/[id]] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(
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

    console.log("API: Deleting mission", params.id, "for user", userId);

    const deleted = await db
      .delete(missions)
      .where(
        and(
          eq(missions.id, params.id),
          eq(missions.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    console.log("API: Deleted mission:", deleted[0]);
    return NextResponse.json({ data: deleted[0] }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/missions/[id]] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
