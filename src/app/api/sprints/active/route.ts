import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Sprint } from "@/models/Sprint";
import { Task } from "@/models/Task";

// GET - Obtener sprint activo con tareas
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const sprint = await Sprint.findOne({
      ownerId: session.user.id,
      status: "active",
    }).populate("projectId", "name");

    if (!sprint) {
      return NextResponse.json({ sprint: null, tasks: [] });
    }

    const tasks = await Task.find({
      sprintId: sprint._id,
      ownerId: session.user.id,
    })
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ sprint, tasks });
  } catch (error) {
    console.error("GET /api/sprints/active error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
