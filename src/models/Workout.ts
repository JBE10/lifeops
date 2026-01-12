import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface IExercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number; // en kg
  duration?: number; // en minutos
  distance?: number; // en km
  notes?: string;
}

export interface IWorkout {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  type: "strength" | "cardio" | "flexibility" | "sports" | "other";
  name: string;
  date: Date;
  duration: number; // en minutos
  calories?: number;
  exercises: IExercise[];
  notes?: string;
  feeling?: "great" | "good" | "okay" | "tired" | "bad";
  createdAt?: Date;
  updatedAt?: Date;
}

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  weight: { type: Number },
  duration: { type: Number },
  distance: { type: Number },
  notes: { type: String },
});

const WorkoutSchema = new Schema<IWorkout>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "sports", "other"],
      default: "strength",
    },
    name: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    duration: { type: Number, required: true },
    calories: { type: Number },
    exercises: [ExerciseSchema],
    notes: { type: String },
    feeling: {
      type: String,
      enum: ["great", "good", "okay", "tired", "bad"],
    },
  },
  { timestamps: true }
);

// Índice para buscar por fecha
WorkoutSchema.index({ ownerId: 1, date: -1 });

export const Workout: Model<IWorkout> =
  models.Workout || mongoose.model<IWorkout>("Workout", WorkoutSchema);
