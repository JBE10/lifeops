import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    
    // Validar con Zod
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json({ error: "Datos inválidos", details: errors }, { status: 400 });
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();

    // Verificar si ya existe
    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) {
      return NextResponse.json({ error: "Email ya registrado." }, { status: 409 });
    }

    // Crear usuario
    const passwordHash = await bcrypt.hash(password, 12);
    const created = await User.create({ 
      name: name?.trim(), 
      email: normalizedEmail, 
      passwordHash 
    });

    return NextResponse.json(
      { id: String(created._id), email: created.email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
