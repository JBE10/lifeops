import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { OKR } from "@/models/OKR";

// PATCH - Actualizar valor de un Key Result
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; krId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, krId } = await params;
    const body = await req.json();
    const { currentValue } = body;

    if (currentValue === undefined) {
      return NextResponse.json({ error: "currentValue is required" }, { status: 400 });
    }

    await dbConnect();

    const okr = await OKR.findOneAndUpdate(
      { 
        _id: id, 
        ownerId: session.user.id,
        "keyResults._id": krId 
      },
      { 
        $set: { "keyResults.$.currentValue": currentValue } 
      },
      { new: true }
    );

    if (!okr) {
      return NextResponse.json({ error: "OKR or Key Result not found" }, { status: 404 });
    }

    return NextResponse.json(okr);
  } catch (error) {
    console.error("PATCH /api/okrs/[id]/key-results/[krId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
