"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface JournalEntry {
  _id: string;
  date: string;
  title?: string;
  content: string;
  mood?: string;
  tags?: string[];
}

const moodEmojis: Record<string, string> = {
  great: "🤩",
  good: "😊",
  okay: "😐",
  bad: "😔",
  terrible: "😢",
};

const moodLabels: Record<string, string> = {
  great: "Increíble",
  good: "Bien",
  okay: "Normal",
  bad: "Mal",
  terrible: "Terrible",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Agrupar por mes
  const entriesByMonth = entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

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
              Journal
            </h1>
          </div>
          <Link
            href="/journal/new"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition"
          >
            + Nueva Entrada
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {entries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📓</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Tu diario está vacío
            </p>
            <Link
              href="/journal/new"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Escribir tu primera entrada →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(entriesByMonth).map(([month, monthEntries]) => {
              const [year, monthNum] = month.split("-");
              const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString("es-AR", {
                month: "long",
                year: "numeric",
              });

              return (
                <div key={month}>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                    {monthName}
                  </h2>
                  <div className="space-y-4">
                    {monthEntries.map((entry) => (
                      <Link
                        key={entry._id}
                        href={`/journal/${entry._id}`}
                        className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500">
                                {new Date(entry.date).toLocaleDateString("es-AR", {
                                  weekday: "long",
                                  day: "numeric",
                                })}
                              </span>
                              {entry.mood && (
                                <span title={moodLabels[entry.mood]}>
                                  {moodEmojis[entry.mood]}
                                </span>
                              )}
                            </div>
                            {entry.title && (
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                {entry.title}
                              </h3>
                            )}
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                              {entry.content}
                            </p>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {entry.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
