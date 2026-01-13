import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface ITransaction {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  type: "income" | "expense";
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: Date;
  paymentMethod?: string;
  tags?: string[];
  isRecurring?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ARS" },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true, index: true },
    paymentMethod: { type: String },
    tags: [{ type: String }],
    isRecurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Índices para queries frecuentes
TransactionSchema.index({ ownerId: 1, date: -1 });
TransactionSchema.index({ ownerId: 1, type: 1 });
TransactionSchema.index({ ownerId: 1, category: 1 });

export const Transaction: Model<ITransaction> =
  models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);

// Categorías predefinidas
export const EXPENSE_CATEGORIES = [
  "Alimentos",
  "Transporte",
  "Vivienda",
  "Servicios",
  "Salud",
  "Entretenimiento",
  "Ropa",
  "Educación",
  "Tecnología",
  "Otros",
];

export const INCOME_CATEGORIES = [
  "Salario",
  "Freelance",
  "Inversiones",
  "Regalos",
  "Ventas",
  "Otros",
];
