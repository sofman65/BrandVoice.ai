import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { voices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { UpdateVoiceSchema } from "@/lib/models/dto";

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
      return NextResponse.json({ error: "Voice ID is required" }, { status: 400 });
    }

    const voice = await db
      .select()
      .from(voices)
      .where(
        and(
          eq(voices.id, params.id),
          eq(voices.userId, userId)
        )
      )
      .limit(1);

    if (voice.length === 0) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 });
    }

    // Format response
    const formattedVoice = {
      ...voice[0],
      tone: voice[0].tone ?? undefined,
      style: voice[0].style ?? undefined,
      vocabulary: voice[0].vocabulary ?? undefined,
      audience: voice[0].audience ?? undefined,
      cta: voice[0].cta ?? undefined,
      hashtags: voice[0].hashtags ?? undefined,
      createdAt: voice[0].createdAt.toISOString(),
      updatedAt: voice[0].updatedAt.toISOString(),
    };

    return NextResponse.json({ data: formattedVoice }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/voices/[id]] Database error:", error);
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
      return NextResponse.json({ error: "Voice ID is required" }, { status: 400 });
    }

    const json = await req.json();
    
    // Validate input data
    const validatedData = UpdateVoiceSchema.parse(json);

    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const updated = await db
      .update(voices)
      .set(updateData)
      .where(
        and(
          eq(voices.id, params.id),
          eq(voices.userId, userId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 });
    }

    // Format response
    const formattedVoice = {
      ...updated[0],
      tone: updated[0].tone ?? undefined,
      style: updated[0].style ?? undefined,
      vocabulary: updated[0].vocabulary ?? undefined,
      audience: updated[0].audience ?? undefined,
      cta: updated[0].cta ?? undefined,
      hashtags: updated[0].hashtags ?? undefined,
      createdAt: updated[0].createdAt.toISOString(),
      updatedAt: updated[0].updatedAt.toISOString(),
    };

    return NextResponse.json({ data: formattedVoice }, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/voices/[id]] Error:", error);
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
      return NextResponse.json({ error: "Voice ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(voices)
      .where(
        and(
          eq(voices.id, params.id),
          eq(voices.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 });
    }

    return NextResponse.json({ data: deleted[0] }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/voices/[id]] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
