import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Sprint } from "@/models/Sprint";

// GET - Listar sprints
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    await dbConnect();

    const query: Record<string, unknown> = { ownerId: session.user.id };
    if (status) query.status = status;

    const sprints = await Sprint.find(query)
      .sort({ startDate: -1 })
      .populate("projectId", "name")
      .lean();

    return NextResponse.json(sprints);
  } catch (error) {
    console.error("GET /api/sprints error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Crear sprint
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, goal, projectId, startDate, endDate } = body;

    if (!name?.trim() || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Name, startDate and endDate are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const sprint = await Sprint.create({
      name: name.trim(),
      goal: goal?.trim(),
      ownerId: session.user.id,
      projectId: projectId || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "planning",
    });

    return NextResponse.json(sprint, { status: 201 });
  } catch (error) {
    console.error("POST /api/sprints error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
