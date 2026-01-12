import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Workout } from "@/models/Workout";

// GET - Obtener workout por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const workout = await Workout.findOne({
      _id: id,
      ownerId: session.user.id,
    }).lean();

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error("GET /api/fitness/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Actualizar workout
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { type, name, date, duration, calories, exercises, notes, feeling } = body;

    await dbConnect();

    const updateData: Record<string, unknown> = {};
    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name.trim();
    if (date !== undefined) updateData.date = new Date(date);
    if (duration !== undefined) updateData.duration = duration;
    if (calories !== undefined) updateData.calories = calories;
    if (exercises !== undefined) updateData.exercises = exercises;
    if (notes !== undefined) updateData.notes = notes?.trim();
    if (feeling !== undefined) updateData.feeling = feeling;

    const workout = await Workout.findOneAndUpdate(
      { _id: id, ownerId: session.user.id },
      updateData,
      { new: true }
    );

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error("PUT /api/fitness/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Eliminar workout
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const workout = await Workout.findOneAndDelete({
      _id: id,
      ownerId: session.user.id,
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Workout deleted" });
  } catch (error) {
    console.error("DELETE /api/fitness/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
