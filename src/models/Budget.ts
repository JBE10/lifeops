import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface IBudget {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  category: string;
  amount: number;
  currency: string;
  period: "monthly" | "weekly" | "yearly";
  month?: number; // 1-12
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ARS" },
    period: { type: String, enum: ["monthly", "weekly", "yearly"], default: "monthly" },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

// Índice único para evitar duplicados
BudgetSchema.index({ ownerId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export const Budget: Model<IBudget> =
  models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
