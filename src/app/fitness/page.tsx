"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Workout {
  _id: string;
  type: string;
  name: string;
  date: string;
  duration: number;
  calories?: number;
  exercises: { name: string; sets?: number; reps?: number; weight?: number }[];
  feeling?: string;
}

interface Stats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  avgDuration: number;
}

const typeIcons: Record<string, string> = {
  strength: "🏋️",
  cardio: "🏃",
  flexibility: "🧘",
  sports: "⚽",
  other: "💪",
};

const typeLabels: Record<string, string> = {
  strength: "Fuerza",
  cardio: "Cardio",
  flexibility: "Flexibilidad",
  sports: "Deportes",
  other: "Otro",
};

const feelingEmojis: Record<string, string> = {
  great: "🔥",
  good: "💪",
  okay: "👍",
  tired: "😓",
  bad: "😫",
};

export default function FitnessPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/fitness").then((r) => r.json()),
      fetch("/api/fitness/stats?days=30").then((r) => r.json()),
    ])
      .then(([workoutData, statsData]) => {
        setWorkouts(workoutData.workouts || []);
        setStats(statsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fitness
            </h1>
          </div>
          <Link
            href="/fitness/new"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
          >
            + Log Workout
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Workouts (30 días)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalWorkouts}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Tiempo total</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats.totalDuration / 60)}h
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Calorías quemadas</p>
              <p className="text-3xl font-bold text-orange-500">
                {stats.totalCalories.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Promedio/workout</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats.avgDuration)} min
              </p>
            </div>
          </div>
        )}

        {/* Workouts List */}
        {workouts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No hay workouts registrados
            </p>
            <Link
              href="/fitness/new"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Registrar tu primer workout →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">
                      {typeIcons[workout.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {workout.name}
                        </h3>
                        {workout.feeling && (
                          <span>{feelingEmojis[workout.feeling]}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{typeLabels[workout.type]}</span>
                        <span>•</span>
                        <span>{workout.duration} min</span>
                        {workout.calories && (
                          <>
                            <span>•</span>
                            <span>{workout.calories} cal</span>
                          </>
                        )}
                      </div>
                      {workout.exercises.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {workout.exercises.slice(0, 4).map((ex, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                            >
                              {ex.name}
                              {ex.sets && ex.reps && ` ${ex.sets}x${ex.reps}`}
                              {ex.weight && ` @${ex.weight}kg`}
                            </span>
                          ))}
                          {workout.exercises.length > 4 && (
                            <span className="text-xs text-gray-400">
                              +{workout.exercises.length - 4} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    {new Date(workout.date).toLocaleDateString("es-AR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
