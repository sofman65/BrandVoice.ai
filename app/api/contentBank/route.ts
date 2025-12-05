import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"
import { contentBank } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/contentBank - Get all content bank items for the user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await db
      .select()
      .from(contentBank)
      .where(eq(contentBank.userId, userId))
      .orderBy(desc(contentBank.createdAt));

    return NextResponse.json({ data: content }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/contentBank] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/contentBank - Create a new content bank item
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { title, url, tags, thumbnail } = json;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    const record = {
      id: crypto.randomUUID(),
      userId,
      title,
      url,
      tags: tags || [],
      thumbnail: thumbnail || null,
    };

    const inserted = await db
      .insert(contentBank)
      .values(record)
      .returning();

    return NextResponse.json({ data: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/contentBank] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE /api/contentBank - Delete a content bank item
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { id } = json;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(contentBank)
      .where(
        and(
          eq(contentBank.id, id),
          eq(contentBank.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: deleted[0] }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/contentBank] Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}