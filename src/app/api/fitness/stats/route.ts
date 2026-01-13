import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Workout } from "@/models/Workout";
import mongoose from "mongoose";

// GET - Estadísticas de fitness
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    await dbConnect();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const ownerId = new mongoose.Types.ObjectId(session.user.id);

    // Estadísticas del período
    const stats = await Workout.aggregate([
      {
        $match: {
          ownerId: ownerId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
          totalCalories: { $sum: { $ifNull: ["$calories", 0] } },
          avgDuration: { $avg: "$duration" },
        },
      },
    ]);

    // Workouts por tipo
    const byType = await Workout.aggregate([
      {
        $match: {
          ownerId: ownerId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
        },
      },
    ]);

    // Workouts por día de la semana
    const byDayOfWeek = await Workout.aggregate([
      {
        $match: {
          ownerId: ownerId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = stats[0] || {
      totalWorkouts: 0,
      totalDuration: 0,
      totalCalories: 0,
      avgDuration: 0,
    };

    return NextResponse.json({
      period: `${days} días`,
      ...result,
      byType,
      byDayOfWeek,
    });
  } catch (error) {
    console.error("GET /api/fitness/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
