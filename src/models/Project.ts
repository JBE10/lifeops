import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface IProject {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  ownerId: Types.ObjectId;
  status: "active" | "archived";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  models.Project || mongoose.model<IProject>("Project", ProjectSchema);
