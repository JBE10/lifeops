import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface IJournalEntry {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  date: Date;
  title?: string;
  content: string;
  mood?: "great" | "good" | "okay" | "bad" | "terrible";
  tags?: string[];
  isPrivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    title: { type: String },
    content: { type: String, required: true },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "bad", "terrible"],
    },
    tags: [{ type: String }],
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Índice para buscar por fecha
JournalEntrySchema.index({ ownerId: 1, date: -1 });

export const JournalEntry: Model<IJournalEntry> =
  models.JournalEntry || mongoose.model<IJournalEntry>("JournalEntry", JournalEntrySchema);
