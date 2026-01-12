import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface ISprint {
  _id?: Types.ObjectId;
  name: string;
  goal?: string;
  ownerId: Types.ObjectId;
  projectId?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: "planning" | "active" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}

const SprintSchema = new Schema<ISprint>(
  {
    name: { type: String, required: true },
    goal: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["planning", "active", "completed"],
      default: "planning",
    },
  },
  { timestamps: true }
);

// Solo puede haber un sprint activo por usuario
SprintSchema.index({ ownerId: 1, status: 1 });

export const Sprint: Model<ISprint> =
  models.Sprint || mongoose.model<ISprint>("Sprint", SprintSchema);
