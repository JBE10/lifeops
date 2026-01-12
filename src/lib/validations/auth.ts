import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre mínimo 2 caracteres").max(50, "Nombre máximo 50 caracteres").optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Password mínimo 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Password requerido"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
