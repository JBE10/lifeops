import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Habit, HabitLog } from "@/models/Habit";

// GET - Listar hábitos con estado de hoy
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const habits = await Habit.find({ 
      ownerId: session.user.id,
      isActive: true 
    }).sort({ createdAt: 1 }).lean();

    // Obtener logs de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await HabitLog.find({
      ownerId: session.user.id,
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    const todayLogMap = new Map(
      todayLogs.map((log) => [String(log.habitId), log])
    );

    // Combinar hábitos con estado de hoy
    const habitsWithStatus = habits.map((habit) => ({
      ...habit,
      completedToday: todayLogMap.has(String(habit._id)),
    }));

    return NextResponse.json(habitsWithStatus);
  } catch (error) {
    console.error("GET /api/habits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Crear hábito
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, icon, color, frequency, targetDays } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await dbConnect();

    const habit = await Habit.create({
      name: name.trim(),
      description: description?.trim(),
      icon: icon || "✅",
      color: color || "#3B82F6",
      ownerId: session.user.id,
      frequency: frequency || "daily",
      targetDays: targetDays || [],
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("POST /api/habits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
