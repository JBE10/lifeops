import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Budget } from "@/models/Budget";

// GET - Listar budgets
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;

    await dbConnect();

    const query: Record<string, unknown> = { ownerId: session.user.id, year };
    if (month) query.month = month;

    const budgets = await Budget.find(query).sort({ category: 1 }).lean();

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("GET /api/finance/budgets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Crear o actualizar budget
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, amount, year, month, currency } = body;

    if (!category || amount === undefined || !year) {
      return NextResponse.json({ error: "category, amount, year required" }, { status: 400 });
    }

    await dbConnect();

    // Upsert - crear o actualizar si ya existe
    const budget = await Budget.findOneAndUpdate(
      {
        ownerId: session.user.id,
        category,
        month: month || null,
        year,
      },
      {
        ownerId: session.user.id,
        category,
        amount: Math.abs(amount),
        currency: currency || "ARS",
        month: month || null,
        year,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("POST /api/finance/budgets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
