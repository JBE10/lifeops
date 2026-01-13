import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { OKR } from "@/models/OKR";

// GET - Obtener OKR por ID
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

    const okr = await OKR.findOne({
      _id: id,
      ownerId: session.user.id,
    }).lean();

    if (!okr) {
      return NextResponse.json({ error: "OKR not found" }, { status: 404 });
    }

    return NextResponse.json(okr);
  } catch (error) {
    console.error("GET /api/okrs/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Actualizar OKR
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
    const { objective, description, quarter, year, status, keyResults } = body;

    await dbConnect();

    const updateData: Record<string, unknown> = {};
    if (objective !== undefined) updateData.objective = objective.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (quarter !== undefined) updateData.quarter = quarter;
    if (year !== undefined) updateData.year = year;
    if (status !== undefined) updateData.status = status;
    if (keyResults !== undefined) updateData.keyResults = keyResults;

    const okr = await OKR.findOneAndUpdate(
      { _id: id, ownerId: session.user.id },
      updateData,
      { new: true }
    );

    if (!okr) {
      return NextResponse.json({ error: "OKR not found" }, { status: 404 });
    }

    return NextResponse.json(okr);
  } catch (error) {
    console.error("PUT /api/okrs/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Eliminar OKR
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

    const okr = await OKR.findOneAndDelete({
      _id: id,
      ownerId: session.user.id,
    });

    if (!okr) {
      return NextResponse.json({ error: "OKR not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "OKR deleted" });
  } catch (error) {
    console.error("DELETE /api/okrs/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
