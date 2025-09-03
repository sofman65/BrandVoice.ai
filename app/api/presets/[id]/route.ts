import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { presets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { UpdatePresetSchema } from "@/lib/models/dto";

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
      return NextResponse.json({ error: "Preset ID is required" }, { status: 400 });
    }

    const preset = await db
      .select()
      .from(presets)
      .where(
        and(
          eq(presets.id, params.id),
          eq(presets.userId, userId)
        )
      )
      .limit(1);

    if (preset.length === 0) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Format response
    const formattedPreset = {
      ...preset[0],
      description: preset[0].description ?? undefined,
      createdAt: preset[0].createdAt.toISOString(),
      updatedAt: preset[0].updatedAt.toISOString(),
    };

    return NextResponse.json({ data: formattedPreset }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/presets/[id]] Database error:", error);
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
      return NextResponse.json({ error: "Preset ID is required" }, { status: 400 });
    }

    const json = await req.json();
    
    // Validate input data
    const validatedData = UpdatePresetSchema.parse(json);

    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const updated = await db
      .update(presets)
      .set(updateData)
      .where(
        and(
          eq(presets.id, params.id),
          eq(presets.userId, userId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Format response
    const formattedPreset = {
      ...updated[0],
      description: updated[0].description ?? undefined,
      createdAt: updated[0].createdAt.toISOString(),
      updatedAt: updated[0].updatedAt.toISOString(),
    };

    return NextResponse.json({ data: formattedPreset }, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/presets/[id]] Error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }
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
      return NextResponse.json({ error: "Preset ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(presets)
      .where(
        and(
          eq(presets.id, params.id),
          eq(presets.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    return NextResponse.json({ data: deleted[0] }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/presets/[id]] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
