import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface ITask {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  ownerId: Types.ObjectId;
  projectId?: Types.ObjectId;
  sprintId?: Types.ObjectId;
  status: "backlog" | "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    sprintId: { type: Schema.Types.ObjectId, ref: "Sprint", index: true },
    status: {
      type: String,
      enum: ["backlog", "todo", "in_progress", "done"],
      default: "backlog",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Índice compuesto para queries frecuentes
TaskSchema.index({ ownerId: 1, status: 1 });
TaskSchema.index({ projectId: 1, status: 1 });

export const Task: Model<ITask> =
  models.Task || mongoose.model<ITask>("Task", TaskSchema);
