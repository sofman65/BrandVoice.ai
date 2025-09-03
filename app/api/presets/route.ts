import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { presets } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { CreatePresetSchema } from "@/lib/models/dto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPresets = await db
      .select()
      .from(presets)
      .where(eq(presets.userId, userId))
      .orderBy(desc(presets.createdAt));

    // Convert null to undefined for consistency with Zod schemas
    const formattedPresets = userPresets.map(preset => ({
      ...preset,
      description: preset.description ?? undefined,
      createdAt: preset.createdAt.toISOString(),
      updatedAt: preset.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: formattedPresets }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/presets] Database error:", error);
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
    
    // Validate input data
    const validatedData = CreatePresetSchema.parse(json);
    
    const record = {
      id: crypto.randomUUID(),
      userId,
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await db.insert(presets).values(record).returning();

    // Format response
    const formattedPreset = {
      ...inserted[0],
      description: inserted[0].description ?? undefined,
      createdAt: inserted[0].createdAt.toISOString(),
      updatedAt: inserted[0].updatedAt.toISOString(),
    };

    return NextResponse.json({ data: formattedPreset }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/presets] Error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { id } = json;

    if (!id) {
      return NextResponse.json({ error: "Preset ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(presets)
      .where(eq(presets.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/presets] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
