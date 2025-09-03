import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { voices } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { CreateVoiceSchema } from "@/lib/models/dto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userVoices = await db
      .select()
      .from(voices)
      .where(eq(voices.userId, userId))
      .orderBy(desc(voices.createdAt));

    // Convert null to undefined for consistency with Zod schemas
    const formattedVoices = userVoices.map(voice => ({
      ...voice,
      tone: voice.tone ?? undefined,
      style: voice.style ?? undefined,
      vocabulary: voice.vocabulary ?? undefined,
      audience: voice.audience ?? undefined,
      cta: voice.cta ?? undefined,
      hashtags: voice.hashtags ?? undefined,
      createdAt: voice.createdAt.toISOString(),
      updatedAt: voice.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: formattedVoices }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/voices] Database error:", error);
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
    const validatedData = CreateVoiceSchema.parse(json);
    
    const record = {
      id: crypto.randomUUID(),
      userId,
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await db.insert(voices).values(record).returning();

    // Format response
    const formattedVoice = {
      ...inserted[0],
      tone: inserted[0].tone ?? undefined,
      style: inserted[0].style ?? undefined,
      vocabulary: inserted[0].vocabulary ?? undefined,
      audience: inserted[0].audience ?? undefined,
      cta: inserted[0].cta ?? undefined,
      hashtags: inserted[0].hashtags ?? undefined,
      createdAt: inserted[0].createdAt.toISOString(),
      updatedAt: inserted[0].updatedAt.toISOString(),
    };

    return NextResponse.json({ data: formattedVoice }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/voices] Error:", error);
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
      return NextResponse.json({ error: "Voice ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(voices)
      .where(eq(voices.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/voices] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
