import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { missions, missionOutcomes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/outcomes/[id] - Get a specific outcome
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
      return NextResponse.json({ error: "Outcome ID is required" }, { status: 400 });
    }

    // Get outcome with mission ownership check
    const outcome = await db
      .select({
        id: missionOutcomes.id,
        missionId: missionOutcomes.missionId,
        type: missionOutcomes.type,
        title: missionOutcomes.title,
        content: missionOutcomes.content,
        metadata: missionOutcomes.metadata,
        status: missionOutcomes.status,
        createdAt: missionOutcomes.createdAt,
        updatedAt: missionOutcomes.updatedAt,
      })
      .from(missionOutcomes)
      .innerJoin(missions, eq(missions.id, missionOutcomes.missionId))
      .where(
        and(
          eq(missionOutcomes.id, params.id),
          eq(missions.userId, userId)
        )
      )
      .limit(1);

    if (outcome.length === 0) {
      return NextResponse.json({ error: "Outcome not found" }, { status: 404 });
    }

    return NextResponse.json({ data: outcome[0] }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/outcomes/[id]] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// PUT /api/outcomes/[id] - Update a specific outcome
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
      return NextResponse.json({ error: "Outcome ID is required" }, { status: 400 });
    }

    // First verify the outcome belongs to a mission owned by the user
    const existingOutcome = await db
      .select({ id: missionOutcomes.id })
      .from(missionOutcomes)
      .innerJoin(missions, eq(missions.id, missionOutcomes.missionId))
      .where(
        and(
          eq(missionOutcomes.id, params.id),
          eq(missions.userId, userId)
        )
      )
      .limit(1);

    if (existingOutcome.length === 0) {
      return NextResponse.json({ error: "Outcome not found" }, { status: 404 });
    }

    const json = await req.json();

    const updateData: any = {};
    if (json.title !== undefined) updateData.title = json.title;
    if (json.content !== undefined) updateData.content = json.content;
    if (json.metadata !== undefined) updateData.metadata = json.metadata;
    if (json.status !== undefined) updateData.status = json.status;

    const updated = await db
      .update(missionOutcomes)
      .set(updateData)
      .where(eq(missionOutcomes.id, params.id))
      .returning();

    return NextResponse.json({ data: updated[0] }, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/outcomes/[id]] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE /api/outcomes/[id] - Delete a specific outcome
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
      return NextResponse.json({ error: "Outcome ID is required" }, { status: 400 });
    }

    // First verify the outcome belongs to a mission owned by the user
    const existingOutcome = await db
      .select({ id: missionOutcomes.id })
      .from(missionOutcomes)
      .innerJoin(missions, eq(missions.id, missionOutcomes.missionId))
      .where(
        and(
          eq(missionOutcomes.id, params.id),
          eq(missions.userId, userId)
        )
      )
      .limit(1);

    if (existingOutcome.length === 0) {
      return NextResponse.json({ error: "Outcome not found" }, { status: 404 });
    }

    await db.delete(missionOutcomes).where(eq(missionOutcomes.id, params.id));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/outcomes/[id]] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
