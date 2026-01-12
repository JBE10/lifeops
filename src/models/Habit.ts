import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface IHabit {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  ownerId: Types.ObjectId;
  frequency: "daily" | "weekly" | "custom";
  targetDays?: number[]; // 0=Sunday, 1=Monday, etc. For custom frequency
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHabitLog {
  _id?: Types.ObjectId;
  habitId: Types.ObjectId;
  ownerId: Types.ObjectId;
  date: Date;
  completed: boolean;
  notes?: string;
  createdAt?: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String, default: "✅" },
    color: { type: String, default: "#3B82F6" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    frequency: { type: String, enum: ["daily", "weekly", "custom"], default: "daily" },
    targetDays: [{ type: Number }],
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HabitLogSchema = new Schema<IHabitLog>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// Índice compuesto para buscar logs por fecha
HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });
HabitLogSchema.index({ ownerId: 1, date: 1 });

export const Habit: Model<IHabit> =
  models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);

export const HabitLog: Model<IHabitLog> =
  models.HabitLog || mongoose.model<IHabitLog>("HabitLog", HabitLogSchema);
