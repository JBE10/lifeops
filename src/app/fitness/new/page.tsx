"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
}

const workoutTypes = [
  { id: "strength", label: "Fuerza", icon: "🏋️" },
  { id: "cardio", label: "Cardio", icon: "🏃" },
  { id: "flexibility", label: "Flexibilidad", icon: "🧘" },
  { id: "sports", label: "Deportes", icon: "⚽" },
  { id: "other", label: "Otro", icon: "💪" },
];

const feelings = [
  { id: "great", label: "Increíble", emoji: "🔥" },
  { id: "good", label: "Bien", emoji: "💪" },
  { id: "okay", label: "Normal", emoji: "👍" },
  { id: "tired", label: "Cansado", emoji: "😓" },
  { id: "bad", label: "Mal", emoji: "😫" },
];

export default function NewWorkoutPage() {
  const router = useRouter();
  const [type, setType] = useState("strength");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(45);
  const [calories, setCalories] = useState<number | "">("");
  const [feeling, setFeeling] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exercise form
  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState<number | "">("");
  const [exReps, setExReps] = useState<number | "">("");
  const [exWeight, setExWeight] = useState<number | "">("");

  function addExercise() {
    if (!exName.trim()) return;
    setExercises([
      ...exercises,
      {
        name: exName.trim(),
        sets: exSets || undefined,
        reps: exReps || undefined,
        weight: exWeight || undefined,
      },
    ]);
    setExName("");
    setExSets("");
    setExReps("");
    setExWeight("");
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/fitness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          duration,
          calories: calories || undefined,
          feeling: feeling || undefined,
          notes: notes || undefined,
          exercises,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al guardar workout");
        return;
      }

      router.push("/fitness");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/fitness"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Fitness
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Log Workout
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Workout Type */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de workout
            </label>
            <div className="grid grid-cols-5 gap-2">
              {workoutTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-3 rounded-lg text-center transition ${
                    type === t.id
                      ? "bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del workout *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Upper Body, Leg Day, Running..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duración (min) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Calorías (opcional)
                </label>
                <input
                  type="number"
                  min={0}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="Estimado"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Ejercicios
            </label>

            {/* Exercise List */}
            {exercises.length > 0 && (
              <div className="space-y-2 mb-4">
                {exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{ex.name}</span>
                      {ex.sets && ex.reps && (
                        <span className="text-gray-500 ml-2">
                          {ex.sets}x{ex.reps}
                          {ex.weight && ` @${ex.weight}kg`}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExercise(i)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Exercise Form */}
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={exName}
                onChange={(e) => setExName(e.target.value)}
                placeholder="Ejercicio"
                className="col-span-4 sm:col-span-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="number"
                value={exSets}
                onChange={(e) => setExSets(e.target.value ? parseInt(e.target.value) : "")}
                placeholder="Sets"
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="number"
                value={exReps}
                onChange={(e) => setExReps(e.target.value ? parseInt(e.target.value) : "")}
                placeholder="Reps"
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="number"
                value={exWeight}
                onChange={(e) => setExWeight(e.target.value ? parseInt(e.target.value) : "")}
                placeholder="Kg"
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addExercise}
              className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              + Agregar ejercicio
            </button>
          </div>

          {/* Feeling */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              ¿Cómo te sentiste?
            </label>
            <div className="flex gap-2">
              {feelings.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFeeling(feeling === f.id ? "" : f.id)}
                  className={`flex-1 p-3 rounded-lg text-center transition ${
                    feeling === f.id
                      ? "bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{f.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas (opcional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Algo que quieras recordar?"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition"
            >
              {loading ? "Guardando..." : "💪 Guardar Workout"}
            </button>
            <Link
              href="/fitness"
              className="py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
