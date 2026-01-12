"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Habit {
  _id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      setHabits(data);
    } catch {
      console.error("Error fetching habits");
    } finally {
      setLoading(false);
    }
  }

  async function toggleHabit(habitId: string) {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h._id === habitId ? { ...h, completedToday: !h.completedToday } : h
      )
    );

    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
      });
      
      if (res.ok) {
        // Refresh to get updated streak
        fetchHabits();
      }
    } catch {
      // Revert on error
      fetchHabits();
    }
  }

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
              Hábitos
            </h1>
          </div>
          <Link
            href="/habits/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            + Nuevo Hábito
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Progress */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">Progreso de hoy</p>
              <p className="text-4xl font-bold mt-1">
                {completedCount}/{totalCount}
              </p>
              <p className="text-purple-200 text-sm mt-1">hábitos completados</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${completionPercent * 2.51} 251`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                {completionPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No tenés hábitos todavía
            </p>
            <Link
              href="/habits/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear tu primer hábito →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit._id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition ${
                  habit.completedToday ? "ring-2 ring-green-500" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleHabit(habit._id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition ${
                      habit.completedToday
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    style={{ backgroundColor: habit.completedToday ? habit.color : undefined }}
                  >
                    {habit.completedToday ? "✓" : habit.icon}
                  </button>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      habit.completedToday 
                        ? "text-gray-400 line-through" 
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {habit.name}
                    </h3>
                    {habit.description && (
                      <p className="text-gray-500 text-sm">{habit.description}</p>
                    )}
                  </div>

                  {/* Streak */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-500">
                      <span className="text-lg">🔥</span>
                      <span className="font-bold">{habit.currentStreak}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Mejor: {habit.longestStreak}
                    </p>
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
