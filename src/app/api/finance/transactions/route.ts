import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Transaction } from "@/models/Transaction";

// GET - Listar transacciones
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const type = searchParams.get("type"); // income | expense
    const category = searchParams.get("category");
    const month = searchParams.get("month"); // YYYY-MM
    
    await dbConnect();

    const query: Record<string, unknown> = { ownerId: session.user.id };
    if (type) query.type = type;
    if (category) query.category = category;
    
    if (month) {
      const [year, m] = month.split("-").map(Number);
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return NextResponse.json({
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/finance/transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Crear transacción
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, category, description, date, paymentMethod, tags, currency } = body;

    if (!type || !amount || !category) {
      return NextResponse.json({ error: "type, amount, category required" }, { status: 400 });
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json({ error: "type must be income or expense" }, { status: 400 });
    }

    await dbConnect();

    const transaction = await Transaction.create({
      ownerId: session.user.id,
      type,
      amount: Math.abs(amount),
      currency: currency || "ARS",
      category,
      description: description?.trim(),
      date: date ? new Date(date) : new Date(),
      paymentMethod,
      tags: tags || [],
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/finance/transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
