import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Habit, HabitLog } from "@/models/Habit";

// POST - Toggle hábito completado para hoy
export async function POST(
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

    // Verificar que el hábito existe
    const habit = await Habit.findOne({
      _id: id,
      ownerId: session.user.id,
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Fecha de hoy (sin hora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar log de hoy
    const existingLog = await HabitLog.findOne({
      habitId: id,
      ownerId: session.user.id,
      date: today,
    });

    if (existingLog) {
      // Si existe, eliminar (toggle off)
      await HabitLog.deleteOne({ _id: existingLog._id });
      
      // Actualizar streak
      await updateStreak(id, session.user.id);

      return NextResponse.json({ completed: false, message: "Habit unchecked" });
    } else {
      // Si no existe, crear (toggle on)
      await HabitLog.create({
        habitId: id,
        ownerId: session.user.id,
        date: today,
        completed: true,
      });

      // Actualizar streak
      await updateStreak(id, session.user.id);

      return NextResponse.json({ completed: true, message: "Habit completed!" });
    }
  } catch (error) {
    console.error("POST /api/habits/[id]/toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Función para calcular y actualizar el streak
async function updateStreak(habitId: string, ownerId: string) {
  const logs = await HabitLog.find({
    habitId,
    ownerId,
    completed: true,
  })
    .sort({ date: -1 })
    .lean();

  if (logs.length === 0) {
    await Habit.updateOne({ _id: habitId }, { currentStreak: 0 });
    return;
  }

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calcular streak actual
  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date);
    logDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (logDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Actualizar habit
  const habit = await Habit.findById(habitId);
  if (habit) {
    const longestStreak = Math.max(habit.longestStreak, currentStreak);
    await Habit.updateOne(
      { _id: habitId },
      { currentStreak, longestStreak }
    );
  }
}
