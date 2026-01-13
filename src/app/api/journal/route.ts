import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { JournalEntry } from "@/models/Journal";

// GET - Listar entradas del diario
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30");
    const page = parseInt(searchParams.get("page") || "1");
    const tag = searchParams.get("tag");
    const mood = searchParams.get("mood");

    await dbConnect();

    const query: Record<string, unknown> = { ownerId: session.user.id };
    if (tag) query.tags = tag;
    if (mood) query.mood = mood;

    const entries = await JournalEntry.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await JournalEntry.countDocuments(query);

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/journal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Crear entrada
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, mood, tags, date } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await dbConnect();

    const entry = await JournalEntry.create({
      ownerId: session.user.id,
      date: date ? new Date(date) : new Date(),
      title: title?.trim(),
      content: content.trim(),
      mood,
      tags: tags || [],
      isPrivate: true,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/journal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
