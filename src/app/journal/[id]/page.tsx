"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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

export default function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/journal/${id}`)
      .then((r) => r.json())
      .then(setEntry)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function deleteEntry() {
    if (!confirm("¿Eliminar esta entrada?")) return;

    try {
      await fetch(`/api/journal/${id}`, { method: "DELETE" });
      router.push("/journal");
    } catch {
      console.error("Error deleting entry");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Entrada no encontrada</p>
      </div>
    );
  }

  const date = new Date(entry.date);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/journal"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Journal
              </Link>
            </div>
            <button
              onClick={deleteEntry}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          {/* Date & Mood */}
          <div className="flex items-center gap-3 mb-6">
            <p className="text-gray-500 capitalize">
              {date.toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {entry.mood && (
              <span className="flex items-center gap-1 text-2xl" title={moodLabels[entry.mood]}>
                {moodEmojis[entry.mood]}
              </span>
            )}
          </div>

          {/* Title */}
          {entry.title && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {entry.title}
            </h1>
          )}

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none">
            {entry.content.split("\n").map((paragraph, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {entry.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
