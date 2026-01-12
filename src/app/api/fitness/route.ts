import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Workout } from "@/models/Workout";

// GET - Listar workouts (con paginación)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const type = searchParams.get("type");

    await dbConnect();

    const query: Record<string, unknown> = { ownerId: session.user.id };
    if (type) query.type = type;

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Workout.countDocuments(query);

    return NextResponse.json({
      workouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/fitness error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Crear workout
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, name, date, duration, calories, exercises, notes, feeling } = body;

    if (!name?.trim() || !duration) {
      return NextResponse.json(
        { error: "Name and duration are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const workout = await Workout.create({
      ownerId: session.user.id,
      type: type || "strength",
      name: name.trim(),
      date: date ? new Date(date) : new Date(),
      duration,
      calories,
      exercises: exercises || [],
      notes: notes?.trim(),
      feeling,
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("POST /api/fitness error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
