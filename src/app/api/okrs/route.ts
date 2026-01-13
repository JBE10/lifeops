import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { OKR } from "@/models/OKR";

// GET - Listar OKRs (filtrar por quarter/year)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get("quarter");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    await dbConnect();

    const query: Record<string, unknown> = { ownerId: session.user.id };
    if (quarter) query.quarter = quarter;
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const okrs = await OKR.find(query)
      .sort({ year: -1, quarter: -1, createdAt: -1 })
      .lean();

    // Calcular progreso de cada OKR
    const okrsWithProgress = okrs.map((okr) => {
      const keyResults = okr.keyResults || [];
      if (keyResults.length === 0) {
        return { ...okr, progress: 0 };
      }

      const totalProgress = keyResults.reduce((sum, kr) => {
        const range = kr.targetValue - (kr.startValue || 0);
        if (range === 0) return sum + 100;
        const progress = ((kr.currentValue - (kr.startValue || 0)) / range) * 100;
        return sum + Math.min(Math.max(progress, 0), 100);
      }, 0);

      return {
        ...okr,
        progress: Math.round(totalProgress / keyResults.length),
      };
    });

    return NextResponse.json(okrsWithProgress);
  } catch (error) {
    console.error("GET /api/okrs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Crear OKR
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { objective, description, quarter, year, keyResults } = body;

    if (!objective?.trim() || !quarter || !year) {
      return NextResponse.json(
        { error: "Objective, quarter and year are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const okr = await OKR.create({
      ownerId: session.user.id,
      objective: objective.trim(),
      description: description?.trim(),
      quarter,
      year,
      keyResults: keyResults || [],
      status: "draft",
    });

    return NextResponse.json(okr, { status: 201 });
  } catch (error) {
    console.error("POST /api/okrs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
