import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface IKeyResult {
  _id?: Types.ObjectId;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string; // ej: "%", "unidades", "horas", "$"
  startValue?: number;
}

export interface IOKR {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  objective: string;
  description?: string;
  quarter: string; // ej: "Q1-2026", "Q2-2026"
  year: number;
  status: "draft" | "active" | "completed" | "cancelled";
  keyResults: IKeyResult[];
  createdAt?: Date;
  updatedAt?: Date;
}

const KeyResultSchema = new Schema<IKeyResult>({
  title: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: "%" },
  startValue: { type: Number, default: 0 },
});

const OKRSchema = new Schema<IOKR>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    objective: { type: String, required: true },
    description: { type: String },
    quarter: { type: String, required: true }, // Q1, Q2, Q3, Q4
    year: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
    },
    keyResults: [KeyResultSchema],
  },
  { timestamps: true }
);

// Índice para buscar por trimestre
OKRSchema.index({ ownerId: 1, year: 1, quarter: 1 });

export const OKR: Model<IOKR> =
  models.OKR || mongoose.model<IOKR>("OKR", OKRSchema);
