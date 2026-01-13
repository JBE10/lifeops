import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Asset } from "@/models/Asset";

// GET - Listar activos del usuario
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const assets = await Asset.find({ ownerId: session.user.id })
      .sort({ type: 1, symbol: 1 })
      .lean();

    return NextResponse.json(assets);
  } catch (error) {
    console.error("GET /api/finance/assets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Agregar activo
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, symbol, name, quantity, avgBuyPrice, currency, exchange, notes } = body;

    if (!type || !symbol || !name || quantity === undefined || avgBuyPrice === undefined) {
      return NextResponse.json(
        { error: "type, symbol, name, quantity, avgBuyPrice required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Upsert - si existe, actualizar cantidad y precio promedio
    const existing = await Asset.findOne({
      ownerId: session.user.id,
      type,
      symbol: symbol.toUpperCase(),
    });

    if (existing) {
      // Calcular nuevo precio promedio ponderado
      const totalQuantity = existing.quantity + quantity;
      const newAvgPrice =
        (existing.quantity * existing.avgBuyPrice + quantity * avgBuyPrice) / totalQuantity;

      existing.quantity = totalQuantity;
      existing.avgBuyPrice = newAvgPrice;
      if (notes) existing.notes = notes;
      if (exchange) existing.exchange = exchange;
      await existing.save();

      return NextResponse.json(existing);
    }

    const asset = await Asset.create({
      ownerId: session.user.id,
      type,
      symbol: symbol.toUpperCase(),
      name,
      quantity,
      avgBuyPrice,
      currency: currency || "USD",
      exchange,
      notes,
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("POST /api/finance/assets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
