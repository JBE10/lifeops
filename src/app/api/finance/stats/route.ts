import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Transaction } from "@/models/Transaction";
import { Budget } from "@/models/Budget";
import { Types } from "mongoose";

// GET - Estadísticas financieras
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM
    
    const now = new Date();
    let year: number, m: number;
    
    if (month) {
      [year, m] = month.split("-").map(Number);
    } else {
      year = now.getFullYear();
      m = now.getMonth() + 1;
    }

    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59);

    await dbConnect();

    const ownerId = new Types.ObjectId(session.user.id);

    // Totales por tipo
    const totals = await Transaction.aggregate([
      {
        $match: {
          ownerId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Por categoría
    const byCategory = await Transaction.aggregate([
      {
        $match: {
          ownerId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { type: "$type", category: "$category" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Budgets del mes
    const budgets = await Budget.find({
      ownerId: session.user.id,
      $or: [
        { month: m, year },
        { month: null, year }, // Yearly budgets
      ],
    }).lean();

    // Gastos por categoría para comparar con budgets
    const expensesByCategory = byCategory
      .filter((item) => item._id.type === "expense")
      .reduce((acc, item) => {
        acc[item._id.category] = item.total;
        return acc;
      }, {} as Record<string, number>);

    // Calcular progreso de budgets
    const budgetProgress = budgets.map((budget) => ({
      ...budget,
      spent: expensesByCategory[budget.category] || 0,
      remaining: budget.amount - (expensesByCategory[budget.category] || 0),
      percentage: Math.round(
        ((expensesByCategory[budget.category] || 0) / budget.amount) * 100
      ),
    }));

    const income = totals.find((t) => t._id === "income")?.total || 0;
    const expenses = totals.find((t) => t._id === "expense")?.total || 0;

    return NextResponse.json({
      period: { month: m, year, startDate, endDate },
      summary: {
        income,
        expenses,
        balance: income - expenses,
        transactionCount:
          totals.reduce((acc, t) => acc + t.count, 0),
      },
      byCategory: {
        income: byCategory
          .filter((item) => item._id.type === "income")
          .map((item) => ({ category: item._id.category, total: item.total, count: item.count })),
        expenses: byCategory
          .filter((item) => item._id.type === "expense")
          .map((item) => ({ category: item._id.category, total: item.total, count: item.count })),
      },
      budgets: budgetProgress,
    });
  } catch (error) {
    console.error("GET /api/finance/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
